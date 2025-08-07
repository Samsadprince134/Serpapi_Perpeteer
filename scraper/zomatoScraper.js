// // // // require("dotenv").config();
// // // // const playwright = require("playwright");
// // // // const axios = require("axios");
// // // // const cheerio = require("cheerio");

// // // // async function scrapeByLocation(city, area, limit) {
// // // //   console.log("Scraping area:", area);

// // // //   const normalizedCity = city.trim().toLowerCase().replace(/\s+/g, "-");
// // // //   const normalizedArea = area.trim() ? area.trim().toLowerCase().replace(/\s+/g, "-") : "";
// // // //   const path = normalizedArea
// // // //     ? `/${normalizedCity}/${normalizedArea}-restaurants`
// // // //     : `/${normalizedCity}/restaurants`;

// // // //   const url = process.env.ZOMATO_BASE_URL + path;
// // // //   const browser = await playwright.firefox.launch({ headless: true });
// // // //   const context = await browser.newContext();
// // // //   const page = await context.newPage();
// // // //   const links = new Set();

// // // //   try {
// // // //     await page.goto(url, { timeout: 60000 });
// // // //     await page.waitForTimeout(3000);

// // // //     // Scroll and collect restaurant URLs
// // // //     while (links.size < limit) {
// // // //       await page.mouse.wheel(0, 50000);
// // // //       await page.waitForTimeout(3000);
// // // //       const content = await page.content();
// // // //       const $ = cheerio.load(content);
// // // //       $('a[href^="/"]').each((i, el) => {
// // // //         const href = $(el).attr("href");
// // // //         if (href.includes(`/${normalizedCity}/`) && href.includes("/info")) {
// // // //           links.add(process.env.ZOMATO_BASE_URL + href);
// // // //         }
// // // //       });
// // // //       if (links.size >= limit) break;
// // // //     }
// // // // console.log(`🔗 Collected URLs (${links.size}):`, Array.from(links).slice(0, limit));

// // // //     // Fetch restaurant details
// // // // //     const results = [];
// // // // //     for (const link of Array.from(links).slice(0, limit)) {
// // // // //       try {
// // // // //         // const resp = await axios.get(link);
// // // // //         // const $ = cheerio.load(resp.data);
// // // // //         // const jsonLd = JSON.parse($('script[type="application/ld+json"]').eq(1).html());
// // // // //         // results.push({
// // // // //         //   name: jsonLd.name || null,
// // // // //         //   address: jsonLd.address?.streetAddress || null,
// // // // //         //   phone: jsonLd.telephone || "NA",
// // // // //         // });
// // // // //       } catch (e) {
// // // // //         results.push({ error: `Failed to parse ${link}` });
// // // // //       }
// // // // //     }
// // // // // console.log(`📋 Parsed restaurant data (${results.length}):`, results.slice(0, 3));

// // // //     return Array.from(links).slice(0, limit);
// // // //   } finally {
// // // //     await browser.close();
// // // //   }
// // // // }

// // // // module.exports = { scrapeByLocation };



// // // // scraper/zomatoScraper.js
// // // require('dotenv').config();
// // // const playwright = require('playwright');
// // // const axios      = require('axios');
// // // const cheerio    = require('cheerio');

// // // async function scrapeByLocation(city, area = '', limit = parseInt(process.env.AREA_LIMIT, 10) || 50) {
// // //   console.log(`[INFO] Start scraping for city='${city}', area='${area || 'default'}', limit=${limit}`);

// // //   // Normalize inputs
// // //   const normalizedCity = city.trim().toLowerCase().replace(/\s+/g, '-');
// // //   const normalizedArea = area.trim().toLowerCase().replace(/\s+/g, '-');
// // //   const locationPath  = normalizedArea
// // //     ? `${normalizedCity}/${normalizedArea}-restaurants`
// // //     : `${normalizedCity}/restaurants`;
// // //   const baseURL       = process.env.ZOMATO_BASE_URL;

// // //   const categoryIds = [null, 1, 3];  // default, delivery, cafés
// // //   const allLinks    = new Set();
// // //   const t0          = Date.now();

// // //   // Launch headless Firefox
// // //   const browser = await playwright.firefox.launch({ headless: true });
// // //   const context = await browser.newContext({
// // //     userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0',
// // //     viewport:  { width: 1280, height: 800 },
// // //     locale:    'en-US'
// // //   });
// // //   const page = await context.newPage();

