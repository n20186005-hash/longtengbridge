/**
 * 龍騰斷橋（苗栗縣三義鄉龍騰村，海拔約 300–400 公尺）的常年氣候與生態資料。
 *
 * 用途：提供「什麼季節來、該穿什麼、要防什麼」的長期判斷依據。
 * 性質：以下為區域常年平均的**概略值**，以中央氣象署 1991–2020 年氣候平均值為基礎整理，
 *       並依龍騰地區地勢略作調整；僅適合用來安排季節與裝備，不代表任何一天的實際天氣。
 */

export type SeasonKey = "spring" | "meiyu" | "summer" | "autumn" | "winter";

export interface MonthClimate {
  /** 月份 1–12 */
  month: number;
  label: string;
  season: SeasonKey;
  /** 平均高溫（°C，概略值） */
  high: number;
  /** 平均低溫（°C，概略值） */
  low: number;
  /** 平均降雨日數（日，概略值） */
  rainDays: number;
  /** 降雨量級 */
  rainLevel: "偏少" | "中等" | "偏多" | "最多";
  /** 平均相對濕度（%，概略值） */
  humidity: number;
  /** 這個月份最值得看的重點 */
  highlight: string;
  /** 這個月份最需要留意的風險 */
  caution: string;
}

export const MONTH_CLIMATE: MonthClimate[] = [
  {
    month: 1,
    label: "1 月",
    season: "winter",
    high: 18,
    low: 13,
    rainDays: 9,
    rainLevel: "中等",
    humidity: 80,
    highlight: "東北季風下的清透光線，斷橋剪影與山谷層次分明",
    caution: "濕冷加上濃霧，午後能見度可能快速下降",
  },
  {
    month: 2,
    label: "2 月",
    season: "winter",
    high: 19,
    low: 14,
    rainDays: 11,
    rainLevel: "偏多",
    humidity: 81,
    highlight: "山櫻花、霧氣與紅磚殘拱同框",
    caution: "春雨綿密、石階濕滑，鞋底防滑很重要",
  },
  {
    month: 3,
    label: "3 月",
    season: "spring",
    high: 21,
    low: 16,
    rainDays: 13,
    rainLevel: "偏多",
    humidity: 82,
    highlight: "雲霧繚繞機率高，最能拍出「斷橋在雲裡」的畫面",
    caution: "濃霧、地面返潮，開車請開霧燈並放慢",
  },
  {
    month: 4,
    label: "4 月",
    season: "spring",
    high: 25,
    low: 19,
    rainDays: 13,
    rainLevel: "偏多",
    humidity: 80,
    highlight: "油桐花季開場，夜間賞螢（黑翅螢）進入高峰",
    caution: "螢火蟲季人車多，且蛇類開始活躍",
  },
  {
    month: 5,
    label: "5 月",
    season: "meiyu",
    high: 28,
    low: 22,
    rainDays: 16,
    rainLevel: "偏多",
    humidity: 81,
    highlight: "油桐花如雪、山谷水氣重，生態最熱鬧",
    caution: "梅雨鋒面報到，短時強降雨會讓溪水暴漲",
  },
  {
    month: 6,
    label: "6 月",
    season: "meiyu",
    high: 30,
    low: 24,
    rainDays: 18,
    rainLevel: "最多",
    humidity: 82,
    highlight: "雨後雲瀑與滿水位溪谷，綠意最飽和",
    caution: "典型梅雨月，行程務必保留雨天備案",
  },
  {
    month: 7,
    label: "7 月",
    season: "summer",
    high: 32,
    low: 25,
    rainDays: 15,
    rainLevel: "偏多",
    humidity: 78,
    highlight: "午後雷陣雨前後的對比光線，以及清晨的清爽時段",
    caution: "高溫曝曬、午後雷擊、颱風季開始",
  },
  {
    month: 8,
    label: "8 月",
    season: "summer",
    high: 32,
    low: 25,
    rainDays: 16,
    rainLevel: "最多",
    humidity: 80,
    highlight: "早晨六至八點是夏季唯一涼爽的遊覽窗",
    caution: "颱風與西南氣流、山區落石風險最高",
  },
  {
    month: 9,
    label: "9 月",
    season: "autumn",
    high: 30,
    low: 24,
    rainDays: 13,
    rainLevel: "偏多",
    humidity: 78,
    highlight: "颱風外圍沉降氣流帶來的高透視度遠景",
    caution: "秋颱路徑多變，出發前務必確認警特報",
  },
  {
    month: 10,
    label: "10 月",
    season: "autumn",
    high: 27,
    low: 22,
    rainDays: 8,
    rainLevel: "中等",
    humidity: 75,
    highlight: "雨季結束、視野轉清，公認最好走的月份之一",
    caution: "日夜溫差變大，山區傍晚降溫快",
  },
  {
    month: 11,
    label: "11 月",
    season: "autumn",
    high: 24,
    low: 18,
    rainDays: 7,
    rainLevel: "偏少",
    humidity: 74,
    highlight: "乾爽晴朗、能見度最佳，攝影與健行的黃金期",
    caution: "虎頭蜂活動尾聲仍具威脅，勿拍打、勿噴香水",
  },
  {
    month: 12,
    label: "12 月",
    season: "winter",
    high: 20,
    low: 14,
    rainDays: 8,
    rainLevel: "中等",
    humidity: 78,
    highlight: "低角度冬陽斜射進橋拱，光影層次最立體",
    caution: "東北季風帶來濕冷與霧雨，保暖與防水要兼顧",
  },
];

