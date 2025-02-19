const fs = require('fs');
const fetch = require('node-fetch'); // using node-fetch@2
const Papa = require('papaparse');
const AdmZip = require('adm-zip');

// Replace with your actual FRED API key and series ID.
const apiKey = 'e2685f0089057c42bba0f40e745783cd';
const seriesId = 'APU0000708111';

// Construct the FRED CSV URL (it will return a ZIP file)
const fredCsvUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=csv`;

async function updateData() {
  try {
    console.log("Fetching ZIP from FRED:", fredCsvUrl);
    const response = await fetch(fredCsvUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Get the response as a Buffer since it's a binary ZIP file.
    const buffer = await response.buffer();
    
    // Create a new AdmZip instance from the buffer.
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();

    // Debug: Log zip entries names
    console.log("Zip entries:", zipEntries.map(e => e.entryName));

    // Find the CSV file inside the zip. In your case, it might be inside a folder,
    // so look for an entry that ends with ".csv"
    const csvEntry = zipEntries.find(entry => entry.entryName.toLowerCase().endsWith('.csv'));
    if (!csvEntry) {
      throw new Error("No CSV file found in the ZIP archive");
    }
    
    // Extract the CSV text as a UTF-8 string.
    const csvText = csvEntry.getData().toString('utf8');
    console.log("CSV text extracted.");

    // Parse the CSV using Papa Parse, with headers.
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    console.log("Parsed CSV data.");

    // Write the parsed data to fredData.json (wrapped in an object, e.g., observations)
    fs.writeFileSync('fredData.json', JSON.stringify({ observations: parsed.data }, null, 2));
    console.log("Updated fredData.json successfully.");
  } catch (error) {
    console.error("Error updating FRED data:", error);
    process.exit(1);
  }
}

updateData();