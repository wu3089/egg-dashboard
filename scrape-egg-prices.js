const puppeteer = require('puppeteer');
const fs = require('fs');

// List of stores and their URLs
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
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    let results = [];

    for (const store of stores) {
        console.log(`Scraping price from ${store.name}...`);
        await page.goto(store.url, { waitUntil: "networkidle2" });

        try {
            const price = await page.$eval(store.selector, el => el.textContent.trim());
            results.push({ store: store.name, price, timestamp: new Date().toISOString() });
        } catch (error) {
            console.error(`Failed to scrape ${store.name}:`, error);
            results.push({ store: store.name, price: "Not Found", timestamp: new Date().toISOString() });
        }
    }

    await browser.close();

    // Save all prices to JSON
    writeFileSync("eggPrices.json", JSON.stringify(results, null, 2));
    console.log("Egg prices updated successfully!");
}

scrapeEgg
