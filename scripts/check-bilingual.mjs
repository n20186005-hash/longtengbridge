import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const dist = new URL("../dist/", import.meta.url).pathname;
const htmlFiles = [];
function walk(folder) {
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    const file = join(folder, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (file.endsWith(".html")) htmlFiles.push(file);
  }
}
walk(dist);

const failures = [];
const pages = new Map();
for (const file of htmlFiles) {
  const route = `/${relative(dist, file).replace(/index\.html$/, "").replace(/\.html$/, "")}`;
  if (route === "/404") continue;
  pages.set(route, readFileSync(file, "utf8"));
}

const pairs = [
  ["/", "/en/"],
  ["/transportation/", "/en/transportation/"],
  ["/rail-bike/", "/en/rail-bike/"],
  ["/one-day-trip/", "/en/itinerary/"],
  ["/bridge-halfday/", "/en/bridge-halfday/"],
  ["/nearby-attractions/", "/en/nearby-attractions/"],
  ["/railbike-a-route/", "/en/railbike-a-route/"],
  ["/railbike-b-route/", "/en/railbike-b-route/"],
  ["/visit/", "/en/visit/"],
  ["/parking/", "/en/parking/"],
  ["/rail-bike-routes/", "/en/rail-bike-routes/"],
  ["/photo-spots/", "/en/photo-spots/"],
  ["/north-south-bridge/", "/en/north-south-bridge/"],
  ["/accessibility/", "/en/accessibility/"],
  ["/family-guide/", "/en/family-guide/"],
  ["/accommodation/", "/en/accommodation/"],
  ["/food/", "/en/food/"],
  ["/parking-motorcycle/", "/en/parking-motorcycle/"],
  ["/brick-arch-structure/", "/en/brick-arch-structure/"],
  ["/bridge-history-1935/", "/en/bridge-history-1935/"],
  ["/bridge-management/", "/en/bridge-management/"],
  ["/bridge-pet-guide/", "/en/bridge-pet-guide/"],
  ["/bridge-rainy-day/", "/en/bridge-rainy-day/"],
  ["/bridge-safety-checklist/", "/en/bridge-safety-checklist/"],
  ["/bridge-school-trip/", "/en/bridge-school-trip/"],
  ["/bridge-sunrise-sunset/", "/en/bridge-sunrise-sunset/"],
  ["/bridge-ticket-hours/", "/en/bridge-ticket-hours/"],
  ["/bridge-two-day/", "/en/bridge-two-day/"],
  ["/bridge-wheelchair/", "/en/bridge-wheelchair/"],
  ["/huoyanshan-guide/", "/en/huoyanshan-guide/"],
  ["/miaoli-day-trip/", "/en/miaoli-day-trip/"],
  ["/north-bridge-photo/", "/en/north-bridge-photo/"],
  ["/parking-railbike/", "/en/parking-railbike/"],
  ["/parking-weekend/", "/en/parking-weekend/"],
  ["/railbike-booking/", "/en/railbike-booking/"],
  ["/railbike-c-route/", "/en/railbike-c-route/"],
  ["/railbike-family/", "/en/railbike-family/"],
  ["/sanyi-wood-sculpture/", "/en/sanyi-wood-sculpture/"],
  ["/shengxing-old-street-food/", "/en/shengxing-old-street-food/"],
  ["/shengxing-station-guide/", "/en/shengxing-station-guide/"],
  ["/south-bridge-access/", "/en/south-bridge-access/"],
  ["/taian-old-station/", "/en/taian-old-station/"],
  ["/taichung-day-trip/", "/en/taichung-day-trip/"],
  ["/train-to-bridge/", "/en/train-to-bridge/"],
  ["/yutengping-bridge-view/", "/en/yutengping-bridge-view/"],
  ["/yutengping-iron-bridge/", "/en/yutengping-iron-bridge/"],
  ["/updates/", "/en/updates/"],
  ["/guide-library/", "/en/guide-library/"],
  ["/science-and-responsibility/", "/en/science-and-responsibility/"],
  ["/history/", "/en/history/"],
  ["/legends/", "/en/legends/"],
  ["/seasonal-guide/", "/en/seasonal-guide/"],
  ["/facilities/", "/en/facilities/"],
];
const pairByRoute = new Map(pairs.flatMap(([zh, en]) => [[zh, en], [en, zh]]));
const englishRoutes = new Set(pairs.map(([, en]) => en));
const untranslatedRoutes = [...pages.keys()].filter((route) =>
  !route.startsWith("/en/") && route !== "/" &&
  !["/weather/", "/about/", "/sources/", "/privacy/"].includes(route) &&
  !pairByRoute.has(route)
);

