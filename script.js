const API_KEY = "4b0a7b3b517a903722fe2ec4ca737e01";

const $ = (id) => document.getElementById(id);

const cityInput = $("cityInput");
const searchBtn = $("searchBtn");
const locBtn = $("locBtn");
const loading = $("loading");
const errorEl = $("error");
const weatherCard = $("weatherCard");

const locationEl = $("location");
const dateText = $("dateText");
const temperatureEl = $("temperature");
const descriptionEl = $("description");
const humidityEl = $("humidity");
const windEl = $("wind");
const feelsLikeEl = $("feelsLike");
const pressureEl = $("pressure");
const sunriseEl = $("sunrise");
const sunsetEl = $("sunset");
const weatherIcon = $("weatherIcon");
const clockEl = $("clock");

/* ---------- live clock ---------- */
function tickClock() {
  const d = new Date();
  clockEl.textContent = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
tickClock();
setInterval(tickClock, 1000 * 30);

/* ---------- helpers ---------- */
function showError(msg) {
  errorEl.textContent = "⚠️ " + msg;
  errorEl.classList.remove("hidden");
  weatherCard.classList.add("hidden");
}
function clearError() {
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
}
function setLoading(state) {
  loading.classList.toggle("hidden", !state);
  if (state) {
    weatherCard.classList.add("hidden");
    clearError();
  }
}
function fmtTime(unix, tzOffset) {
  const d = new Date((unix + tzOffset) * 1000);
  return d.toUTCString().slice(17, 22);
}
function applyTheme(main, isDay) {
  const themes = ["clear-day", "clear-night", "clouds", "rain", "snow", "thunder", "mist"];
  themes.forEach((t) => document.body.classList.remove("theme-" + t));
  const key = main.toLowerCase();
  if (key.includes("cloud")) document.body.classList.add("theme-clouds");
  else if (key.includes("rain") || key.includes("drizzle")) document.body.classList.add("theme-rain");
  else if (key.includes("snow")) document.body.classList.add("theme-snow");
  else if (key.includes("thunder")) document.body.classList.add("theme-thunder");
  else if (["mist","fog","haze","smoke","dust","sand"].some(k => key.includes(k))) document.body.classList.add("theme-mist");
  else document.body.classList.add(isDay ? "theme-clear-day" : "theme-clear-night");
}

/* ---------- fetchers ---------- */
async function fetchByCity(city) {
  if (!city || !city.trim()) return showError("Please enter a city name.");
  setLoading(true);
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) throw new Error("City not found. Check the spelling.");
      throw new Error("Unable to fetch weather data.");
    }
    displayWeather(await res.json());
  } catch (e) {
    showError(e.message);
  } finally {
    setLoading(false);
  }
}

async function fetchByCoords(lat, lon) {
  setLoading(true);
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Unable to fetch weather for your location.");
    displayWeather(await res.json());
  } catch (e) {
    showError(e.message);
  } finally {
    setLoading(false);
  }
}

/* ---------- render ---------- */
function displayWeather(data) {
  const { name, sys, main, wind, weather, timezone, dt } = data;
  const w = weather[0];

  locationEl.textContent = `${name}, ${sys.country}`;
  const localDate = new Date((dt + timezone) * 1000);
  dateText.textContent = localDate.toUTCString().slice(0, 16);

  temperatureEl.textContent = `${Math.round(main.temp)}°C`;
  descriptionEl.textContent = w.description;
  feelsLikeEl.textContent = `${Math.round(main.feels_like)}°C`;
  humidityEl.textContent = `${main.humidity}%`;
  windEl.textContent = `${wind.speed} m/s`;
  pressureEl.textContent = `${main.pressure} hPa`;
  sunriseEl.textContent = fmtTime(sys.sunrise, timezone);
  sunsetEl.textContent = fmtTime(sys.sunset, timezone);

  weatherIcon.src = `https://openweathermap.org/img/wn/${w.icon}@4x.png`;
  weatherIcon.alt = w.description;

  const isDay = w.icon.endsWith("d");
  applyTheme(w.main, isDay);

  weatherCard.classList.remove("hidden");
  clearError();
}

/* ---------- events ---------- */
searchBtn.addEventListener("click", () => fetchByCity(cityInput.value));
cityInput.addEventListener("keydown", (e) => { if (e.key === "Enter") fetchByCity(cityInput.value); });

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    cityInput.value = chip.dataset.city;
    fetchByCity(chip.dataset.city);
  });
});

locBtn.addEventListener("click", () => {
  if (!navigator.geolocation) return showError("Geolocation not supported by your browser.");
  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
    () => { setLoading(false); showError("Location permission denied."); }
  );
});

/* ---------- initial load ---------- */
fetchByCity("London");
