function getWeatherIcon(code) {
    const icons = {
        0: "☀️", 1: "🌤️", 2: "🌥️", 3: "☁️",
        45: "🌫️", 48: "🌫️", 51: "🌧️", 53: "🌧️", 55: "🌧️",
        61: "🌧️", 63: "⛈️", 65: "⛈️", 71: "❄️", 73: "❄️", 
        75: "❄️", 77: "❄️", 80: "🌧️", 81: "⛈️", 82: "⛈️",
        86: "❄️", 95: "⛈️", 96: "⛈️", 99: "⛈️"
    };
    return icons[code] || "❓";
}

function getWeatherDescription(code) {
    const description = {
        0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Foggy', 51: 'Light Drizzle', 61: 'Light Rain',
        63: 'Moderate Rain', 65: 'Heavy Rain', 95: 'Thunderstorm'
    };
    return description[code] || 'Cloudy';
}

async function searchWeather() {
    const city = document.getElementById("cityInput").value;
    const errorDiv = document.getElementById("err-msg");
    const loadingDiv = document.getElementById("loading");
    const contentDiv = document.getElementById("weathercontent");

    if (!city) return;

    errorDiv.style.display = "none";
    contentDiv.style.display = "none";
    loadingDiv.style.display = "block";

    try {
        const location = await getCoordinates(city);
        const weather = await getWeather(location.latitude, location.longitude);

        updateCurrentWeather(location, weather);
        updateDailyForecast(weather);
        updateHourlyForecast(weather);

        loadingDiv.style.display = "none";
        contentDiv.style.display = "block";
    } catch (err) {
        loadingDiv.style.display = "none";
        errorDiv.textContent = err.message;
        errorDiv.style.display = "block";
    }
}

async function getCoordinates(city) {
    const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );
    const data = await res.json();

    if (!data.results || data.results.length === 0)
        throw new Error("City not found");

    return data.results[0];
}

async function getWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch weather data");
    return await res.json();
}

function updateCurrentWeather(location, weather) {
    const current = weather.current;

    document.getElementById("location").textContent = `${location.name}, ${location.country}`;
    document.getElementById("date").textContent = new Date().toDateString();
    document.getElementById("currentIcon").textContent = getWeatherIcon(current.weather_code);
    document.getElementById("temperature").textContent = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById("description").textContent = getWeatherDescription(current.weather_code);
    document.getElementById("feelsLike").textContent = `${Math.round(current.apparent_temperature)}°C`;
    document.getElementById("humidity").textContent = `${current.relative_humidity_2m}%`;
    document.getElementById("windspeed").textContent = `${current.wind_speed_10m} km/h`;
    document.getElementById("pressure").textContent = `${Math.round(current.surface_pressure)} hPa`;
}

function updateDailyForecast(weather) {
    const daily = weather.daily;
    const container = document.getElementById("dailyForecast");
    container.innerHTML = "";

    for (let i = 0; i < 7; i++) {
        const date = new Date(daily.time[i]).toLocaleDateString("en-US", { weekday: "short" });

        const div = document.createElement("div");
        div.className = "daily-item";

        div.innerHTML = `
            <div class="day">${i === 0 ? "Today" : date}</div>
            <div class="icon">${getWeatherIcon(daily.weather_code[i])}</div>
            <div class="temps">
                <strong>${Math.round(daily.temperature_2m_max[i])}°</strong>
                <small>${Math.round(daily.temperature_2m_min[i])}°</small>
            </div>
        `;

        container.appendChild(div);
    }
}

function updateHourlyForecast(weather) {
    const hourly = weather.hourly;
    const container = document.getElementById("hourlyForecast");
    container.innerHTML = "";

    for (let i = 0; i < 24 && i < hourly.time.length; i++) {
        const time = new Date(hourly.time[i]).toLocaleTimeString([], {
            hour: "numeric"
        });

        const div = document.createElement("div");
        div.className = "hour-item";

        div.innerHTML = `
            <div class="h-time">${time}</div>
            <div class="h-icon">${getWeatherIcon(hourly.weather_code[i])}</div>
            <div class="h-temp">${Math.round(hourly.temperature_2m[i])}°C</div>
            <div class="h-humidity">💧 ${hourly.relative_humidity_2m[i]}%</div>
            <div class="h-wind">🌬️ ${hourly.wind_speed_10m[i]} km/h</div>
        `;

        container.appendChild(div);
    }
}

document.getElementById('cityInput').addEventListener('keyup', function(event) {
    if(event.key === 'Enter') {
        searchWeather();
    }
});


// async function searchWeather() {
//     const city = document.getElementById('cityInput').value.trim();
//     if(!city) return
// }