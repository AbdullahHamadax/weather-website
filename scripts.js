const sunnyConditionIcon = "assets/images/icon-sunny.webp";
const overcastConditionIcon = "assets/images/icon-overcast.webp";
const drizzleConditionIcon = "assets/images/icon-drizzle.webp";
const snowConditionIcon = "assets/images/icon-snow.webp";
const fogConditionIcon = "assets/images/icon-fog.webp";
const stormConditionIcon = "assets/images/icon-storm.webp";
const rainConditionIcon = "assets/images/icon-rain.webp";

const dayBtn = document.getElementById("dayBtn");
const dayMenu = document.getElementById("dayMenu");
const selectedDay = document.getElementById("selectedDay");
const dayItems = document.querySelectorAll(".day-item");

const currentWeatherStats = document.getElementById("current-weather-stats");
const dailyStats = document.getElementById("daily-stats");
const hourlyStats = document.getElementById("hourly-stats");

const userAddress = document.getElementById("user-address");

const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function updateIcon(code) {
  if (code === 0) return sunnyConditionIcon;
  if (code === 1 || code === 2 || code === 3) return overcastConditionIcon;
  if (code === 45 || code === 48) return fogConditionIcon;
  if (code === 51 || code === 53 || code === 55) return drizzleConditionIcon;
  if (code === 56 || code === 57) return drizzleConditionIcon;
  if (code === 61 || code === 63 || code === 65) return rainConditionIcon;
  if (code === 66 || code === 67) return rainConditionIcon;
  if (code === 71 || code === 73 || code === 75) return snowConditionIcon;
  if (code === 77) return snowConditionIcon;
  if (code === 80 || code === 81 || code === 82) return rainConditionIcon;
  if (code === 85 || code === 86) return snowConditionIcon;
  if (code === 95 || code === 96 || code === 99) return stormConditionIcon;

  return overcastConditionIcon;
}

let reverseGeocoder = new BDCReverseGeocode();

navigator.geolocation.getCurrentPosition(async (position) => {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  const today = new Date();
  const longDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=weather_code,temperature_2m&timezone=auto`,
  );

  if (!res.ok) throw new Error("Weather data not available");

  const data = await res.json();

  console.log(data);
  const currentIcon = updateIcon(data.current.weather_code);

  reverseGeocoder.getClientLocation({ latitude, longitude }, function (result) {
    userAddress.innerHTML = `
        <p class="text-3xl font-extrabold">
          ${result.city}, ${result.countryName}
        </p>
        <p class="mt-2 text-lg text-white/70">${longDate}</p>

        <div class="mt-10 flex items-center justify-between">
          <img src="${currentIcon}" class="w-36" />
          <p class="text-9xl font-extrabold leading-none">
            ${Math.round(data.current.temperature_2m)}
            <span class="align-top text-5xl">°</span>
          </p>
        </div>
      `;
  });

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

  dailyStats.innerHTML = data.daily.time
    .map((date, i) => {
      const d = new Date(date);
      const dayLabel = weekday[d.getDay()];
      const icon = updateIcon(data.daily.weather_code[i]);

      return `
        <div class="flex flex-col rounded-lg border border-gray-700 bg-[#25253F] p-4 text-center">
          <p>${dayLabel}</p>
          <img src="${icon}" class="size-16 self-center" />
          <div class="flex justify-between">
            <p class="font-bold">${Math.round(data.daily.temperature_2m_max[i])}°</p>
            <p class="opacity-70 font-bold">${Math.round(data.daily.temperature_2m_min[i])}°</p>
          </div>
        </div>
      `;
    })
    .join("");

  hourlyStats.innerHTML = data.hourly.time
    .slice(0, 8)
    .map((time, i) => {
      const icon = updateIcon(data.daily.weather_code[i]);
      const temp = Math.round(data.hourly.temperature_2m[i]);
      const hour = new Date(time).toLocaleTimeString(undefined, {
        hour: "numeric",
        hour12: true,
      });
      return `  <div class="flex items-center justify-between rounded-lg bg-[#2C2D4A] p-4">
                    <div class="flex items-center gap-3">
                    <img src="${icon}" class="size-12" />
                    <p class="font-bold">${hour}</p>
                    </div>
                    <p class="font-bold opacity-80">${temp}°</p>
                </div>`;
    })
    .join("");
});

const todayName = weekday[new Date().getDay()];
selectedDay.textContent = todayName;

dayBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dayMenu.classList.toggle("hidden");
});

dayItems.forEach((item) => {
  item.addEventListener("click", () => {
    selectedDay.textContent = item.dataset.day;
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