// // //   // Step 1: Collect links category by category
// // //   for (const cat of categoryIds) {
// // //     let pageURL = `${baseURL}/${locationPath}`;
// // //     if (cat) pageURL += `?category=${cat}`;
// // //     console.log(`\n[INFO] Navigating to (${cat||'default'}): ${pageURL}`);

// // //     try {
// // //       await page.goto(pageURL, { timeout: 60000 });
// // //       await page.waitForTimeout(3000);
// // //       if (cat === 1) {
// // //         // extra wait for delivery cards
// // //         await page.waitForSelector("div[class*='sc-']", { timeout: 15000 });
// // //         await page.waitForTimeout(5000);
// // //       }
// // //     } catch (err) {
// // //       console.warn(`[WARN] Failed to load ${pageURL}: ${err.message}`);
// // //       continue;
// // //     }

// // //     let stagnant = 0;
// // //     while (allLinks.size < limit) {
// // //       const before = allLinks.size;
// // //       await page.mouse.wheel(0, 50000);
// // //       await page.waitForTimeout(5000);

// // //       const $ = cheerio.load(await page.content());
// // //       $('a[href^="/"]').each((_, el) => {
// // //         const href = $(el).attr('href');
// // //         if (!href) return;
// // //         if (cat === 1) {
// // //           // delivery category: match order/menu/restaurant
// // //           if (/(order|menu|restaurant)/.test(href)) {
// // //             allLinks.add(baseURL + href);
// // //           }
// // //         } else {
// // //           // default & cafés
// // //           if (href.includes(`/${normalizedCity}/`) && href.includes('/info')) {
// // //             allLinks.add(baseURL + href);
// // //           }
// // //         }
// // //       });

// // //       console.log(`[CAT ${cat||'default'}] Links collected: ${allLinks.size}`);
// // //       if (allLinks.size >= limit) break;
// // //       if (allLinks.size === before) {
// // //         stagnant++;
// // //         if (stagnant >= 8) {
// // //           console.log('[WARN] No new links; moving to next category');
// // //           break;
// // //         }
// // //       } else stagnant = 0;
// // //     }

// // //     if (allLinks.size >= limit) {
// // //       console.log('[✅] Global limit reached, stopping category loop');
// // //       break;
// // //     }
// // //   }

// // //   await browser.close();
// // //   console.log(`[INFO] Collected ${allLinks.size} links in ${((Date.now()-t0)/1000).toFixed(2)}s`);

// // //   // Step 2: Fetch JSON-LD details from each restaurant page
// // //   const results = [];
// // //   const toFetch = Array.from(allLinks).slice(0, limit);
// // //   //console.log(`[INFO] Fetching details for ${toFetch.length} restaurants`);

// // //   // for (const link of toFetch) {
// // //   //   try {
// // //   //     const resp = await axios.get(link, { timeout: 10000 });
// // //   //     const $    = cheerio.load(resp.data);
// // //   //     const scripts = $('script[type="application/ld+json"]');
// // //   //     // Try the 2nd JSON-LD block first, fallback to the 1st
// // //   //     const raw = scripts.eq(1).html() || scripts.eq(0).html();
// // //   //     const data = JSON.parse(raw);
// // //   //     results.push({
// // //   //       name:    data.name    || null,
// // //   //       address: data.address?.streetAddress || null,
// // //   //       phone:   data.telephone || 'NA'
// // //   //     });
// // //   //   } catch (err) {
// // //   //     console.warn(`[WARN] Parse failed for ${link}: ${err.message}`);
// // //   //     results.push({ error: `Failed to parse ${link}` });
// // //   //   }
// // //   // }

// // //   //console.log(`[INFO] Parsed ${results.length} restaurant records`);
// // //   return toFetch;
// // // }

// // // module.exports = { scrapeByLocation };



// // // scraper/zomatoScraper.js
// // require('dotenv').config();
// // const playwright = require('playwright');
// // const axios = require('axios');
// // const cheerio = require('cheerio');

// // const PROXY_POOL_SIZE = 100;
// // let proxyPool = new Set();

// // // Fetch working proxies from https://free-proxy-list.net
// // async function fetchFreeProxies(max = 200) {
// //   const url = 'https://free-proxy-list.net/';
// //   const proxies = [];

// //   try {
// //     const res = await axios.get(url);
// //     const $ = cheerio.load(res.data);
// //     console.log("res",res.data);

// //     let rows = 0;
// //     $('#proxylisttable tbody tr').each((_, el) => {
// //       rows++;
// //       if (proxies.length >= max) return false;