export interface SeasonStrategy {
  key: SeasonKey;
  name: string;
  months: string;
  /** 一句話總結 */
  summary: string;
  /** 遊覽重點 */
  focus: string[];
  /** 穿著與裝備 */
  gear: string[];
  /** 主要風險 */
  risks: string[];
  /** 建議時段 */
  bestTime: string;
}

export const SEASONS: SeasonStrategy[] = [
  {
    key: "spring",
    name: "春季（3–5 月）",
    months: "3、4、5 月",
    summary: "雲霧與花季交疊，畫面最美但雨具與防滑不能省。",
    focus: [
      "3 月雲霧繚繞，最容易拍到斷橋沒入雲海的畫面",
      "4 月油桐花開，白色花毯落在舊山線沿線",
      "4–5 月夜間黑翅螢出沒，是三義一年一度的生態高峰",
    ],
    gear: [
      "防水外套＋可收納雨傘，山區午後陣雨來得快",
      "鞋底刻紋深的防滑鞋，磚階與石階遇雨極滑",
      "夜間賞螢需紅光手電筒，並避免使用閃光燈",
    ],
    risks: ["濃霧造成行車能見度下降", "梅雨前鋒的短時強降雨", "蛇類與蚊蟲開始活躍"],
    bestTime: "上午 8–11 點，光線柔且雲霧尚未完全散去",
  },
  {
    key: "meiyu",
    name: "梅雨季（5 月下旬–6 月）",
    months: "5 月下旬、6 月",
    summary: "全年雨量最集中的時段，行程必須有雨天備案。",
    focus: [
      "雨後溪谷水量豐沛，綠意最飽和",
      "雲瀑與低空雲帶在橋體後方流動，適合拍氣氛照",
      "室內備案可安排三義木雕博物館與老街",
    ],
    gear: [
      "雨衣優先於雨傘（山區風大，傘容易被吹壞）",
      "背包防水套、手機防水袋",
      "備一雙可替換的乾鞋襪",
    ],
    risks: ["短時強降雨造成溪水暴漲", "磚階青苔濕滑", "落石與邊坡鬆動"],
    bestTime: "雨停後的空檔，並隨時查看雷達回波",
  },
  {
    key: "summer",
    name: "夏季（7–8 月）",
    months: "7、8 月",
    summary: "高溫與午後雷陣雨主導，早去早回是最佳策略。",
    focus: [
      "清晨 6–8 點是全月最涼爽也最通透的時段",
      "午後雷雨前的積雲堆疊，是夏季特有的天空",
      "鐵道自行車建議預約上午班次，避開雷雨時段",
    ],
    gear: [
      "透氣排汗衣物＋遮陽帽、袖套",
      "每人至少 1 公升飲水與電解質補充",
      "折疊傘或輕便雨衣，應付午後雷陣雨",
    ],
    risks: ["紫外線過量與熱傷害", "午後雷擊（勿停留空曠處與鐵橋上）", "颱風與西南氣流"],
    bestTime: "上午 6–10 點，11 點後建議轉往室內或林蔭處",
  },
  {
    key: "autumn",
    name: "秋季（9–11 月）",
    months: "9、10、11 月",
    summary: "能見度與舒適度俱佳，是全年最推薦的遊覽季節。",
    focus: [
      "10 月後雨季結束，山谷視野清透",
      "11 月乾爽晴朗，是攝影與鐵道自行車的黃金期",
      "秋陽低角度斜射，最能看出紅磚拱圈的立體感",
    ],
    gear: [
      "薄外套（早晚溫差可達 8–10°C）",
      "好走的運動鞋即可，路面相對乾爽",
      "偏光鏡或減光鏡，應付強光下的紅磚細節",
    ],
    risks: ["9 月秋颱路徑難測", "10–11 月虎頭蜂活動仍活躍", "傍晚山區降溫快"],
    bestTime: "上午 9 點至下午 3 點，光線與溫度都最舒服",
  },
  {
    key: "winter",
    name: "冬季（12–2 月）",
    months: "12、1、2 月",
    summary: "東北季風帶來濕冷與濃霧，換取最乾淨的光影層次。",
    focus: [
      "低角度冬陽斜射入拱，紅磚紋理對比最強",
      "濃霧中的斷橋有強烈的遺構氛圍",
      "2 月山櫻花點綴舊山線沿線",
    ],
    gear: [
      "防風防潑水外套＋中層保暖，體感常比氣溫低 3–5°C",
      "帽子與手套，山谷風大時很有感",
      "車燈與霧燈檢查，回程常遇濃霧",
    ],
    risks: ["濃霧造成行車與步行視線不良", "連續濕冷、地面返潮", "天色暗得早，不宜晚歸"],
    bestTime: "上午 10 點至下午 2 點，避開清晨最濕冷的時段",
  },
];

