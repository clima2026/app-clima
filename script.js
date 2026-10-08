const inputCiudad = document.getElementById('inputCiudad');
const formulario = document.getElementById('formulario');
const resultado = document.getElementById('resultado');
const historial = document.getElementById('historial');
const botonTema = document.getElementById('botonTema');
const botonUbicacion = document.getElementById('botonUbicacion');
const API_KEY = '01e3e14c1f20027f7fff8417895cfdd1';

document.addEventListener('DOMContentLoaded', cargarHistorial);

formulario.addEventListener('submit', e => {
  e.preventDefault();
  const ciudad = inputCiudad.value.trim();
  if (ciudad) buscarClima(ciudad);
});

botonTema.addEventListener('click', () => {
  document.body.classList.toggle('modo-oscuro');
  botonTema.textContent = document.body.classList.contains('modo-oscuro') ? '☀️ Tema' : '🌙 Tema';
});

botonUbicacion.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      buscarPorCoordenadas(pos.coords.latitude, pos.coords.longitude);
    });
  }
});

async function buscarClima(ciudad) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${API_KEY}&units=metric&lang=es`);
    if (!res.ok) throw new Error();
    const datos = await res.json();
    mostrarClima(datos);
    guardarEnHistorial(datos.name);
  } catch {
    resultado.innerHTML = `<p class="error">Ciudad no encontrada 😕</p>`;
  }
  inputCiudad.value = '';
}

async function buscarPorCoordenadas(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`);
    const datos = await res.json();
    mostrarClima(datos);
    guardarEnHistorial(datos.name);
  } catch {
    resultado.innerHTML = `<p class="error">No se pudo obtener tu ubicación</p>`;
  }
}

function mostrarClima(datos) {
  cambiarFondoSegunClima(datos.weather[0].main);
  resultado.innerHTML = `
    <h3>${datos.name}</h3>
    <p class="temperatura">${Math.round(datos.main.temp)}°C</p>
    <p>${datos.weather[0].description}</p>
    <button class="boton-compartir" onclick="compartir('${datos.name}', ${Math.round(datos.main.temp)}, '${datos.weather[0].description}')">📤 Compartir</button>
  `;
}

function cambiarFondoSegunClima(clima) {
  document.body.classList.remove('clima-soleado','clima-nublado','clima-lluvioso','clima-nieve');
  const c = clima.toLowerCase();
  if (c.includes('clear')) document.body.classList.add('clima-soleado');
  else if (c.includes('cloud')) document.body.classList.add('clima-nublado');
  else if (c.includes('rain')||c.includes('drizzle')||c.includes('thunderstorm')) document.body.classList.add('clima-lluvioso');
  else if (c.includes('snow')) document.body.classList.add('clima-nieve');
}

function guardarEnHistorial(ciudad) {
  let lista = JSON.parse(localStorage.getItem('historial') || '[]');
  if (!lista.includes(ciudad)) {
    lista.unshift(ciudad);
    if (lista.length > 5) lista.pop();
    localStorage.setItem('historial', JSON.stringify(lista));
    cargarHistorial();
  }
}

function cargarHistorial() {
  historial.innerHTML = '';
  JSON.parse(localStorage.getItem('historial') || '[]').forEach(c => {
    const btn = document.createElement('button');
    btn.textContent = c;
    btn.onclick = () => buscarClima(c);
    historial.appendChild(btn);
  });
}

function compartir(ciudad, temp, desc) {
  window.open(`https://wa.me/?text=${encodeURIComponent(`Clima en ${ciudad}: ${temp}°C — ${desc}`)}`, '_blank');
}