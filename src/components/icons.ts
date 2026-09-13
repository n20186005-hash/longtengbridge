/** 全站圖示路徑表（24×24 線性圖示）。抽離成獨立模組，讓元件與資料檔都能取得圖示名稱型別。 */

export type IconName =
  | "arrow"
  | "bed"
  | "book"
  | "camera"
  | "calendar"
  | "car"
  | "check"
  | "chevron"
  | "clock"
  | "compass"
  | "droplet"
  | "family"
  | "food"
  | "fuel"
  | "health"
  | "info"
  | "leaf"
  | "map"
  | "menu"
  | "mountain"
  | "parking"
  | "rail"
  | "route"
  | "shield"
  | "shop"
  | "shirt"
  | "signal"
  | "sparkle"
  | "sun"
  | "toilet"
  | "train"
  | "umbrella"
  | "walk"
  | "x";

export const ICON_PATHS: Record<IconName, string> = {
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  bed: '<path d="M2 20v-9M2 16h20v4M2 13h7v3M10 16v-3h6a4 4 0 0 1 4 3"/><circle cx="16" cy="9" r="2.2"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2V5ZM6 17h13M9 7h6"/>',
  camera: '<path d="M3 8h3l2-3h8l2 3h3v11H3V8Z"/><circle cx="12" cy="13" r="3.5"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  car: '<path d="m5 17-1 3M19 17l1 3M3 13l2.2-5.2A3 3 0 0 1 8 6h8a3 3 0 0 1 2.8 1.8L21 13v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4Z"/><path d="M5 13h14M7 15h.01M17 15h.01"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  droplet: '<path d="M12 3s6 6.4 6 10.5A6 6 0 0 1 6 13.5C6 9.4 12 3 12 3Z"/>',
  family:
    '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M2.5 20c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M14 15c3.6-.7 6.1 1 6.8 5"/>',
  food: '<path d="M7 3v18M4.5 3v5a2.5 2.5 0 0 0 5 0V3M16.5 3c-1.6 1-2.5 2.6-2.5 5s.9 3.4 2.5 3.5V21"/>',
  fuel: '<path d="M4 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16M3 21h11M4 11h9M16 8l3 3v8a2 2 0 1 1-4 0v-4h-2"/>',
  health: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M12 10v6M9 13h6M9 6V4h6v2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 8h.01"/>',
  leaf: '<path d="M4 20c0-8 5-14 16-15 0 11-5 16-13 16H4ZM6 18c3-5 7-8 11-9"/>',
  map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  mountain: '<path d="m3 20 6.5-11 3.2 5 2.3-4 6 10H3Z"/><path d="m8 11 1.5 2 1.2-2"/>',
  parking: '<circle cx="12" cy="12" r="9"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
  rail: '<path d="M7 4h10M8 4l2 16M16 4l-2 16M6 8h12M7 13h10M8 18h8"/>',
  route:
    '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3v-6a3 3 0 0 1 3-3"/>',
  shield:
    '<path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
  shop: '<path d="M3 9h18l-1-5H4L3 9ZM5 9v11h14V9M9 20v-6h6v6"/>',
  shirt: '<path d="M8 3 4 5l-1 5 3 1v10h12V11l3-1-1-5-4-2-2 2h-2L8 3Z"/>',
  signal: '<path d="M4 20v-4M9 20v-9M14 20v-13M19 20V5"/>',
  sparkle:
    '<path d="m12 3 1.1 3.2A7 7 0 0 0 17.8 11L21 12l-3.2 1.1a7 7 0 0 0-4.7 4.7L12 21l-1.1-3.2a7 7 0 0 0-4.7-4.7L3 12l3.2-1.1a7 7 0 0 0 4.7-4.7L12 3Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
  toilet:
    '<circle cx="7" cy="4.5" r="1.8"/><path d="M7 7.5v5M4.5 20.5 7 13l2.5 7.5M4.5 10.5h5"/><circle cx="17" cy="4.5" r="1.8"/><path d="M17 7.5v5M14 20.5 17 13l3 7.5M14 10.5h6"/>',
  train:
    '<rect x="5" y="3" width="14" height="15" rx="3"/><path d="M8 8h8M8 12h.01M16 12h.01M8 18l-2 3M16 18l2 3M8 21h8"/>',
  umbrella: '<path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9ZM12 12v6a2.5 2.5 0 0 0 5 0"/>',
  walk: '<circle cx="13" cy="4" r="2"/><path d="m10 21 2-7-3-3 2-4 4 3 3 1M12 14l4 7M9 11l-4 4"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
};