/**
 * 水質與水文：龍騰斷橋跨越魚藤坪溪，屬鯉魚潭水庫上游集水區範圍，
 * 水體以「山區溪流」型態為主，水色與濁度高度受降雨影響。
 */
export const WATER_QUALITY_NOTES: string[] = [
  "斷橋跨越的是魚藤坪溪，位於鯉魚潭水庫上游集水區，屬水源保護範圍，溪水禁止戲水、烤肉與洗滌。",
  "乾季水色清透、可見溪床卵石；連續降雨後三小時內常轉為混濁並快速暴漲，切勿涉水或靠近溪床拍照。",
  "山區溪流的水位變化比平地快，上游降雨時此處可能尚未下雨，務必以現場告示與溪水濁度作為判斷依據。",
  "水質屬於「自然溪流」型態，並非親水遊憩水域；紀錄觀察可以，但不要下水、不要丟石頭、不要引入外來種。",
];

export interface WildlifeEntry {
  months: string;
  title: string;
  detail: string;
  /** 是否屬於需要提高警覺的季節性風險 */
  caution: boolean;
}

/**
 * 生態日曆：低海拔次生林、溪流與舊山線沿線的觀察重點。
 * 內容以常見物種與常見季節性風險為主，避免任何捕捉或干擾行為的指引。
 */
export const WILDLIFE_CALENDAR: WildlifeEntry[] = [
  {
    months: "1–2 月",
    title: "冬候鳥與山櫻花",
    detail: "山谷可見白頭翁、綠繡眼等常見鳥類；2 月起山櫻花在舊山線沿線綻放。",
    caution: false,
  },
  {
    months: "3–4 月",
    title: "春季鳥況與油桐花開",
    detail: "大冠鷲會在上升氣流盤旋鳴叫；4 月油桐進入花期，白色花毯落在步道上。",
    caution: false,
  },
  {
    months: "4–5 月",
    title: "螢火蟲季（黑翅螢）",
    detail: "入夜後在無光害的林緣與溪畔可見黑翅螢；觀察時使用紅光並保持距離、不捕捉。",
    caution: true,
  },
  {
    months: "5–8 月",
    title: "蛇類與蚊蟲活躍",
    detail: "赤尾鮐、龜殼花等常見於潮濕草叢與石堆；請走既有步道、勿伸手入石縫。",
    caution: true,
  },
  {
    months: "6–8 月",
    title: "蟬鳴與溪流蜻蜓",
    detail: "熊蟬與薄翅蟬鳴聲最盛，溪畔可見短腹幽蟌、白痣珈蟌等溪流性蜻蛉。",
    caution: false,
  },
  {
    months: "8–11 月",
    title: "虎頭蜂警戒期",
    detail: "秋季蜂群攻擊性最高；不噴香水、不穿深色亮面衣物、不拍打，遇蜂群請低身緩退。",
    caution: true,
  },
  {
    months: "9–11 月",
    title: "過境鳥與猛禽南遷",
    detail: "秋過境期間可見赤腹鷹、灰面鵟鷹過境，適合在山谷開闊處靜態觀察。",
    caution: false,
  },
  {
    months: "12 月",
    title: "低海拔次生林與山羌鳴聲",
    detail: "冬季林相清爽，清晨偶可聽見山羌與白鼻心活動的聲音。",
    caution: false,
  },
];

/** 台灣常見的季節性氣象風險（非即時，僅供長期規劃參考） */
export const WEATHER_RISK_NOTES: string[] = [
  "颱風：7–9 月為主，颱風警報期間山區步道與鐵道自行車多半停駛或封閉，請以官方公告為準。",
  "梅雨：5 月下旬至 6 月常有連續性強降雨，是全年最需要雨天備案的時段。",
  "午後雷陣雨：6–9 月幾乎天天有機會發生，雷雨時請離開空曠處、鐵橋與大樹下。",
  "濃霧：11 月至翌年 3 月的清晨與夜間常見，行車請開霧燈並加大車距。",
  "東北季風：12–2 月帶來濕冷與強陣風，體感溫度明顯低於平地。",
];
