 # Hank's Egg Tracker

An automated egg price tracking dashboard that monitors and visualizes egg prices across multiple sources at https://wu3089.github.io/egg-dashboard/.

## Features

- **Historical Price Tracking**: 
  - Visualizes FRED (Federal Reserve Economic Data) egg price data
  - Interactive chart with multi year views
  - Data updates every 14 days via automated pipeline 

- **Real-time Price Monitoring (In Progress)**:
  - Automated scraping of major retailers:
    - Kroger API
  - Price tracking for standard dozen large white eggs

- **Web Interface**:
  - Fun, egg-y, visualization
  - Easy-to-read price trends

## Setup

1. Clone the repository
2. Install Node.js dependencies:
```bash
npm install node-fetch@2 papaparse adm-zip puppeteer puppeteer-extra puppeteer-extra-plugin-stealth
```

3. Set up environment variables in `.env`:
```env
FRED_API_KEY=your_fred_api_key
```

4. Run the FRED data updater:
```bash
node update-fred-data.js
```

5. Run the price scraper:
```bash
node update-egg-prices.js
```

## Automated Updates

The project includes two GitHub Actions workflows:

1. FRED Data Update (`update-fred-data.yml`):
   - Runs every 14 days
   - Updates historical egg price data
   - Maintains JSON data format

2. Retail Price Scraping (`update-egg-prices.yml`):
   - Runs every Monday
   - Scrapes current retail prices
   - Uses stealth browser techniques to avoid detection

## Notes

- This is an educational project for tracking egg price trends
- All data is sourced from public APIs and retail websites
- Price information is for reference only

## License

MIT License