const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

async function scrapeEggPrices() {
    console.log("🔍 Starting egg price scraping...");

    const browser = await puppeteer.launch({
        headless: false,  // 🛑 Disable headless mode (helps avoid bot detection)
        executablePath: "/usr/bin/google-chrome-stable", // ✅ Use real Chrome browser (adjust for Mac/Windows)
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--window-size=1280,800' // ✅ Makes browser look real
        ]
    });

    const page = await browser.newPage();
    
    // ✅ Use a real user agent string (makes the browser look legit)
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    // ✅ Set screen size to normal desktop dimensions
    await page.setViewport({ width: 1280, height: 800 });

    // ✅ Pretend to be a real user
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    const stores = [
        {
            name: "Walmart",
            url: "https://www.walmart.com/ip/Great-Value-Large-White-Eggs-12-Count/145051970",
            selectors: ["span[class*='price']", "div[data-testid='product-price']", "div[class*='prod-PriceHero']"]
        },
        {
            name: "Target",
            url: "https://www.target.com/p/grade-a-large-eggs-12ct-good-38-gather-8482-packaging-may-vary/-/A-14713534",
            selectors: ["div[data-test='product-price']", "span[data-test='offerPrice']", "div[class*='styles__Price']"]
        }
    ];

    let results = [];

    for (const store of stores) {
        console.log(`🌐 Navigating to ${store.name}...`);

        try {
            await page.goto(store.url, { waitUntil: "networkidle2", timeout: 60000 });

            // Scroll down slightly (triggers lazy loading)
            await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Save Debug HTML
            const html = await page.content();
            fs.writeFileSync(`debug-${store.name}.html`, html);
            console.log(`✅ Saved debug HTML for ${store.name}`);

            let price = "Not Found";
            for (const selector of store.selectors) {
                try {
                    console.log(`🔎 Checking selector ${selector} for ${store.name}`);
                    await page.waitForSelector(selector, { timeout: 15000 });
                    price = await page.$eval(selector, el => el.textContent.trim().replace(/[^\d.]/g, ''));
                    if (price) break;
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

async function getKrogerAccessToken() {
    try {
        const response = await fetch("http://localhost:3000/get-kroger-token", { method: "POST" });
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const jsonResponse = await response.json();
        return jsonResponse.access_token;
    } catch (error) {
        console.error("❌ Error fetching Kroger access token:", error);
        return null;
    }
}
async function getLocationId(zipCode) {
    const accessToken = await getKrogerAccessToken();
    if (!accessToken) return;

    try {
        const response = await fetch(`https://api-ce.kroger.com/v1/locations?filter.zipCode=${zipCode}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const jsonResponse = await response.json();

        console.log("📍 Full Location Response:", JSON.stringify(jsonResponse, null, 2)); // ✅ Debugging Log

        if (jsonResponse.data && jsonResponse.data.length > 0) {
            const locationId = jsonResponse.data[0].locationId; // Get the first valid `locationId`
            console.log("✅ Kroger Store Location ID:", locationId);
            return locationId;
        } else {
            console.error("❌ No stores found for this ZIP code.");
            return null;
        }
    } catch (error) {
        console.error("❌ Error fetching store location:", error);
        return null;
    }
}

async function getProductPrice(productId, zipCode) {
    const locationId = await getLocationId(zipCode);
    if (!locationId) return;

    const accessToken = await getKrogerAccessToken();
    if (!accessToken) return;

    try {
        const response = await fetch(`http://localhost:3000/get-product-price?productId=${productId}&locationId=${locationId}`, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const productData = await response.json();

        if (productData && productData.data && productData.data[0] && productData.data[0].items) {
            const price = productData.data[0].items[0].price?.regular || "Not Available";
            document.getElementById("kroger-price").textContent = `$${price}`;
        } else {
            document.getElementById("kroger-price").textContent = "Price Not Found";
        }
    } catch (error) {
        console.error("❌ Error fetching product data:", error);
        document.getElementById("kroger-price").textContent = "Error Fetching Price";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const productId = "0001111060903"; // Your actual product ID
    const zipCode = "45242"; // Your ZIP code
    getProductPrice(productId, zipCode);
});

scrapeEggPrices();
