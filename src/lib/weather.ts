/**
 * 天氣資料的伺服器端取得與整理。
 *
 * 這個模組只在伺服器（Worker）上執行：由伺服器向氣象資料來源取得預報、
 * 依照預報條件組出「可以直接照著做」的建議，並在邊緣節點快取。
 * 瀏覽器端不會直接接觸任何外部氣象服務，也不需要在頁面上說明資料怎麼來的。
 */

import { ATTRACTION } from "../data/attraction";

const FORECAST_ENDPOINT = new URL("https://api.open-meteo.com/v1/forecast");

/** 完整請求：即時 + 每日 + 逐時（用來判斷今天剩下的時間怎麼安排）。 */
const FULL_QUERY = {
  current: [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "is_day",
    "precipitation",
    "weather_code",
    "cloud_cover",
    "wind_speed_10m",
    "wind_gusts_10m",
    "visibility",
  ].join(","),
  hourly: [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "precipitation_probability",
    "precipitation",
    "weather_code",
    "wind_speed_10m",
    "wind_gusts_10m",
    "uv_index",
    "visibility",
  ].join(","),
  daily: [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "apparent_temperature_max",
    "sunrise",
    "sunset",
    "uv_index_max",
    "precipitation_sum",
    "precipitation_probability_max",
    "wind_speed_10m_max",
    "wind_gusts_10m_max",
  ].join(","),
};

function buildEndpoint(options: { hourly: boolean }): string {
  const url = new URL(FORECAST_ENDPOINT);
  url.search = new URLSearchParams({
    latitude: String(ATTRACTION.latitude),
    longitude: String(ATTRACTION.longitude),
    timezone: "Asia/Taipei",
    forecast_days: "7",
    timeformat: "iso8601",
    wind_speed_unit: "kmh",
    current: FULL_QUERY.current,
    daily: FULL_QUERY.daily,
    ...(options.hourly ? { hourly: FULL_QUERY.hourly, forecast_hours: "26" } : {}),
  }).toString();
  return url.toString();
}

export type SkyTone = "clear" | "cloud" | "rain" | "storm" | "fog";

export interface WeatherCodeInfo {
  condition: string;
  icon: string;
  tone: SkyTone;
  /** 白話一句，給不熟悉氣象用語的旅客 */
  plain: string;
}

const WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: { condition: "晴朗", icon: "☀️", tone: "clear", plain: "大晴" },
  1: { condition: "大致晴朗", icon: "🌤️", tone: "clear", plain: "晴時多雲" },
  2: { condition: "局部多雲", icon: "⛅", tone: "cloud", plain: "多雲" },
  3: { condition: "陰天", icon: "☁️", tone: "cloud", plain: "陰天" },
  45: { condition: "有霧", icon: "🌫️", tone: "fog", plain: "起霧" },
  48: { condition: "霧淞", icon: "🌫️", tone: "fog", plain: "起霧結霜" },
  51: { condition: "輕微毛毛雨", icon: "🌦️", tone: "rain", plain: "飄毛毛雨" },
  53: { condition: "毛毛雨", icon: "🌦️", tone: "rain", plain: "毛毛雨" },
  55: { condition: "較強毛毛雨", icon: "🌧️", tone: "rain", plain: "綿綿細雨" },
  56: { condition: "輕微凍毛雨", icon: "🌧️", tone: "rain", plain: "凍雨" },
  57: { condition: "凍毛雨", icon: "🌧️", tone: "rain", plain: "凍雨" },
  61: { condition: "短暫小雨", icon: "🌦️", tone: "rain", plain: "短暫小雨" },
  63: { condition: "短暫雨", icon: "🌧️", tone: "rain", plain: "間歇下雨" },
  65: { condition: "較強降雨", icon: "🌧️", tone: "rain", plain: "雨勢明顯" },
  66: { condition: "輕微凍雨", icon: "🌧️", tone: "rain", plain: "凍雨" },
  67: { condition: "凍雨", icon: "🌧️", tone: "rain", plain: "凍雨" },
  71: { condition: "輕微降雪", icon: "🌨️", tone: "rain", plain: "可能降雪" },
  73: { condition: "降雪", icon: "🌨️", tone: "rain", plain: "降雪" },
  75: { condition: "較強降雪", icon: "🌨️", tone: "rain", plain: "明顯降雪" },
  77: { condition: "霰", icon: "🌨️", tone: "rain", plain: "下霰" },
  80: { condition: "短暫陣雨", icon: "🌦️", tone: "rain", plain: "短暫陣雨" },
  81: { condition: "陣雨", icon: "🌧️", tone: "rain", plain: "陣雨" },
  82: { condition: "強陣雨", icon: "⛈️", tone: "storm", plain: "強陣雨" },
  85: { condition: "短暫陣雪", icon: "🌨️", tone: "rain", plain: "短暫陣雪" },
  86: { condition: "強陣雪", icon: "🌨️", tone: "rain", plain: "陣雪" },
  95: { condition: "雷雨", icon: "⛈️", tone: "storm", plain: "雷雨" },
  96: { condition: "雷雨伴隨冰雹", icon: "⛈️", tone: "storm", plain: "雷雨冰雹" },
  99: { condition: "強雷雨伴隨冰雹", icon: "⛈️", tone: "storm", plain: "強雷雨" },
};

