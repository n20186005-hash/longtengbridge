/**
 * 語系資料與 hreflang 配對。
 *
 * 本站以繁體中文（zh-Hant-TW）為預設語系，英文版只涵蓋國際旅客最需要的
 * 四頁（首頁、交通、鐵道自行車、一日遊），不做全站翻譯。
 *
 * 為什麼集中在這裡：
 * hreflang 必須雙向且互相對應，中文頁與英文頁各自寫一份很容易漏改一邊，
 * 導致 Google 收到不對稱的標記。因此兩邊的標記都由 ZH_EN_PAIRS 推導。
 *
 * 語系切換原則：
 * 每個頁面只呈現單一語言，跨語言的入口只留 Header 的切換鈕，而且切換鈕
 * 必須落在「同一頁的另一個語言版本」，不是一律丟回對方首頁。中文頁沒有
 * 英文版時才退回英文首頁，讓切換鈕永遠不會指向 404。
 */

export const DEFAULT_LANG = "zh-Hant-TW";

export interface Alternate {
  hreflang: string;
  /** 站內路徑（含開頭與結尾斜線） */
  path: string;
}

/**
 * 中英頁面配對表。
 *
 * 只有成對存在的頁面才列進來；英文版沒有的中文頁不會輸出 en 標記，
 * 避免指向不存在的網址。
 */
export const ZH_EN_PAIRS: { zh: string; en: string }[] = [
  { zh: "/", en: "/en/" },
  { zh: "/transportation/", en: "/en/transportation/" },
  { zh: "/rail-bike/", en: "/en/rail-bike/" },
  { zh: "/one-day-trip/", en: "/en/itinerary/" },
];

const EN_BY_ZH = new Map(ZH_EN_PAIRS.map((pair) => [pair.zh, pair.en]));
const ZH_BY_EN = new Map(ZH_EN_PAIRS.map((pair) => [pair.en, pair.zh]));

/** 英文版首頁；中文頁沒有對應英文版時的切換目標。 */
export const EN_HOME = "/en/";

/** 中文版首頁；全站預設語系的入口，也是英文頁找不到對應中文頁時的退路。 */
export const ZH_HOME = "/";

/** 路徑正規化：Astro.url.pathname 可能省略結尾斜線，查表前先補齊以免漏找。 */
function normalizePath(path: string): string {
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

/**
 * 中文頁 → 同一頁的英文版。
 * 沒有英文版的中文頁回傳 undefined，由呼叫端決定退回英文首頁。
 */
export function enHrefFor(zhPath: string): string | undefined {
  return EN_BY_ZH.get(normalizePath(zhPath));
}

/**
 * 英文頁 → 同一頁的中文版。
 * 回傳 undefined 代表查不到配對，由呼叫端退回中文首頁。
 */
export function zhHrefFor(enPath: string): string | undefined {
  return ZH_BY_EN.get(normalizePath(enPath));
}

/**
 * 中文頁面的 hreflang 清單。
 * x-default 一律指向中文版，因為中文版才是全站預設與最完整的版本。
 */
export function zhAlternates(path: string): Alternate[] {
  const en = EN_BY_ZH.get(path);
  if (!en) {
    return [
      { hreflang: DEFAULT_LANG, path },
      { hreflang: "x-default", path },
    ];
  }
  return [
    { hreflang: DEFAULT_LANG, path },
    { hreflang: "en", path: en },
    { hreflang: "x-default", path },
  ];
}

/** 英文頁面的 hreflang 清單；x-default 與中文版指向同一頁，保持對稱。 */
export function enAlternates(path: string): Alternate[] {
  const zh = ZH_BY_EN.get(path) ?? "/";
  return [
    { hreflang: "en", path },
    { hreflang: DEFAULT_LANG, path: zh },
    { hreflang: "x-default", path: zh },
  ];
}

/** 依頁面語系取得該輸出哪一組 hreflang。 */
export function alternatesFor(lang: string, path: string): Alternate[] {
  return lang.toLowerCase().startsWith("en") ? enAlternates(path) : zhAlternates(path);
}

/** 英文頁面的導覽；英文版頁面少，刻意保持精簡。 */
export const EN_NAV = [
  { label: "Visitor guide", href: "/en/" },
  { label: "Getting there", href: "/en/transportation/" },
  { label: "Rail bike routes", href: "/en/rail-bike/" },
  { label: "One-day trip plans", href: "/en/itinerary/" },
];

/** 英文版的站台層級文案 */
export const EN_SITE = {
  name: "Longteng Bridge Guide",
  tagline: "English guide to the Remains of Longteng Bridge",
  description:
    "An independent English guide to the Remains of Longteng Bridge in Sanyi, Miaoli, Taiwan: what survives of the 1907 red-brick railway bridge, why the 1935 earthquake broke it, and how to plan a visit.",
  organizationDescription:
    "Independent travel information site covering the Remains of Longteng Bridge, the Old Mountain Line rail bike and day trips around Sanyi, Miaoli.",
  disclaimer:
    "LongtengBridge.com is an independent travel information site. It is not the official website of the Remains of Longteng Bridge, the Miaoli County Government or the Old Mountain Line Rail Bike. Always confirm tickets, schedules and opening status with the operating body.",
  /** 中文站的入口標籤（給英文頁面的「切換語言」與「更多中文資訊」使用） */
  chineseSiteLabel: "中文版（繁體）",
};
