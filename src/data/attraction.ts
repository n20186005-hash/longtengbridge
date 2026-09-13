/**
 * 龍騰斷橋（魚藤坪斷橋）景點實體資料。
 *
 * 這是「單景點 SEO 實體綁定」的唯一資料來源：
 * 全站任何需要寫入實體名稱、地址、座標、評分、官方來源的地方，都應從這裡取用，
 * 避免同一筆資料在多个檔案中各自寫死而逐漸不同步。
 */

export const ATTRACTION = {
  /** 景點官方英文全稱（對應 Google 地圖與交通部觀光署英文頁面：Remains of Longteng Bridge） */
  fullName: "Remains of Longteng Bridge",
  /** 景點官方中文全稱（文化資產名稱）：魚藤坪斷橋 */
  officialName: "魚藤坪斷橋",
  /** 遊客最常用的名稱：龍騰斷橋 */
  shortNameZh: "龍騰斷橋",
  /** 對應網域 longtengbridge.com 的英文俗稱 */
  shortName: "Longteng Bridge",
  /** 城市／鄉鎮 */
  city: "Sanyi Township",
  cityZh: "三義鄉",
  /** 縣市／州省 */
  state: "Miaoli County",
  stateZh: "苗栗縣",
  /** 國家 */
  country: "Taiwan",
  countryZh: "臺灣",
  countryCode: "TW",
  /** 郵遞區號 */
  postalCode: "367",
  /** 街道地址（Google 地圖登錄：苗49鄉道） */
  streetAddress: "苗49鄉道",
  streetAddressEn: "Miaoli County Road 49",
  /** 電話（Google 地圖登錄） */
  telephone: "+886-3-787-8599",
  telephoneDisplay: "+886 3 787 8599",
  /** Plus Code（Google 地圖登錄） */
  plusCode: "9Q5F+CJ Sanyi Township, Miaoli County, Taiwan",
  /** 座標（交通部觀光署／Google 地圖） */
  latitude: 24.3585179,
  longitude: 120.7740367,
  /** Google 地圖分享短連結 */
  mapsShareUrl: "https://maps.app.goo.gl/55jN8AsmsDdr5xGs5",
  /** Google 地圖嵌入用 src */
  mapsEmbedSrc: "https://www.google.com/maps?q=24.3585179,120.7740367&z=17&output=embed",
  /** Google 地圖分類 */
  googleCategory: "Heritage building",
  googleCategoryZh: "文化資產（古蹟）",
  /** 周邊核心地標 */
  nearbyLandmarks: [
    {
      name: "勝興車站",
      nameEn: "Shengxing Station",
      href: "/nearby-attractions/",
    },
    {
      name: "舊山線鐵道自行車龍騰站",
      nameEn: "Old Mountain Line Rail Bike Longteng Station",
      href: "/rail-bike/",
    },
    {
      name: "魚藤坪鐵橋",
      nameEn: "Yutengping Iron Bridge",
      href: "/yutengping-iron-bridge/",
    },
    {
      name: "南斷橋",
      nameEn: "South Broken Bridge",
      href: "/north-south-bridge/",
    },
  ],
  /** 地理歸屬層級（用於麵包屑與語意綁定） */
  breadcrumb: ["龍騰斷橋（魚藤坪斷橋）", "三義鄉", "苗栗縣", "臺灣"],
} as const;

/** 圖片語意化 alt 文字（主視覺） */
export const HERO_IMAGE_ALT = `${ATTRACTION.shortNameZh}（${ATTRACTION.officialName}）- ${ATTRACTION.cityZh}${ATTRACTION.stateZh}主要紅磚橋拱景觀`;

/**
 * Google 地圖使用者評分（最新同步資料）。
 *
 * 注意：依 Google 結構化資料政策，其他網站的評分不得作為本站的 aggregateRating，
 * 因此本站僅「如實顯示並標註來源」，不放進 JSON-LD。
 */
export const GOOGLE_REVIEW = {
  rating: 4.3,
  reviewCount: 24443,
  max: 5,
  category: ATTRACTION.googleCategory,
  sourceName: "Google 地圖使用者評分",
  sourceUrl: ATTRACTION.mapsShareUrl,
  /** 本次核對日期 */
  checkedAt: "2026-09-13",
  checkedAtDisplay: "2026 年 9 月 13 日",
} as const;

/** 星等陣列（用於畫面呈現 4.3 → 4 顆實心、1 顆部分） */
export const ratingStars = (rating: number) =>
  [1, 2, 3, 4, 5].map((star) => {
    const fill = Math.min(Math.max(rating - star + 1, 0), 1);
    return { star, fill };
  });

/** 官方與權威資料來源（E-E-A-T） */
export const OFFICIAL_SOURCES = [
  {
    name: "國家文化資產網：魚藤坪斷橋",
    nameEn: "National Cultural Heritage Database: Yutengping Broken Bridge",
    url: "https://nchdb.boch.gov.tw/assets/overview/monument/20031125000001",
    note: "文化資產名稱、年代與歷史。",
    scope: "文化資產",
  },
  {
    name: "苗栗文化觀光旅遊網：龍騰斷橋、南斷橋",
    nameEn: "Miaoli County Tourism: Longteng Bridge and the south section",
    url: "https://miaolitravel.net/article.aspx?sNo=04004516",
    note: "地方景點與旅遊資訊。",
    scope: "地方觀光",
  },
  {
    name: "交通部觀光署：Remains of Longteng Bridge",
    nameEn: "Taiwan Tourism Administration: Remains of Longteng Bridge",
    url: "https://www.taiwan.net.tw/m1.aspx?id=c100_342&sno=0001110",
    note: "景點位置與全國旅遊資訊。",
    scope: "中央觀光",
  },
  {
    name: "舊山線鐵道自行車：乘車資訊",
    nameEn: "Old Mountain Line Rail Bike: routes, fares and timetable",
    url: "https://www.oml-railbike.com/_pages/info/index.php",
    note: "A、B、C 路線、票價、班次與乘車規則。",
    scope: "營運單位",
  },
] as const;

/**
 * 地方／官方旅遊入口（權威 .gov / 官方外鏈）。
 * label 為中文頁使用、labelEn 為英文頁使用，兩邊各自單一語言，不在同一頁混排。
 */
export const AUTHORITY_LINKS = [
  {
    name: "臺灣交通部觀光署",
    url: "https://www.taiwan.net.tw/",
    label: "臺灣交通部觀光署官方觀光入口",
    labelEn: "Taiwan Tourism Administration (official tourism portal)",
  },
  {
    name: "苗栗文化觀光旅遊網",
    url: "https://miaolitravel.net/",
    label: "苗栗縣官方觀光旅遊網",
    labelEn: "Miaoli County official tourism portal",
  },
  {
    name: "國家文化資產網",
    url: "https://nchdb.boch.gov.tw/",
    label: "文化部文化資產局：國家文化資產網",
    labelEn: "Bureau of Cultural Heritage, Taiwan",
  },
] as const;