const FALLBACK_CODE: WeatherCodeInfo = {
  condition: "天氣多變",
  icon: "🌥️",
  tone: "cloud",
  plain: "天氣多變",
};

/* ------------------------------------------------------------------ *
 * 對外型別
 * ------------------------------------------------------------------ */

export interface WeatherDay {
  date: string;
  label: string;
  weekday: string;
  condition: string;
  icon: string;
  tone: SkyTone;
  high: number | null;
  low: number | null;
  rainChance: number | null;
  precipitation: number | null;
  uvIndex: number | null;
  windMax: number | null;
  gustMax: number | null;
  sunrise: string | null;
  sunset: string | null;
  /** 一句話結論，例如「記得帶傘」 */
  adviceLabel: string;
  adviceTone: "good" | "watch" | "danger";
}

export type AdviceTag = "outfit" | "plan" | "pack";

export interface AdviceLine {
  tag: AdviceTag;
  text: string;
}

export interface RiskItem {
  severity: "watch" | "danger";
  title: string;
  text: string;
}

export interface SceneAdvice {
  scene: string;
  icon: "mountain" | "droplet" | "leaf" | "shop" | "train";
  lines: string[];
}

export interface TimeWindow {
  label: string;
  range: string;
  verdict: string;
  tone: "good" | "watch" | "danger";
}

export interface WeatherAdvice {
  level: "good" | "watch" | "danger";
  summary: string;
  title: string;
  /** 風險提醒，優先度最高；沒有觸發就是空陣列 */
  risks: RiskItem[];
  /** 出行穿搭 */
  outfit: string[];
  /** 遊玩安排 */
  plan: string[];
  /** 隨身物品 */
  pack: string[];
  /** 依地理環境分開的專項提醒；沒有觸發的場景不會出現 */
  scenes: SceneAdvice[];
  /** 今天剩下時段的安排建議 */
  windows: TimeWindow[];
  reasons: string[];
}

export interface WeatherPayload {
  location: string;
  updatedAt: string;
  /** 資料涵蓋的當地日期（台北時區 YYYY-MM-DD） */
  localDate: string;
  current: {
    temperature: number | null;
    apparentTemperature: number | null;
    humidity: number | null;
    condition: string;
    plain: string;
    icon: string;
    tone: SkyTone;
    windSpeed: number | null;
    windGust: number | null;
    windLevel: number | null;
    precipitation: number | null;
    visibility: number | null;
    isDay: boolean;
  };
  today: {
    high: number | null;
    low: number | null;
    dayRange: number | null;
    rainChance: number | null;
    precipitation: number | null;
    uvIndex: number | null;
    windMax: number | null;
    gustMax: number | null;
    windLevelMax: number | null;
    sunrise: string | null;
    sunset: string | null;
    /** 預估幾點開始下雨（當地整點小時），沒有明顯降雨時為 null */
    rainOnsetHour: number | null;
  };
  forecast: WeatherDay[];
  advice: WeatherAdvice;
}

/* ------------------------------------------------------------------ *
 * 基礎工具
 * ------------------------------------------------------------------ */

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function rounded(value: unknown): number | null {
  const parsed = num(value);
  return parsed === null ? null : Math.round(parsed);
}

function roundedOne(value: unknown): number | null {
  const parsed = num(value);
  return parsed === null ? null : Math.round(parsed * 10) / 10;
}

function codeInfo(code: unknown): WeatherCodeInfo {
  const parsed = rounded(code);
  if (parsed === null) return FALLBACK_CODE;
  return WEATHER_CODES[parsed] ?? FALLBACK_CODE;
}

function weekdayLabel(date: string): string {
  return new Intl.DateTimeFormat("zh-TW", {
    weekday: "short",
    timeZone: "Asia/Taipei",
  }).format(new Date(`${date}T12:00:00+08:00`));
}

function clockLabel(value: unknown): string | null {
  if (typeof value !== "string" || value.length < 16) return null;
  return value.slice(11, 16);
}

/** 台北時區的日期與小時（hour 為 0–23） */
function localParts(iso: string): { date: string; hour: number } {
  const date = iso.slice(0, 10);
  const hour = Number(iso.slice(11, 13));
  return { date, hour: Number.isFinite(hour) ? hour : 0 };
}

