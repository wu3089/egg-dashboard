const fs = require('fs');
const fetch = require('node-fetch'); // node-fetch@2
const Papa = require('papaparse');
const AdmZip = require('adm-zip');

// Replace with your actual FRED API key and series ID.
const apiKey = 'e2685f0089057c42bba0f40e745783cd';
const seriesId = 'APU0000708111';

const fredCsvUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=csv`;

async function updateData() {
  try {
    console.log("Fetching ZIP from FRED:", fredCsvUrl);
    const response = await fetch(fredCsvUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const buffer = await response.buffer();
    
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    console.log("Zip entries:", zipEntries.map(e => e.entryName));

    // Specifically look for "obs._by_real-time_period.csv" in the ZIP
    const csvEntry = zipEntries.find(entry => entry.entryName.includes('obs._by_real-time_period.csv'));
    if (!csvEntry) {
      throw new Error("Could not find obs._by_real-time_period.csv in the ZIP archive.");
    }
    
    // Extract CSV text
    const csvText = csvEntry.getData().toString('utf8');
    console.log("CSV text extracted.");

    // Parse CSV
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    console.log("Parsed CSV data:", parsed.data.slice(0, 5)); // Show first 5 rows for debug

    // Save as fredData.json
    fs.writeFileSync('fredData.json', JSON.stringify({ observations: parsed.data }, null, 2));
    console.log("Updated fredData.json successfully.");
  } catch (error) {
    console.error("Error updating FRED data:", error);
    process.exit(1);
  }
}

updateData();