for (const [route, html] of pages) {
  const english = route.startsWith("/en/");
  const expectedLang = english ? "en" : "zh-Hant-TW";
  if (!html.includes(`<html lang="${expectedLang}">`)) {
    failures.push(`${route}: incorrect html lang (expected ${expectedLang})`);
  }
  if (english && !englishRoutes.has(route)) {
    failures.push(`${route}: English route lacks an explicit Chinese pair`);
  }
  const canonical = `https://longtengbridge.com${route}`;
  if (!html.includes(`rel="canonical" href="${canonical}"`)) {
    failures.push(`${route}: incorrect canonical`);
  }

  for (const [, rawHref] of html.matchAll(/\bhref="([^"]+)"/g)) {
    if (!rawHref.startsWith("/") || rawHref.startsWith("//")) continue;
    const [path, fragment] = rawHref.slice(1).split("#");
    const target = `/${path.split("?")[0]}`;
    if (target.startsWith("/_astro/") || target.startsWith("/_server-islands/")) continue;
    if (target.match(/\.[a-z0-9]+$/i)) {
      if (!existsSync(join(dist, target))) failures.push(`${route}: missing asset ${target}`);
      continue;
    }
    if (!pages.has(target)) failures.push(`${route}: broken internal link ${target}`);
    // Anchors are checked within each generated page (not against remote URLs).
    if (fragment && pages.has(target)) {
      const targetHtml = pages.get(target);
      if (!targetHtml.includes(`id="${fragment}"`)) failures.push(`${route}: missing anchor ${target}#${fragment}`);
    }
  }

  if (pairByRoute.has(route)) {
    const other = pairByRoute.get(route);
    const expectedHreflang = english ? "zh-Hant-TW" : "en";
    if (!html.includes(`hreflang="${expectedHreflang}" href="https://longtengbridge.com${other}"`)) {
      failures.push(`${route}: missing hreflang pair ${other}`);
    }
  } else if (!english && /rel="alternate" hreflang="en"/.test(html)) {
    failures.push(`${route}: unpaired Chinese page advertises a non-existent English translation`);
  }
  if (english) {
    // Proper-name Chinese characters are useful in an English guide; other
    // Chinese UI text is not. Ignore metadata, scripts, and tag attributes.
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<!--[^]*?-->/g, "")
      .replace(/<[^>]*>/g, " ");
    const allowedNames = /魚藤坪斷橋|龍騰斷橋|魚藤坪鐵橋|勝興車站|龍騰站|三義交流道/g;
    const remaining = visible.replace(allowedNames, "").match(/[\u3400-\u9fff]+/g) || [];
    if (remaining.length) failures.push(`${route}: untranslated Chinese UI text: ${[...new Set(remaining)].join(", ")}`);
  }
}

console.log(`Bilingual route audit: ${pages.size} routes, ${englishRoutes.size} English pages, ${pairs.length} translation pairs.`);
console.log(`${untranslatedRoutes.length} Chinese guide routes still have no English counterpart.`);
if (process.argv.includes("--require-complete") && untranslatedRoutes.length) {
  failures.push(`Full translation coverage incomplete:\n${untranslatedRoutes.join("\n")}`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log("PASS: language, route links, anchors, canonical, hreflang and English UI text.");
}