/** 風速（km/h）換算蒲福風級，讓「風大不大」變成人看得懂的說法 */
export function windLevel(kmh: number | null): number | null {
  if (kmh === null) return null;
  const bounds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117];
  for (let index = 0; index < bounds.length; index += 1) {
    if (kmh <= bounds[index]) return index;
  }
  return 12;
}

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items.filter((item) => item.trim().length > 0)));
}

/* ------------------------------------------------------------------ *
 * 逐時資料：判斷今天剩下的時間怎麼安排
 * ------------------------------------------------------------------ */

interface HourPoint {
  hour: number;
  temperature: number | null;
  rainChance: number | null;
  precipitation: number | null;
  code: number | null;
  wind: number | null;
  gust: number | null;
  uv: number | null;
  visibility: number | null;
}

interface HourlySummary {
  points: HourPoint[];
  thunder: boolean;
  heavyRain: boolean;
  snow: boolean;
  maxHourlyPrecip: number;
  minVisibility: number | null;
  rainOnsetHour: number | null;
  windows: TimeWindow[];
}

const WINDOW_DEFINITIONS = [
  { label: "上午", start: 6, end: 11, range: "06:00–11:00" },
  { label: "午後", start: 12, end: 16, range: "12:00–17:00" },
  { label: "傍晚", start: 17, end: 20, range: "17:00–21:00" },
] as const;

function summarizeHourly(hourlyRaw: Record<string, unknown>, currentHour: number): HourlySummary {
  const listOf = (key: string): unknown[] => {
    const value = hourlyRaw[key];
    return Array.isArray(value) ? value : [];
  };

  const times = listOf("time").filter((item): item is string => typeof item === "string");
  const temperatures = listOf("temperature_2m");
  const chances = listOf("precipitation_probability");
  const amounts = listOf("precipitation");
  const codes = listOf("weather_code");
  const winds = listOf("wind_speed_10m");
  const gusts = listOf("wind_gusts_10m");
  const uvs = listOf("uv_index");
  const visibilities = listOf("visibility");

  const points: HourPoint[] = times.map((time, index) => ({
    hour: localParts(time).hour,
    temperature: roundedOne(temperatures[index]),
    rainChance: rounded(chances[index]),
    precipitation: roundedOne(amounts[index]),
    code: rounded(codes[index]),
    wind: rounded(winds[index]),
    gust: rounded(gusts[index]),
    uv: roundedOne(uvs[index]),
    visibility: rounded(visibilities[index]),
  }));

  if (points.length === 0) {
    return {
      points,
      thunder: false,
      heavyRain: false,
      snow: false,
      maxHourlyPrecip: 0,
      minVisibility: null,
      rainOnsetHour: null,
      windows: [],
    };
  }

  const thunder = points.some((point) => point.code !== null && point.code >= 95);
  const heavyRain = points.some(
    (point) =>
      (point.code !== null && [65, 67, 82].includes(point.code)) ||
      (point.precipitation ?? 0) >= 8,
  );
  const snow = points.some(
    (point) => point.code !== null && [71, 73, 75, 77, 85, 86].includes(point.code),
  );
  const maxHourlyPrecip = points.reduce(
    (max, point) => Math.max(max, point.precipitation ?? 0),
    0,
  );

  const visibilityValues = points
    .map((point) => point.visibility)
    .filter((value): value is number => value !== null);
  const minVisibility = visibilityValues.length > 0 ? Math.min(...visibilityValues) : null;

  const onset = points.find(
    (point) => point.hour >= currentHour && (point.rainChance ?? 0) >= 50,
  );

  const windows = WINDOW_DEFINITIONS.map((definition): TimeWindow | null => {
    const slice = points.filter(
      (point) =>
        point.hour >= definition.start && point.hour <= definition.end && point.hour >= currentHour,
    );
    if (slice.length === 0) return null;

    const worstChance = slice.reduce((max, point) => Math.max(max, point.rainChance ?? 0), 0);
    const worstPrecip = slice.reduce((max, point) => Math.max(max, point.precipitation ?? 0), 0);
    const storm = slice.some((point) => point.code !== null && point.code >= 95);
    const avgTemp =
      slice.reduce((sum, point) => sum + (point.temperature ?? 0), 0) / slice.length;
    const maxUv = slice.reduce((max, point) => Math.max(max, point.uv ?? 0), 0);
    const maxLevel = slice.reduce((max, point) => Math.max(max, windLevel(point.gust) ?? 0), 0);

    let tone: TimeWindow["tone"] = "good";
    let verdict = "天氣大致穩定，適合安排戶外行程。";

    if (storm) {
      tone = "danger";
      verdict = "這個時段有雷雨機會，建議留在室內、不要上山。";
    } else if (worstPrecip >= 8 || worstChance >= 80) {
      tone = "danger";
      verdict = "降雨訊號明顯，戶外行程建議改期或改走室內。";
    } else if (worstChance >= 50) {
      tone = "watch";
      verdict = "有機會下雨，出門請帶雨具並縮短戶外時間。";
    } else if (worstChance >= 30) {
      tone = "watch";
      verdict = "可能有短暫陣雨，備把摺傘比較安心。";
    } else if (avgTemp >= 32) {
      tone = "watch";
      verdict = "氣溫偏高，避開正午並多補充水分。";
    } else if (maxUv >= 8) {
      tone = "watch";
      verdict = "紫外線偏強，記得防曬與遮陽。";
    } else if (maxLevel >= 6) {
      tone = "watch";
      verdict = "風勢偏大，帽子與隨身物品要收好。";
    }

    return {
      label: definition.label,
      range: definition.range,
      verdict,
      tone,
    };
  }).filter((item): item is TimeWindow => item !== null);

  return {
    points,
    thunder,
    heavyRain,
    snow,
    maxHourlyPrecip,
    minVisibility,
    rainOnsetHour: onset ? onset.hour : null,
    windows,
  };
}