// //       const cols = $(el).find('td');
// //       const ip = $(cols[0]).text();
// //       const port = $(cols[1]).text();
// //       const isHttps = $(cols[6]).text().toLowerCase() === 'yes';
// //       const anonymity = $(cols[4]).text().toLowerCase();

// //       if (isHttps && anonymity !== 'transparent') {
// //         proxies.push(`http://${ip}:${port}`);
// //       }
// //     });

// //     console.log(`[DEBUG] Parsed ${rows} rows, got ${proxies.length} valid proxies`);
// //   } catch (err) {
// //     console.error('[ERROR] Proxy fetch failed:', err.message);
// //   }

// //   return proxies;
// // }


// // // Maintain pool size
// // async function refillProxyPool() {
// //   if (proxyPool.size >= PROXY_POOL_SIZE) return;

// //   const needed = PROXY_POOL_SIZE - proxyPool.size;
// //   const fetched = await fetchFreeProxies(needed + 50);

// //   // Use fallback if none fetched
// //   const proxiesToUse = fetched.length > 0 ? fetched : 0;

// //   for (const proxy of proxiesToUse) {
// //     if (proxyPool.size >= PROXY_POOL_SIZE) break;
// //     proxyPool.add(proxy);
// //   }

// //   console.log(`[POOL] Proxy pool refilled. Current size: ${proxyPool.size}`);
// // }


// // // Get a random proxy
// // console.log("hi000000")
// // function getRandomProxy() {
// //   console.log("hi1")
// //   const proxies = Array.from(proxyPool);
// //   const randomIndex = Math.floor(Math.random() * proxies.length);
// //   return proxies[randomIndex];
// //   console.log("hi2")
// // }

// // // Core function with proxy fallback and auto-repair pool
// // async function scrapeByLocation(city, area = '', limit = parseInt(process.env.AREA_LIMIT, 10) || 50) {
// //     console.log("yahan hun")
// //   if (proxyPool.size === 0) await refillProxyPool();
// //  console.log("procy pool k baad")
// //  console.log(proxyPool.size)
// //   for (let attempt = 0; attempt < proxyPool.size; attempt++) {
// //     console.log("random procxy s phle")
   
// //     const proxy = getRandomProxy();
// //      console.log("random procxy s baad")
// //     console.log(`[INFO] Attempting with proxy: ${proxy}`);

// //     try {
// //       const results = await scrapeOnce(city, area, limit, proxy);
// //       if (results.length > 0) return results;

// //       console.warn(`[WARN] Proxy ${proxy} returned 0 results.`);
// //     } catch (err) {
// //       console.warn(`[FAIL] Proxy ${proxy} failed: ${err.message}`);
// //     }

// //     // Remove and refill if needed
// //     proxyPool.delete(proxy);
// //     await refillProxyPool();
// //   }

// //   throw new Error('❌ All proxies failed or returned no data.');
// // }

// // // Scrape with one proxy attempt
// // async function scrapeOnce(city, area, limit, proxy) {
// //   const normalizedCity = city.trim().toLowerCase().replace(/\s+/g, '-');
// //   const normalizedArea = area.trim().toLowerCase().replace(/\s+/g, '-');
// //   const locationPath = normalizedArea
// //     ? `${normalizedCity}/${normalizedArea}-restaurants`
// //     : `${normalizedCity}/restaurants`;
// //   const baseURL = process.env.ZOMATO_BASE_URL || 'https://www.zomato.com';

// //   const categoryIds = [null, 1, 3];
// //   const allLinks = new Set();
// //   const t0 = Date.now();

// //   const browser = await playwright.firefox.launch({
// //     headless: true,
// //     proxy: { server: proxy }
// //   });

// //   const context = await browser.newContext({
// //     userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
// //     viewport: { width: 1280, height: 800 },
// //     locale: 'en-US'
// //   });

// //   await context.addInitScript(() => {
// //     Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
// //   });

// //   const page = await context.newPage();

// //   for (const cat of categoryIds) {
// //     let pageURL = `${baseURL}/${locationPath}`;
// //     if (cat) pageURL += `?category=${cat}`;
// //     console.log(`[INFO] Navigating (${cat || 'default'}): ${pageURL}`);

// //     try {
// //       await page.goto(pageURL, { timeout: 60000 });
// //       await page.waitForTimeout(3000);
// //       if (cat === 1) {
// //         await page.waitForSelector("div[class*='sc-']", { timeout: 15000 });
// //         await page.waitForTimeout(5000);
// //       }
// //     } catch (err) {
// //       await browser.close();
// //       throw err;
// //     }

