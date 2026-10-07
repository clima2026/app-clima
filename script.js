// ======================================
// CONFIGURACIÓN
// ======================================
const API_KEY = '01e3e14c1f20027f7fff8417895cfdd1';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const API_PRONOSTICO = 'https://api.openweathermap.org/data/2.5/forecast';

// ======================================
// REFERENCIAS
// ======================================
const formulario = document.getElementById('formulario');
const inputCiudad = document.getElementById('inputCiudad');
const resultado = document.getElementById('resultado');
const estado = document.getElementById('estado');
const historialDiv = document.getElementById('historial');
const botonUbicacion = document.getElementById('botonUbicacion');
const botonTema = document.getElementById('botonTema');

// ======================================
// RETO 3 — TEMA CLARO / OSCURO
// ======================================
botonTema?.addEventListener('click', () => {
    document.body.classList.toggle('tema-claro');
    botonTema.textContent = document.body.classList.contains('tema-claro') ? '🌙 Oscuro' : '☀️ Claro';
});

// ======================================
// RETO 1 — MI UBICACIÓN
// ======================================
botonUbicacion?.addEventListener('click', () => {
    estado.textContent = '🌍 Obteniendo tu ubicación...';
    if (!navigator.geolocation) {
        estado.textContent = '❌ Tu navegador no soporta ubicación';
        return;
    }
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            try {
                const url = `${API_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('No se encontró tu ubicación');
                const datos = await res.json();
                mostrarClima(datos);
                estado.textContent = '✅ Ubicación detectada';
            } catch (err) {
                estado.textContent = `❌ ${err.message}`;
            }
        },
        () => {
            estado.textContent = '❌ Activa la ubicación en tu navegador';
        }
    );
});

// ======================================
// RETO 2 — HISTORIAL DE BÚSQUEDAS
// ======================================
function guardarEnHistorial(ciudad) {
    let historial = JSON.parse(localStorage.getItem('historialClima')) || [];
    historial = historial.filter(c => c !== ciudad);
    historial.unshift(ciudad);
    if (historial.length > 5) historial.pop();
    localStorage.setItem('historialClima', JSON.stringify(historial));
    mostrarHistorial();
}

function mostrarHistorial() {
    if (!historialDiv) return;
    const historial = JSON.parse(localStorage.getItem('historialClima')) || [];
    if (historial.length === 0) {
        historialDiv.innerHTML = '';
        return;
    }
    historialDiv.innerHTML = '<p>📋 Búsquedas recientes:</p>';
    historial.forEach(ciudad => {
        const btn = document.createElement('button');
        btn.textContent = ciudad;
        btn.addEventListener('click', () => {
            inputCiudad.value = ciudad;
            consultarClima(ciudad);
        });
        historialDiv.appendChild(btn);
    });
}

// ======================================
// FUNCIÓN PRINCIPAL — CONSULTAR CLIMA
// ======================================
async function consultarClima(ciudad) {
    estado.textContent = '🌤️ Consultando el clima...';
    resultado.classList.remove('visible');

    try {
        const ciudadCodificada = encodeURIComponent(ciudad);
        const url = `${API_URL}?q=${ciudadCodificada}&appid=${API_KEY}&units=metric&lang=es`;
        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            if (respuesta.status === 404) throw new Error('Ciudad no encontrada');
            else if (respuesta.status === 401) throw new Error('API Key inválida');
            else throw new Error(`Error ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        mostrarClima(datos);
        guardarEnHistorial(datos.name); // ← Guarda en historial
        estado.textContent = '✅ Datos actualizados correctamente.';

    } catch (error) {
        console.error('Error:', error);
        estado.textContent = `❌ ${error.message}. Intenta con otra ciudad.`;
        resultado.classList.remove('visible');
    }
}

// ======================================
// MOSTRAR CLIMA + RETO 4 — COMPARTIR
// ======================================
function mostrarClima(datos) {
    const ciudad = datos.name;
    const pais = datos.sys.country;
    const temperatura = Math.round(datos.main.temp);
    const sensacion = Math.round(datos.main.feels_like);
    const humedad = datos.main.humidity;
    const presion = datos.main.pressure;
    const viento = datos.wind.speed;
    const descripcion = datos.weather[0].description;
    const icono = datos.weather[0].icon;
    const iconoUrl = `https://openweathermap.org/img/wn/${icono}@2x.png`;

    // RETO 4: Enlace para compartir en WhatsApp
    const mensaje = encodeURIComponent(
        `🌤️ El clima en ${ciudad}, ${pais} es de ${temperatura}°C — ${descripcion}`
    );
    const enlaceWhatsApp = `https://wa.me/?text=${mensaje}`;

    resultado.innerHTML = `
        <div class="ciudad">${ciudad}</div>
        <div class="pais">${pais}</div>
        <img src="${iconoUrl}" alt="${descripcion}" class="icono-clima">
        <div class="temperatura">${temperatura}°C</div>
        <div class="descripcion">${descripcion}</div>
        
        <div class="detalles">
            <div class="detalle">
                <div class="etiqueta">Sensación</div>
                <div class="valor">${sensacion}°C</div>
            </div>
            <div class="detalle">
                <div class="etiqueta">Humedad</div>
                <div class="valor">${humedad}%</div>
            </div>
            <div class="detalle">
                <div class="etiqueta">Presión</div>
                <div class="valor">${presion} hPa</div>
            </div>
            <div class="detalle">
                <div class="etiqueta">Viento</div>
                <div class="valor">${viento} m/s</div>
            </div>
        </div>

        <!-- RETO 4: Botón Compartir -->
        <a href="${enlaceWhatsApp}" target="_blank" class="compartir-whatsapp">
            📤 Compartir en WhatsApp
        </a>
    `;

    resultado.classList.add('visible');
    cambiarFondoSegunClima(datos.weather[0].main);
}

// ======================================
// CAMBIAR FONDO SEGÚN EL CLIMA
// ======================================
function cambiarFondoSegunClima(clima) {
    document.body.classList.remove(
        'clima-soleado', 'clima-nublado',
        'clima-lluvioso', 'clima-nieve'
    );

    const c = clima.toLowerCase();
    if (c.includes('clear')) document.body.classList.add('clima-soleado');
    else if (c.includes('cloud')) document.body.classList.add('clima-nublado');
    else if (c.includes('rain') || c.includes('drizzle') || c.includes('thunderstorm'))
        document.body.classList.add('clima-lluvioso');
    else if (c.includes('snow')) document.body.classList.add('clima-nieve');
}

// ======================================
// RETO 5 — PRONÓSTICO DE 5 DÍAS
// ======================================
async function consultarPronostico(ciudad) {
    try {
        const cod = encodeURIComponent(ciudad);
        const url = `${API_PRONOSTICO}?q=${cod}&appid=${API_KEY}&units=metric&lang=es`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('No se pudo obtener el pronóstico');
        const datos = await res.json();
        console.log('📅 Pronóstico de 5 días:', datos);
        // Puedes agregar aquí el código para mostrarlo en pantalla
    } catch (err) {
        console.log('Error en pronóstico:', err);
    }
}

// ======================================
// EVENTO DEL FORMULARIO
// ======================================
formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const ciudad = inputCiudad.value.trim();
    if (!ciudad) {
        estado.textContent = '⚠️ Escribe el nombre de una ciudad.';
        return;
    }
    consultarClima(ciudad);
    consultarPronostico(ciudad); // ← Carga el pronóstico en segundo plano
});

// ======================================
// INICIO
// ======================================
mostrarHistorial(); // ← Carga el historial guardado
estado.textContent = 'Escribe una ciudad y presiona "Consultar".';