/* ------------------------------------------------------------------ *
 * 建議引擎：由天氣條件組出可執行的建議，不符合條件的條目完全不出現
 * ------------------------------------------------------------------ */

interface AdviceInput {
  localDate: string;
  currentHour: number;
  currentCode: number | null;
  currentTemp: number | null;
  humidity: number | null;
  high: number | null;
  low: number | null;
  dayRange: number | null;
  rainChance: number | null;
  precipSum: number | null;
  uvMax: number | null;
  windMax: number | null;
  gustMax: number | null;
  hourly: HourlySummary;
}

function buildAdvice(input: AdviceInput): WeatherAdvice {
  const {
    currentCode,
    currentTemp,
    humidity,
    high,
    low,
    dayRange,
    rainChance,
    precipSum,
    uvMax,
    windMax,
    gustMax,
    hourly,
  } = input;

  const risks: RiskItem[] = [];
  const outfit: string[] = [];
  const plan: string[] = [];
  const pack: string[] = [];
  const reasons: string[] = [];

  const fogCodes = [45, 48];
  const drizzleCodes = [51, 53, 55, 56, 57, 61];
  const rainCodes = [63, 80, 81];
  const heavyRainCodes = [65, 67, 82];

  const codeForSky = currentCode ?? null;
  const chance = rainChance ?? 0;
  const sum = precipSum ?? 0;
  const uv = uvMax ?? 0;
  const highTemp = high ?? currentTemp ?? 0;
  const gusts = gustMax ?? 0;
  const winds = windMax ?? 0;
  const maxLevel = windLevel(gusts) ?? 0;
  const range = dayRange ?? 0;

  const isFoggy =
    (codeForSky !== null && fogCodes.includes(codeForSky)) ||
    (hourly.minVisibility !== null && hourly.minVisibility < 1000);
  const denseFog = hourly.minVisibility !== null && hourly.minVisibility < 300;
  const thunder = hourly.thunder || (codeForSky !== null && codeForSky >= 95);
  const heavyRain =
    hourly.heavyRain ||
    (codeForSky !== null && heavyRainCodes.includes(codeForSky)) ||
    sum >= 15 ||
    hourly.maxHourlyPrecip >= 8;
  const moderateRain =
    !heavyRain &&
    ((codeForSky !== null && rainCodes.includes(codeForSky)) || sum >= 5 || chance >= 70);
  const drizzle =
    !heavyRain &&
    !moderateRain &&
    ((codeForSky !== null && drizzleCodes.includes(codeForSky)) ||
      (sum > 0.2 && sum < 5) ||
      chance >= 40);

  /* --- 風險提醒（優先度最高） ------------------------------------- */

  if (thunder) {
    risks.push({
      severity: "danger",
      title: "有雷雨機會",
      text: "雷雨期間請離開溪床、稜線、鐵橋與空曠處，不要在大樹或涼亭外側躲雨；鐵道自行車與戶外動線多半會暫停。",
    });
    reasons.push("預報有雷雨");
  }

  if (heavyRain) {
    risks.push({
      severity: "danger",
      title: "降雨偏強",
      text: "短時強降雨容易造成溪水暴漲與邊坡落石，請避開溪谷、低窪處與山區道路，並留意道路封閉訊息。",
    });
    reasons.push("預報有較強降雨");
  }

  if (maxLevel >= 7) {
    risks.push({
      severity: "danger",
      title: "風勢強勁",
      text: "陣風可能達到 7 級以上，請遠離邊坡、枯木與鬆動的護欄，帽子與輕便物品務必收好。",
    });
    reasons.push(`陣風約 ${gusts} km/h`);
  }

  if (isFoggy) {
    risks.push({
      severity: denseFog ? "danger" : "watch",
      title: denseFog ? "濃霧、能見度不佳" : "山區有霧",
      text: denseFog
        ? "能見度可能低於 300 公尺，山區道路請開霧燈並放慢車速，觀景與拍照的效果也會大打折扣。"
        : "雲霧會讓視線變差，山區行車請開燈慢行；起霧時照片容易灰濛濛，需要多留一點等待時間。",
    });
    reasons.push("山區有霧");
  }

  if (snowLike(input)) {
    risks.push({
      severity: "watch",
      title: "低溫可能結霜",
      text: "清晨與夜間路面、階梯可能濕滑結霜，行走時請放慢腳步並避免踩踏長苔的磚面。",
    });
  }

  if (highTemp >= 36) {
    risks.push({
      severity: "danger",
      title: "高溫炎熱",
      text: "正午前後體感悶熱，請縮短戶外時間、隨時補水，出現頭暈或抽筋請立刻到陰涼處休息。",
    });
  }

  if (chance >= 60) reasons.push(`降雨機率 ${chance}%`);
  if (uv >= 8) reasons.push(`紫外線指數 ${uv}`);
  if (highTemp >= 32) reasons.push(`高溫約 ${highTemp}°C`);

  /* --- 出行穿搭 --------------------------------------------------- */

  if (highTemp >= 32) {
    outfit.push("天氣悶熱，建議輕薄透氣的短袖排汗衣物，並注意防曬。");
  } else if (highTemp >= 26) {
    outfit.push("白天溫暖，短袖加上一件防風薄外套即可應付山區風勢。");
  } else if (highTemp >= 20) {
    outfit.push("溫度舒適偏涼，建議長袖或薄外套，早晚再加一層。");
  } else if (highTemp >= 14) {
    outfit.push("氣溫偏涼，建議保暖中層加防風外套。");
  } else {
    outfit.push("氣溫偏低，請穿著厚外套並加上圍巾、手套等保暖配件。");
  }

  if (range > 8) {
    outfit.push(`日夜溫差約 ${range}°C，建議多帶一件外套方便增減。`);
  }

  if (heavyRain || moderateRain || thunder) {
    outfit.push("建議穿著防水外套與止滑的鞋款，避免牛仔褲等吸水後不易乾的材質。");
  } else if (drizzle) {
    outfit.push("地面可能濕滑，建議選擇抓地力較好的鞋子。");
  }

  if (winds >= 30 || maxLevel >= 5) {
    outfit.push("風勢偏大，帽子容易被吹落，也不建議穿寬鬆長裙或披肩。");
  }

  if (humidity !== null && humidity >= 90 && highTemp >= 22) {
    outfit.push("濕度高、體感悶黏，透氣排汗的材質會比棉質舒服。");
  }

  /* --- 遊玩安排 --------------------------------------------------- */

  if (thunder) {
    plan.push("溪流與水域活動請全部取消，雷雨時不要在溪床、橋上或空曠處停留。");
    plan.push("行程改以三義市區的室內展館為主，戶外動線等雨勢過後再評估。");
  } else if (heavyRain) {
    plan.push("不建議安排戶外行程；若已出發，請縮短停留並提早下山。");
    plan.push("室內備案：三義市區的木雕與文化展館，行程彈性最大。");
  } else if (moderateRain) {
    plan.push("戶外行程會明顯受影響，建議先走室內備案，再視雨勢回到遺構區。");
  } else if (drizzle) {
    plan.push("小雨不影響參觀，但露天解說與拍照的體驗會打折扣，可先看室內景點再機動調整。");
  } else if (codeForSky !== null && codeForSky <= 2) {
    plan.push("天氣晴朗，適合安排戶外行程，日出與日落前後的光線最適合拍照。");
  } else if (codeForSky === 3) {
    plan.push("陰天光線柔和，很適合拍照，也不會曬得難受，適合長時間在戶外散步。");
  }

  if (highTemp >= 32 && !thunder && !heavyRain) {
    plan.push("避開 11:00–14:00 的正午時段，把主要行程排在上午或傍晚。");
  }

  if (!thunder && !heavyRain && maxLevel >= 5) {
    plan.push("風大時鐵道自行車與露天設施可能視情況調整，出發前請確認營運公告。");
  }

  if (input.hourly.rainOnsetHour !== null && !thunder) {
    plan.push(`預估 ${input.hourly.rainOnsetHour} 點前後開始有雨，把戶外行程排在它之前最保險。`);
  }

  if (isFoggy && !thunder && !heavyRain) {
    plan.push("起霧時不利遠眺，可以改拍近景的紅磚紋理與霧中剪影。");
  }

  if (!isFoggy && !thunder && !heavyRain && codeForSky !== null && codeForSky <= 2) {
    plan.push("能見度不錯，適合往高處或開闊處取景，把舊山線沿線一次看足。");
  }

  /* --- 隨身物品 --------------------------------------------------- */

  if (thunder || heavyRain) {
    pack.push("雨衣（優於雨傘：雷雨或強風時長柄傘反而危險）");
  } else if (moderateRain || chance >= 60) {
    pack.push("雨傘或輕便雨衣");
  } else if (drizzle || chance >= 30) {
    pack.push("摺疊傘");
  }

  if (uv >= 8) {
    pack.push("防曬乳、帽子、太陽眼鏡");
  } else if (uv >= 5) {
    pack.push("防曬乳與遮陽帽");
  }

  if (highTemp >= 30) {
    pack.push("充足的飲用水與電解質飲料");
  }

  if (highTemp <= 12) {
    pack.push("保暖外套、圍巾與手套");
  }

  if (hourly.minVisibility !== null && hourly.minVisibility < 2000) {
    pack.push("開車者請確認霧燈與車燈正常");
  }

  if (low !== null && low <= 12) {
    pack.push("保溫瓶（清晨與夜間山區降溫明顯）");
  }

  plan.push("山區訊號不穩，建議先下載離線地圖；行動電源也值得帶著。");

  /* --- 依地理環境分類的專項提醒 ----------------------------------- */

  const scenes: SceneAdvice[] = [];

  const mountainLines: string[] = [];
  if (thunder || heavyRain) {
    mountainLines.push("午後雷雨與短時強降雨容易引發山洪與落石，請避免在溪谷、陡坡下方停留。");
  }
  if (isFoggy) {
    mountainLines.push("濃霧會讓山區道路能見度驟降，開車請開霧燈、拉長車距並放慢速度。");
  }
  if (maxLevel >= 5) {
    mountainLines.push("稜線與開闊處風勢更強，磚造遺構周邊請勿攀爬，以免被強風影響平衡。");
  }
  if (moderateRain || drizzle || heavyRain) {
    mountainLines.push("磚階、木棧與長苔的石面雨後特別滑，請走既有步道並扶好欄杆。");
  }
  if (highTemp <= 10) {
    mountainLines.push("海拔約 300–400 公尺，體感會比苗栗市區再低一些，保暖要確實。");
  }
  if (!isFoggy && !thunder && !heavyRain && codeForSky !== null && codeForSky <= 2) {
    mountainLines.push("目前視野條件不錯，適合眺望魚藤坪溪谷與舊山線沿線。");
  }
  if (mountainLines.length > 0) {
    scenes.push({ scene: "山區與舊山線", icon: "mountain", lines: mountainLines });
  }

  const waterLines: string[] = [];
  waterLines.push("魚藤坪溪屬水庫上游集水區，全年禁止戲水、烤肉與洗滌。");
  if (thunder || heavyRain || moderateRain || sum >= 3) {
    waterLines.push("上游降雨後溪水會在數十分鐘內暴漲，請勿靠近溪床與低窪處。");
  }
  if (sum < 1 && !moderateRain && !heavyRain) {
    waterLines.push("近期雨量不多時水色較清透，觀景平台的視角最好，但仍不可進入水域。");
  }
  scenes.push({ scene: "溪流與水域", icon: "droplet", lines: waterLines });

  const forestLines: string[] = [];
  if (highTemp >= 20 && highTemp <= 32 && humidity !== null && humidity >= 70) {
    forestLines.push("溫暖潮濕的天氣蚊蟲較活躍，建議穿著長褲並使用防蚊用品。");
  }
  if (highTemp >= 18) {
    forestLines.push("草叢與樹蔭下可能有蛇與虎頭蜂，行走時留意腳步、不要伸手進灌木。");
  }
  if (forestLines.length > 0) {
    scenes.push({ scene: "淺山森林與生態", icon: "leaf", lines: forestLines });
  }

  if (thunder || heavyRain || moderateRain || highTemp >= 32) {
    scenes.push({
      scene: "市區室內備案",
      icon: "shop",
      lines: [
        "三義市區的木雕街與文化展館是不受天候影響的替代行程，建議至少保留半天的彈性。",
      ],
    });
  }

  if (!thunder && !heavyRain && gusts < 40) {
    scenes.push({
      scene: "鐵道自行車",
      icon: "train",
      lines: [
        "目前的天候條件大致適合搭乘，仍請以營運單位的班次與現場公告為準，並提早完成報到。",
      ],
    });
  }

  /* --- 彙整 ------------------------------------------------------- */

  let level: WeatherAdvice["level"] = "good";
  if (risks.some((risk) => risk.severity === "danger")) level = "danger";
  else if (risks.length > 0 || chance >= 40 || highTemp >= 32 || uv >= 8 || maxLevel >= 5) {
    level = "watch";
  }

  const title =
    level === "danger"
      ? "天候不理想，安全優先"
      : level === "watch"
        ? "可以出發，但要留備案"
        : "條件不錯，適合安排行程";

  const summary =
    level === "danger"
      ? "預報條件對戶外行程不友善，建議順延或改走室內備案。"
      : level === "watch"
        ? "整體還能安排行程，但天氣會影響體感與動線，請照著下面的提醒準備。"
        : "目前的天氣條件相對穩定，適合走訪遺構區與舊山線沿線。";

  return {
    level,
    summary,
    title,
    risks,
    outfit: dedupe(outfit),
    plan: dedupe(plan),
    pack: dedupe(pack),
    scenes,
    windows: hourly.windows,
    reasons: dedupe(reasons),
  };
}

