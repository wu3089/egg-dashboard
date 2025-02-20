const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin()); // Enable stealth mode

const stores = [
    {
        name: "Walmart",
        url: "https://www.walmart.com/ip/Great-Value-Large-White-Eggs-12-Count/145051970",
        selector: "span.price-characteristic"
    },
    {
        name: "Target",
        url: "https://www.target.com/p/grade-a-large-eggs-12ct-good-38-gather-8482-packaging-may-vary/-/A-14713534",
        selector: "div[data-test='product-price']"
    }
];

async function scrapeEggPrices() {
    console.log("Starting egg price scraping...");

    // Launch Puppeteer with Stealth Plugin to bypass bot detection
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    let results = [];

    for (const store of stores) {
        console.log(`Scraping price from ${store.name}...`);
        
        try {
            await page.goto(store.url, { waitUntil: "networkidle2", timeout: 30000 });

            // Wait longer for selector
            await page.waitForSelector(store.selector, { timeout: 30000 });

            // Debugging: Take a screenshot if selector fails
            await page.screenshot({ path: `debug-${store.name}.png`, fullPage: true });

            const price = await page.$eval(store.selector, el => el.textContent.trim());

            results.push({ store: store.name, price, timestamp: new Date().toISOString() });
            console.log(`✅ ${store.name}: $${price}`);

        } catch (error) {
            console.error(`❌ Failed to scrape ${store.name}:`, error);

            // Take a screenshot for debugging
            await page.screenshot({ path: `error-${store.name}.png`, fullPage: true });

            results.push({ store: store.name, price: "Not Found", timestamp: new Date().toISOString() });
        }
    }

    await browser.close();

    // Save prices to JSON file
    fs.writeFileSync("eggPrices.json", JSON.stringify(results, null, 2));

    console.log("Egg prices updated successfully!");
}

// ✅ Call function
scrapeEggPrices();