// //     let stagnant = 0;
// //     while (allLinks.size < limit) {
// //       const before = allLinks.size;
// //       await page.waitForTimeout(3000);
// //       await page.mouse.wheel(0, 30000);
// //       await page.waitForTimeout(2000);

// //       const $ = cheerio.load(await page.content());
// //       $('a[href^="/"]').each((_, el) => {
// //         const href = $(el).attr('href');
// //         if (!href) return;
// //         if (cat === 1) {
// //           if (/(order|menu|restaurant)/.test(href)) {
// //             allLinks.add(baseURL + href);
// //           }
// //         } else {
// //           if (href.includes(normalizedCity) && href.includes('/info')) {
// //             allLinks.add(baseURL + href);
// //           }
// //         }
// //       });

// //       console.log(`[CAT ${cat || 'default'}] Links collected: ${allLinks.size}`);
// //       if (allLinks.size >= limit) break;
// //       if (allLinks.size === before) {
// //         stagnant++;
// //         if (stagnant >= 5) {
// //           console.log('[WARN] Stagnant scraping — moving on');
// //           break;
// //         }
// //       } else stagnant = 0;
// //     }

// //     if (allLinks.size >= limit) break;
// //   }

// //   await browser.close();
// //   console.log(`[INFO] ✅ Collected ${allLinks.size} links in ${((Date.now() - t0) / 1000).toFixed(2)}s`);
// //   return Array.from(allLinks).slice(0, limit);
// // }

// // module.exports = { scrapeByLocation };


// // scraper/zomatoScraper.js
// if (typeof global.File === 'undefined') {
//   global.File = class File extends Object {};
// }

// // scraper/zomatoScraper.js
// require('dotenv').config();
// const puppeteer = require('puppeteer-extra');
// const Stealth = require('puppeteer-extra-plugin-stealth');
// const cheerio = require('cheerio');

// puppeteer.use(Stealth());
// puppeteer.use(require('puppeteer-extra-plugin-stealth')());

// // simple sleep helper
// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function scrapeByLocation(city, area = '', limit = parseInt(process.env.AREA_LIMIT, 10) || 50) {
//   console.log(`[INFO] Start scraping for city='${city}', area='${area || 'default'}', limit=${limit}`);

//   const normalizedCity = city.trim().toLowerCase().replace(/\s+/g, '-');
//   const normalizedArea = area.trim().toLowerCase().replace(/\s+/g, '-');
//   const locationPath = normalizedArea
//     ? `${normalizedCity}/${normalizedArea}-restaurants`
//     : `${normalizedCity}/restaurants`;
//   const baseURL = process.env.ZOMATO_BASE_URL;

//   // Optional proxy
//   const proxyServer = process.env.PROXY || null;
//   console.log(`[DEBUG] Proxy: ${proxyServer || 'No proxy used'}`);


   

//   const launchOptions = { headless: true, args: [] };
//   if (proxyServer) launchOptions.args.push(`--proxy-server=${proxyServer}`);

//   const browser = await puppeteer.launch(launchOptions);
//   const page = await browser.newPage();

//   // Spoof user agent and viewport
//   await page.setUserAgent(
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
//     'AppleWebKit/537.36 (KHTML, like Gecko) ' +
//     'Chrome/117.0.0.0 Safari/537.36'
//   );
//   await page.setViewport({ width: 1280, height: 800 });

//   const allLinks = new Set();
//   const t0 = Date.now();

//   // Iterate through categories: default, delivery (1), cafes (3)
//   for (const cat of [null, 1, 3]) {
//     let url = `${baseURL}/${locationPath}`;
//     if (cat) url += `?category=${cat}`;
//     console.log(`\n[INFO] Navigating to (${cat || 'default'}): ${url}`);

//     try {
//       await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
//       // extra wait for delivery category
//       if (cat === 1) await sleep(5000);
//       else await sleep(3000);
//     } catch (err) {
//       console.warn(`[WARN] Failed to load ${url}: ${err.message}`);
//       continue;
//     }

//     let stagnant = 0;
//     while (allLinks.size < limit) {
//       const before = allLinks.size;
//       await sleep(2000);
//       // scroll down
//       await page.evaluate(() => window.scrollBy(0, window.innerHeight));
//       await sleep(2000);