function snowLike(input: AdviceInput): boolean {
  return input.hourly.snow || (input.low !== null && input.low <= 3);
}

/* ------------------------------------------------------------------ *
 * 每日預報的一句話結論
 * ------------------------------------------------------------------ */

function dayAdvice(day: {
  code: number | null;
  high: number | null;
  rainChance: number | null;
  precipitation: number | null;
  gustMax: number | null;
  uvIndex: number | null;
}): { label: string; tone: WeatherDay["adviceTone"] } {
  const chance = day.rainChance ?? 0;
  const sum = day.precipitation ?? 0;
  const storm = day.code !== null && day.code >= 95;
  const heavy = day.code !== null && [65, 67, 82].includes(day.code);
  const level = windLevel(day.gustMax ?? null) ?? 0;

  if (storm || heavy || sum >= 15 || chance >= 80) {
    return { label: "避免山區行程", tone: "danger" };
  }
  if (chance >= 60 || sum >= 5 || level >= 6) {
    return { label: "記得帶雨具", tone: "watch" };
  }
  if ((day.high ?? 0) >= 33) {
    return { label: "留意高溫曝曬", tone: "watch" };
  }
  if ((day.uvIndex ?? 0) >= 9) {
    return { label: "紫外線偏強", tone: "watch" };
  }
  if (chance <= 20 && day.code !== null && day.code <= 2) {
    return { label: "適合出遊", tone: "good" };
  }
  return { label: "可安排行程", tone: "good" };
}

