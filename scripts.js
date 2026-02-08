const sunnyConditionIcon = "assets/images/icon-sunny.webp";
const overcastConditionIcon = "assets/images/icon-overcast.webp";
const drizzleConditionIcon = "assets/images/icon-drizzle.webp";
const snowConditionIcon = "assets/images/icon-snow.webp";
const fogConditionIcon = "assets/images/icon-fog.webp";
const stormConditionIcon = "assets/images/icon-storm.webp";
const rainConditionIcon = "assets/images/icon-rain.webp";

const dayBtn = document.getElementById("dayBtn");
const searchBtn = document.getElementById("search-btn");

const dayMenu = document.getElementById("dayMenu");
const selectedDay = document.getElementById("selectedDay");
const dayItems = document.querySelectorAll(".day-item");

const currentWeatherStats = document.getElementById("current-weather-stats");
const dailyStats = document.getElementById("daily-stats");
const hourlyStats = document.getElementById("hourly-stats");

const mainContent = document.getElementById("main-content");
const userAddress = document.getElementById("user-address");
const userInput = document.getElementById("user-input");

const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function updateIcon(code) {
  if (code === 0) return sunnyConditionIcon;
  if ([1, 2, 3].includes(code)) return overcastConditionIcon;
  if ([45, 48].includes(code)) return fogConditionIcon;
  if ([51, 53, 55, 56, 57].includes(code)) return drizzleConditionIcon;
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return rainConditionIcon;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return snowConditionIcon;
  if ([95, 96, 99].includes(code)) return stormConditionIcon;

  return overcastConditionIcon;
}

let weatherData = null;
let selectedDayIndex = 0;

function renderCurrent(data, city, country, dateLabel) {
  userAddress.innerHTML = `<div class="lg:flex lg:items-center lg:justify-between text-center lg:text-start">
  <div>
    <p class="text-3xl font-extrabold">${city}, ${country}</p>
    <p class="mt-2 text-lg text-white/70">${dateLabel}</p>
</div>
    <div class=" flex items-center justify-between">
      <img src="${updateIcon(data.current.weather_code)}" class="w-36" />
      <p class="text-9xl font-extrabold leading-none">
        ${Math.round(data.current.temperature_2m)}<span class="align-top text-5xl">°</span>
      </p>
    </div></div>
  
  `;
}

function renderStats(data) {
  currentWeatherStats.innerHTML = `
    <div class="rounded-lg border border-gray-700 bg-[#25253F] p-5">
      <p class="mb-3 opacity-80">Feels like</p>
      <p class="font-bold text-lg">${Math.round(data.current.apparent_temperature)}°</p>
    </div>

    <div class="rounded-lg border border-gray-700 bg-[#25253F] p-5">
      <p class="mb-3 opacity-80">Humidity</p>
      <p class="font-bold text-lg">${data.current.relative_humidity_2m}%</p>
    </div>

    <div class="rounded-lg border border-gray-700 bg-[#25253F] p-5">
      <p class="mb-3 opacity-80">Wind</p>
      <p class="font-bold text-lg">${Math.round(data.current.wind_speed_10m)} km/h</p>
    </div>

    <div class="rounded-lg border border-gray-700 bg-[#25253F] p-5">
      <p class="mb-3 opacity-80">Precipitation</p>
      <p class="font-bold text-lg">${data.current.precipitation} mm</p>
    </div>
  `;
}

