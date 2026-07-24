const FORECAST_ENDPOINT = new URL("https://api.open-meteo.com/v1/forecast");

FORECAST_ENDPOINT.search = new URLSearchParams({
  latitude: "24.3585179",
  longitude: "120.7740367",
  timezone: "Asia/Taipei",
  forecast_days: "3",
  current:
    "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,is_day",
  daily:
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_gusts_10m_max",
}).toString();

const WEATHER_CODES = {
  0: ["晴朗", "☀️"],
  1: ["大致晴朗", "🌤️"],
  2: ["局部多雲", "⛅"],
  3: ["陰天", "☁️"],
  45: ["有霧", "🌫️"],
  48: ["霧淞", "🌫️"],
  51: ["輕微毛毛雨", "🌦️"],
  53: ["毛毛雨", "🌦️"],
  55: ["較強毛毛雨", "🌧️"],
  56: ["輕微凍毛雨", "🌧️"],
  57: ["凍毛雨", "🌧️"],
  61: ["短暫小雨", "🌦️"],
  63: ["短暫雨", "🌧️"],
  65: ["較強降雨", "🌧️"],
  66: ["輕微凍雨", "🌧️"],
  67: ["凍雨", "🌧️"],
  71: ["輕微降雪", "🌨️"],
  73: ["降雪", "🌨️"],
  75: ["較強降雪", "🌨️"],
  77: ["霰", "🌨️"],
  80: ["短暫陣雨", "🌦️"],
  81: ["陣雨", "🌧️"],
  82: ["強陣雨", "⛈️"],
  85: ["短暫陣雪", "🌨️"],
  86: ["強陣雪", "🌨️"],
  95: ["雷雨", "⛈️"],
  96: ["雷雨伴隨冰雹", "⛈️"],
  99: ["強雷雨伴隨冰雹", "⛈️"],
};

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
};

function rounded(value) {
  return Number.isFinite(value) ? Math.round(value) : null;
}

function weatherSummary(code) {
  const [condition, icon] = WEATHER_CODES[code] ?? ["天氣多變", "🌥️"];
  return { condition, icon };
}

function weekday(date) {
  return new Intl.DateTimeFormat("zh-TW", {
    weekday: "short",
    timeZone: "Asia/Taipei",
  }).format(new Date(`${date}T12:00:00+08:00`));
}

function buildAdvice({ weatherCode, rainChance, gust, high }) {
  const thunderstorm = weatherCode >= 95;
  const strongRain = [65, 67, 82].includes(weatherCode);

  if (thunderstorm || strongRain || rainChance >= 70 || gust >= 60) {
    return {
      level: "danger",
      title: "天氣風險偏高",
      text: "可能有強降雨、雷雨或強陣風，建議延後山區行程；不要停留於鐵橋、樹下或濕滑階梯。",
    };
  }

  if (rainChance >= 45 || gust >= 40 || high >= 34) {
    return {
      level: "watch",
      title: "行程需要彈性調整",
      text:
        high >= 34
          ? "白天可能偏熱，請補充水分並避開長時間曝曬；出發前也要留意短暫雨與現場動線。"
          : "建議攜帶雨具並縮短戶外停留；若安排鐵道自行車，出發前再確認營運與道路狀況。",
    };
  }

  return {
    level: "good",
    title: "天氣條件相對穩定",
    text: "適合安排斷橋周邊行程；山區仍可能出現局部短暫雨，請穿防滑好走的鞋並留意路況。",
  };
}

export function normalizeWeather(data) {
  const currentCode = rounded(data?.current?.weather_code);
  const current = weatherSummary(currentCode);
  const todayRain = rounded(data?.daily?.precipitation_probability_max?.[0]) ?? 0;
  const todayHigh = rounded(data?.daily?.temperature_2m_max?.[0]);
  const todayLow = rounded(data?.daily?.temperature_2m_min?.[0]);
  const todayGust =
    rounded(data?.daily?.wind_gusts_10m_max?.[0]) ??
    rounded(data?.current?.wind_gusts_10m) ??
    0;

  const forecast = (data?.daily?.time ?? []).slice(0, 3).map((date, index) => {
    const summary = weatherSummary(rounded(data.daily.weather_code?.[index]));

    return {
      date,
      label: index === 0 ? "今天" : weekday(date),
      condition: summary.condition,
      icon: summary.icon,
      high: rounded(data.daily.temperature_2m_max?.[index]),
      low: rounded(data.daily.temperature_2m_min?.[index]),
      rainChance: rounded(data.daily.precipitation_probability_max?.[index]),
    };
  });

  return {
    location: "龍騰斷橋周邊",
    current: {
      temperature: rounded(data?.current?.temperature_2m),
      apparentTemperature: rounded(data?.current?.apparent_temperature),
      condition: current.condition,
      icon: current.icon,
      windSpeed: rounded(data?.current?.wind_speed_10m),
      windGust: rounded(data?.current?.wind_gusts_10m),
      isDay: data?.current?.is_day === 1,
    },
    today: {
      high: todayHigh,
      low: todayLow,
      rainChance: todayRain,
      windGust: todayGust,
    },
    forecast,
    advice: buildAdvice({
      weatherCode: currentCode,
      rainChance: todayRain,
      gust: todayGust,
      high: todayHigh ?? 0,
    }),
    source: "Open-Meteo",
  };
}

export async function fetchWeatherPayload() {
  const upstream = await fetch(FORECAST_ENDPOINT, {
    headers: { Accept: "application/json" },
  });

  if (!upstream.ok) {
    throw new Error(`Weather service returned ${upstream.status}`);
  }

  return normalizeWeather(await upstream.json());
}

export async function onRequestGet(context) {
  const cacheUrl = new URL(context.request.url);
  cacheUrl.search = "";
  const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });
  const cache = caches.default;
  const cached = await cache.match(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const payload = await fetchWeatherPayload();
    const response = new Response(JSON.stringify(payload), {
      headers: {
        ...jsonHeaders,
        "Cache-Control":
          "public, max-age=300, s-maxage=900, stale-while-revalidate=1800",
      },
    });

    context.waitUntil(cache.put(cacheKey, response.clone()).catch(() => undefined));
    return response;
  } catch {
    return new Response(
      JSON.stringify({
        error: "目前無法取得天氣預報，請稍後再試。",
      }),
      {
        status: 502,
        headers: {
          ...jsonHeaders,
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