/* ------------------------------------------------------------------ *
 * 正規化
 * ------------------------------------------------------------------ */

export function normalizeWeather(data: unknown, now: Date = new Date()): WeatherPayload {
  const source = (data ?? {}) as {
    current?: Record<string, unknown>;
    daily?: Record<string, unknown>;
    hourly?: Record<string, unknown>;
  };
  const currentRaw = source.current ?? {};
  const dailyRaw = source.daily ?? {};
  const hourlyRaw = source.hourly ?? {};

  const listOf = (key: string): unknown[] => {
    const value = dailyRaw[key];
    return Array.isArray(value) ? value : [];
  };

  const times = listOf("time").filter((item): item is string => typeof item === "string");
  const codes = listOf("weather_code");
  const highs = listOf("temperature_2m_max");
  const lows = listOf("temperature_2m_min");
  const rains = listOf("precipitation_probability_max");
  const sums = listOf("precipitation_sum");
  const uvs = listOf("uv_index_max");
  const winds = listOf("wind_speed_10m_max");
  const gusts = listOf("wind_gusts_10m_max");
  const sunrises = listOf("sunrise");
  const sunsets = listOf("sunset");

  const forecast: WeatherDay[] = times.slice(0, 7).map((date, index) => {
    const info = codeInfo(codes[index]);
    const high = rounded(highs[index]);
    const low = rounded(lows[index]);
    const rainChance = rounded(rains[index]);
    const precipitation = roundedOne(sums[index]);
    const uvIndex = rounded(uvs[index]);
    const gustMax = rounded(gusts[index]);
    const advice = dayAdvice({
      code: rounded(codes[index]),
      high,
      rainChance,
      precipitation,
      gustMax,
      uvIndex,
    });

    return {
      date,
      label: index === 0 ? "今天" : index === 1 ? "明天" : weekdayLabel(date),
      weekday: weekdayLabel(date),
      condition: info.condition,
      icon: info.icon,
      tone: info.tone,
      high,
      low,
      rainChance,
      precipitation,
      uvIndex,
      windMax: rounded(winds[index]),
      gustMax,
      sunrise: clockLabel(sunrises[index]),
      sunset: clockLabel(sunsets[index]),
      adviceLabel: advice.label,
      adviceTone: advice.tone,
    };
  });

  const currentInfo = codeInfo(currentRaw.weather_code);
  const today = forecast[0];

  // 以台北時區取得「現在」是哪一天、哪一小時。
  const localDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const currentHour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Taipei",
      hour: "2-digit",
      hour12: false,
    }).format(now),
  );

  const hourly = summarizeHourly(hourlyRaw, currentHour);

  const high = today?.high ?? null;
  const low = today?.low ?? null;
  const dayRange = high !== null && low !== null ? high - low : null;

  const advice = buildAdvice({
    localDate,
    currentHour,
    currentCode: rounded(currentRaw.weather_code),
    currentTemp: roundedOne(currentRaw.temperature_2m),
    humidity: rounded(currentRaw.relative_humidity_2m),
    high,
    low,
    dayRange,
    rainChance: today?.rainChance ?? null,
    precipSum: today?.precipitation ?? null,
    uvMax: today?.uvIndex ?? null,
    windMax: today?.windMax ?? null,
    gustMax: today?.gustMax ?? null,
    hourly,
  });

  const currentWind = roundedOne(currentRaw.wind_speed_10m);
  const todayGust = today?.gustMax ?? roundedOne(currentRaw.wind_gusts_10m);

  return {
    location: `${ATTRACTION.cityZh}${ATTRACTION.shortNameZh}周邊`,
    updatedAt: now.toISOString(),
    localDate,
    current: {
      temperature: roundedOne(currentRaw.temperature_2m),
      apparentTemperature: roundedOne(currentRaw.apparent_temperature),
      humidity: rounded(currentRaw.relative_humidity_2m),
      condition: currentInfo.condition,
      plain: currentInfo.plain,
      icon: currentInfo.icon,
      tone: currentInfo.tone,
      windSpeed: currentWind,
      windGust: roundedOne(currentRaw.wind_gusts_10m),
      windLevel: windLevel(currentWind),
      precipitation: roundedOne(currentRaw.precipitation),
      visibility: rounded(currentRaw.visibility),
      isDay: currentRaw.is_day === 1,
    },
    today: {
      high,
      low,
      dayRange,
      rainChance: today?.rainChance ?? null,
      precipitation: today?.precipitation ?? null,
      uvIndex: today?.uvIndex ?? null,
      windMax: today?.windMax ?? null,
      gustMax: today?.gustMax ?? null,
      windLevelMax: windLevel(todayGust),
      sunrise: today?.sunrise ?? null,
      sunset: today?.sunset ?? null,
      rainOnsetHour: hourly.rainOnsetHour,
    },
    forecast,
    advice,
  };
}