//       const html = await page.content();
//       const $ = cheerio.load(html);
//       $('a[href^="/"]').each((_, el) => {
//         const href = $(el).attr('href');
//         if (!href) return;
//         if (cat === 1) {
//           // delivery category: order, menu, restaurant links
//           if (/(order|menu|restaurant)/.test(href)) {
//             allLinks.add(baseURL + href);
//           }
//         } else {
//           // default & cafes: /city/.../info
//           if (href.includes(`/${normalizedCity}/`) && href.includes('/info')) {
//             allLinks.add(baseURL + href);
//           }
//         }
//       });

//       console.log(`[CAT ${cat || 'default'}] Links collected: ${allLinks.size}`);
//       if (allLinks.size >= limit) break;

//       if (allLinks.size === before) {
//         stagnant++;
//         if (stagnant >= 5) {
//           console.log('[WARN] No new links; moving to next category');
//           break;
//         }
//       } else {
//         stagnant = 0;
//       }
//     }

//     if (allLinks.size >= limit) {
//       console.log('[✅] Global limit reached');
//       break;
//     }
//   }

//   await browser.close();
//   console.log(`[INFO] Collected ${allLinks.size} links in ${((Date.now() - t0) / 1000).toFixed(2)}s`);

//   // Return up to the limit
//   return Array.from(allLinks).slice(0, limit);
// }

// module.exports = { scrapeByLocation };



// Polyfill File for undici
if (typeof global.File === 'undefined') {
  global.File = class File extends Object {};
}

// scraper/zomatoScraper.js
require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');
const cheerio = require('cheerio');
const { executablePath } = require('puppeteer');

puppeteer.use(Stealth());

// simple sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeByLocation(city, area = '', limit = parseInt(process.env.AREA_LIMIT, 10) || 50) {
  console.log(`[INFO] Start scraping for city='${city}', area='${area || 'default'}', limit=${limit}`);

  const normalizedCity = city.trim().toLowerCase().replace(/\s+/g, '-');
  const normalizedArea = area.trim().toLowerCase().replace(/\s+/g, '-');
  const locationPath = normalizedArea
    ? `${normalizedCity}/${normalizedArea}-restaurants`
    : `${normalizedCity}/restaurants`;
  const baseURL = process.env.ZOMATO_BASE_URL;

  const proxyServer = process.env.PROXY || null;
  console.log(`[DEBUG] Proxy: ${proxyServer || 'No proxy used'}`);

  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ],
    executablePath: executablePath()
  };
  if (proxyServer) launchOptions.args.push(`--proxy-server=${proxyServer}`);

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  // Spoof user agent and viewport
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
    'Chrome/117.0.0.0 Safari/537.36'
  );
  await page.setViewport({ width: 1280, height: 800 });

  const allLinks = new Set();
  const t0 = Date.now();

  // Iterate through categories: default, delivery (1), cafes (3)
  for (const cat of [null, 1, 3]) {
    let url = `${baseURL}/${locationPath}`;
    if (cat) url += `?category=${cat}`;
    console.log(`\n[INFO] Navigating to (${cat || 'default'}): ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      await sleep(cat === 1 ? 5000 : 3000);
    } catch (err) {
      console.warn(`[WARN] Failed to load ${url}: ${err.message}`);
      continue;
    }

    let stagnant = 0;
    while (allLinks.size < limit) {
      const before = allLinks.size;
      await sleep(2000);
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await sleep(2000);

      const html = await page.content();
      const $ = cheerio.load(html);
      $('a[href^="/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        if (cat === 1) {
          if (/(order|menu|restaurant)/.test(href)) allLinks.add(baseURL + href);
        } else {
          if (href.includes(`/${normalizedCity}/`) && href.includes('/info')) allLinks.add(baseURL + href);
        }
      });

      console.log(`[CAT ${cat || 'default'}] Links collected: ${allLinks.size}`);
      if (allLinks.size >= limit) break;
      if (allLinks.size === before) {
        stagnant++;
        if (stagnant >= 5) {
          console.log('[WARN] No new links; moving to next category');
          break;
        }
      } else stagnant = 0;
    }
    if (allLinks.size >= limit) {
      console.log('[✅] Global limit reached');
      break;
    }
  }

  await browser.close();
  console.log(`[INFO] Collected ${allLinks.size} links in ${((Date.now() - t0) / 1000).toFixed(2)}s`);

  return Array.from(allLinks).slice(0, limit);
}

module.exports = { scrapeByLocation };

