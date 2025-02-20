const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

const stores = [
    {
        name: "Walmart",
        url: "https://www.walmart.com/ip/Great-Value-Large-White-Eggs-12-Count/145051970",
        selectors: ["span.price-characteristic", "div[data-automation-id='product-price']"]
    },
    {
        name: "Target",
        url: "https://www.target.com/p/grade-a-large-eggs-12ct-good-38-gather-8482-packaging-may-vary/-/A-14713534",
        selectors: ["div[data-test='product-price']", "span[data-test='current-price']"]
    }
];

async function scrapeEggPrices() {
    console.log("🔍 Starting egg price scraping...");

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    let results = [];

    for (const store of stores) {
        console.log(`🌐 Navigating to ${store.name}...`);

        try {
            await page.goto(store.url, { waitUntil: "domcontentloaded", timeout: 60000 });

            // Scroll down to force content load
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Debug: Save HTML to check if content is actually loading
            const html = await page.content();
            fs.writeFileSync(`debug-${store.name}.html`, html);
            console.log(`✅ Saved debug HTML for ${store.name}`);

            let price = "Not Found";
            for (const selector of store.selectors) {
                try {
                    console.log(`🔎 Checking selector ${selector} for ${store.name}`);
                    await page.waitForSelector(selector, { timeout: 15000 });
                    price = await page.$eval(selector, el => el.textContent.trim());
                    break;
                } catch (e) {
                    console.warn(`⚠️ ${store.name}: Selector ${selector} not found, trying next...`);
                }
            }

            results.push({ store: store.name, price, timestamp: new Date().toISOString() });
            console.log(`✅ ${store.name}: $${price}`);

        } catch (error) {
            console.error(`❌ Failed to scrape ${store.name}:`, error);

            // Save the full page screenshot for debugging
            await page.screenshot({ path: `error-${store.name}.png`, fullPage: true });
            results.push({ store: store.name, price: "Not Found", timestamp: new Date().toISOString() });
        }
    }

    await browser.close();
    fs.writeFileSync("eggPrices.json", JSON.stringify(results, null, 2));
    console.log("✅ Egg prices updated successfully!");
}

scrapeEggPrices();