/* ------------------------------------------------------------------ *
 * 取得資料
 * ------------------------------------------------------------------ */

function errorPayload(data: unknown): boolean {
  return Boolean(data && typeof data === "object" && (data as { error?: unknown }).error);
}

async function requestForecast(withHourly: boolean): Promise<Record<string, unknown>> {
  const response = await fetch(buildEndpoint({ hourly: withHourly }), {
    headers: { Accept: "application/json" },
    // 由邊緣節點代為快取上游回應，避免每次請求都往上游拿一次。
    cf: { cacheTtl: 600, cacheEverything: true },
  } as RequestInit & { cf: { cacheTtl: number; cacheEverything: boolean } });

  if (!response.ok) {
    throw new Error(`Weather upstream responded with ${response.status}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  if (errorPayload(data)) {
    throw new Error("Weather upstream returned an error payload");
  }
  return data;
}

interface CacheLike {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}

const CACHE_TTL_SECONDS = 900;

/**
 * 取得天氣資料，並在邊緣快取 15 分鐘。
 * 逐時資料拿不到時會自動退回只需即時與每日資料的請求，確保頁面仍有基本建議。
 * 任何失敗都會往上拋，由呼叫端決定要顯示什麼。
 */
export async function fetchWeather(): Promise<WeatherPayload> {
  const cacheKey = new Request(
    `https://longtengbridge.com/__weather-cache/v2/${ATTRACTION.latitude},${ATTRACTION.longitude}`,
    { method: "GET" },
  );

  const edgeCache = (globalThis as { caches?: { default?: CacheLike } }).caches?.default;

  if (edgeCache) {
    try {
      const cached = await edgeCache.match(cacheKey);
      if (cached) {
        return (await cached.json()) as WeatherPayload;
      }
    } catch {
      // 快取讀取失敗時直接回源，不影響頁面。
    }
  }

  let raw: Record<string, unknown>;
  try {
    raw = await requestForecast(true);
  } catch {
    raw = await requestForecast(false);
  }

  const payload = normalizeWeather(raw);

  if (edgeCache) {
    try {
      await edgeCache.put(
        cacheKey,
        new Response(JSON.stringify(payload), {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": `public, max-age=${CACHE_TTL_SECONDS}`,
          },
        }),
      );
    } catch {
      // 寫入快取失敗不影響回傳結果。
    }
  }

  return payload;
}

/** 天氣資料的可讀時間（台北時區 HH:MM） */
export function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Taipei",
  }).format(new Date(iso));
}