function renderDaily(data) {
  dailyStats.innerHTML = data.daily.time
    .map((date, i) => {
      const d = new Date(date);
      return `
        <div class="flex flex-col rounded-lg border border-gray-700 bg-[#25253F] p-4 text-center">
          <p>${weekday[d.getDay()]}</p>
          <img src="${updateIcon(data.daily.weather_code[i])}" class="size-16 self-center" />
          <div class="flex justify-between">
            <p class="font-bold">${Math.round(data.daily.temperature_2m_max[i])}°</p>
            <p class="opacity-70 font-bold">${Math.round(data.daily.temperature_2m_min[i])}°</p>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderHourly(dayIndex) {
  const start = dayIndex * 24;
  const hoursToShow = 8;

  hourlyStats.innerHTML = weatherData.hourly.time
    .slice(start, start + hoursToShow)
    .map((time, i) => {
      const index = start + i;
      const hour = new Date(time).toLocaleTimeString(undefined, {
        hour: "numeric",
        hour12: true,
      });

      return `
        <div class="flex items-center justify-between rounded-lg bg-[#2C2D4A] p-4">
          <div class="flex items-center gap-3">
            <img src="${updateIcon(weatherData.hourly.weather_code[index])}" class="size-12" />
            <p class="font-bold">${hour}</p>
          </div>
          <p class="font-bold opacity-80">
            ${Math.round(weatherData.hourly.temperature_2m[index])}°
          </p>
        </div>
      `;
    })
    .join("");
}

function renderError() {
  mainContent.innerHTML = `
    <div class="flex flex-col items-center justify-center gap-4 text-center py-20">
      <img src="assets/images/icon-error.svg" class="w-12 opacity-80" />
      <h2 class="text-3xl font-bold">Something went wrong</h2>
      <p class="text-white/70 max-w-md">
        We couldn't connect to the server (API error). Please try again in a few moments.
      </p>
      <button
        onclick="location.reload()"
        class="mt-4 rounded-lg bg-[#2C2D4A] px-6 py-3 font-semibold hover:bg-[#3A3B5E] transition"
      >
        Retry
      </button>
    </div>
  `;

  currentWeatherStats.innerHTML = "";
  dailyStats.innerHTML = "";
  hourlyStats.innerHTML = "";
}

function renderEmptySearch() {
  mainContent.innerHTML = `
    <div class="flex flex-col items-center justify-center gap-3 text-center py-20">
      <p class="text-lg font-semibold">No search result found!</p>
    </div>
  `;

  currentWeatherStats.innerHTML = "";
  dailyStats.innerHTML = "";
  hourlyStats.innerHTML = "";
}

async function fetchUserInput(city) {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`,
    );

    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      renderEmptySearch();
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=weather_code,temperature_2m&timezone=auto`,
    );

    if (!weatherRes.ok) throw new Error("Weather fetch failed");

    weatherData = await weatherRes.json();

    const today = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    renderCurrent(weatherData, name, country, today);
    renderStats(weatherData);
    renderDaily(weatherData);
    renderHourly(0);
  } catch {
    renderError();
  }
}

let reverseGeocoder = new BDCReverseGeocode();

navigator.geolocation.getCurrentPosition(async ({ coords }) => {
  const { latitude, longitude } = coords;

  const today = new Date();
  const longDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=weather_code,temperature_2m&timezone=auto`,
  );

  weatherData = await weatherRes.json();

  reverseGeocoder.getClientLocation({ latitude, longitude }, (loc) => {
    renderCurrent(weatherData, loc.city, loc.countryName, longDate);
  });

  renderStats(weatherData);
  renderDaily(weatherData);
  renderHourly(0);
});

selectedDay.textContent = weekday[new Date().getDay()];

dayBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dayMenu.classList.toggle("hidden");
});

searchBtn.addEventListener("click", () => {
  const value = userInput.value.trim();

  if (!value) {
    renderEmptySearch();
    return;
  }

  fetchUserInput(value);
});

dayItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    selectedDayIndex = index;
    selectedDay.textContent = item.dataset.day;
    renderHourly(selectedDayIndex);
    dayMenu.classList.add("hidden");
  });
});

document.addEventListener("click", (e) => {
  if (!dayMenu.contains(e.target) && !dayBtn.contains(e.target)) {
    dayMenu.classList.add("hidden");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    dayMenu.classList.add("hidden");
  }
});
