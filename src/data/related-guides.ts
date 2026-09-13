/**
 * 攻略頁之間的延伸閱讀對應表。
 *
 * 只記錄 slug 的關係，標題與摘要由內容集合即時取得，
 * 避免同一段文字在資料檔與 Markdown 裡各寫一份而失去同步。
 */

/** 找不到特定對應時使用的通用延伸閱讀。 */
export const DEFAULT_RELATED_SLUGS = [
  "seasonal-guide",
  "facilities",
  "science-and-responsibility",
];

const RELATIONS: Record<string, string[]> = {
  visit: ["seasonal-guide", "facilities", "science-and-responsibility"],
  "seasonal-guide": ["visit", "rail-bike", "facilities"],
  facilities: ["visit", "parking", "accommodation"],
  "science-and-responsibility": ["history", "legends", "visit"],
  legends: ["history", "science-and-responsibility", "yutengping-iron-bridge"],
  history: ["legends", "science-and-responsibility", "yutengping-iron-bridge"],
  transportation: ["parking", "facilities", "visit"],
  parking: ["transportation", "facilities", "visit"],
  "rail-bike": ["rail-bike-routes", "seasonal-guide", "facilities"],
  "rail-bike-routes": ["rail-bike", "seasonal-guide", "nearby-attractions"],
  "one-day-trip": ["visit", "seasonal-guide", "food"],
  "nearby-attractions": ["one-day-trip", "food", "accommodation"],
  food: ["accommodation", "facilities", "one-day-trip"],
  accommodation: ["food", "facilities", "one-day-trip"],
  "family-guide": ["accessibility", "seasonal-guide", "facilities"],
  accessibility: ["family-guide", "facilities", "visit"],
  "photo-spots": ["seasonal-guide", "science-and-responsibility", "north-south-bridge"],
  "north-south-bridge": ["yutengping-iron-bridge", "visit", "history"],
  "yutengping-iron-bridge": ["north-south-bridge", "history", "science-and-responsibility"],
  updates: DEFAULT_RELATED_SLUGS,
};

/** 取得某一頁的延伸閱讀 slugs。 */
export function relatedSlugsFor(slug: string, limit = 3): string[] {
  const list = RELATIONS[slug] ?? DEFAULT_RELATED_SLUGS;
  return list.filter((item) => item !== slug).slice(0, limit);
}
