const puppeteer = require('puppeteer');
const fs = require('fs');

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

    // Launch Puppeteer with increased timeout and headless mode
    const browser = await puppeteer.launch({
        headless: true, // Use 'true' for running on GitHub Actions
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    let results = [];

    for (const store of stores) {
        console.log(`Scraping price from ${store.name}...`);
        
        try {
            await page.goto(store.url, { waitUntil: "domcontentloaded", timeout: 30000 });

            // Wait for the price selector to appear (prevents missing elements issue)
            await page.waitForSelector(store.selector, { timeout: 10000 });

            const price = await page.$eval(store.selector, el => el.textContent.trim());

            results.push({ store: store.name, price, timestamp: new Date().toISOString() });
            console.log(`✅ ${store.name}: $${price}`);

        } catch (error) {
            console.error(`❌ Failed to scrape ${store.name}:`, error);
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
