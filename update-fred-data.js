const fs = require('fs');
const fetch = require('node-fetch');
const Papa = require('papaparse');

// Replace with your FRED API key and series ID.
const apiKey = 'e2685f0089057c42bba0f40e745783cd';
const seriesId = 'APU0000708111';
const fredCsvUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=csv`;

async function updateData() {
  try {
    const response = await fetch(fredCsvUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    const result = Papa.parse(csvText, { header: true });
    // Save the parsed data as JSON into fredData.json
    fs.writeFileSync('fredData.json', JSON.stringify(result.data, null, 2));
    console.log("FRED data updated successfully.");
  } catch (error) {
    console.error("Error updating FRED data:", error);
    process.exit(1);
  }
}

updateData();
