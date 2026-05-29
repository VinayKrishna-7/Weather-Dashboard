const API_KEY = "4b0a7b3b517a903722fe2ec4ca737e01";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const loading = document.getElementById("loading");
const error = document.getElementById("error");
const weatherCard = document.getElementById("weatherCard");

const locationElement = document.getElementById("location");
const temperatureElement = document.getElementById("temperature");
const descriptionElement = document.getElementById("description");
const humidityElement = document.getElementById("humidity");
const windElement = document.getElementById("wind");
const feelsLikeElement = document.getElementById("feelsLike");
const pressureElement = document.getElementById("pressure");
const weatherIcon = document.getElementById("weatherIcon");

async function fetchWeather(city) {

    loading.classList.remove("hidden");
    weatherCard.classList.add("hidden");
    error.textContent = "";

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {

            if (response.status === 404) {
                throw new Error("City not found.");
            }

            throw new Error("Unable to fetch weather data.");
        }

        const data = await response.json();

        displayWeather(data);

    } catch (err) {

        error.textContent = err.message;

    } finally {

        loading.classList.add("hidden");
    }
}

function displayWeather(data) {

    /*
        Parsing Nested JSON Objects
    */

    const cityName = data.name;
    const country = data.sys.country;

    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const feelsLike = data.main.feels_like;
    const pressure = data.main.pressure;

    const windSpeed = data.wind.speed;

    const weatherDescription =
        data.weather[0].description;

    const iconCode =
        data.weather[0].icon;

    locationElement.textContent =
        `${cityName}, ${country}`;

    temperatureElement.textContent =
        `${Math.round(temp)}°C`;

    descriptionElement.textContent =
        weatherDescription;

    humidityElement.textContent =
        `${humidity}%`;

    windElement.textContent =
        `${windSpeed} m/s`;

    feelsLikeElement.textContent =
        `${Math.round(feelsLike)}°C`;

    pressureElement.textContent =
        `${pressure} hPa`;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    weatherCard.classList.remove("hidden");
}

searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city === "") {

        error.textContent =
            "Please enter a city name.";

        weatherCard.classList.add("hidden");
        return;
    }

    fetchWeather(city);
});

cityInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        searchBtn.click();
    }
});

window.addEventListener("load", () => {
    fetchWeather("London");
});