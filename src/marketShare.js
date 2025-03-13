// Market share chart

export let marketShareChart; // Export the chart instance

export function createMarketShareChart() {
  const ctxMarketShare = document.getElementById('marketShareChart');
  if (!ctxMarketShare) return;

  // Data from WATT Global Media, 2025 Company Survey (TOP 20 ONLY)
  const top20CompanyHensData = [
    { company: 'Cal-Maine Foods', hens: 50.61 },
    { company: 'Rose Acre Farms', hens: 25.50 },
    { company: 'Daybreak Foods Inc.', hens: 23.30 },
    { company: 'Hillandale Farms', hens: 18.34 },
    { company: 'Mid-States Specialty Eggs', hens: 15.00 },
    { company: 'MPS Egg Farms', hens: 13.30 },
    { company: 'Center Fresh Group', hens: 12.50 },
    { company: 'Opal Foods', hens: 12.36 },
    { company: 'Prairie Star Farms', hens: 12.20 },
    { company: 'Trillium Farm Holdings', hens: 11.50 },
    { company: 'Herbruck\'s Poultry Ranch', hens: 10.80 },
    { company: 'Michael Foods', hens: 9.70 },
    { company: 'Gemperle Family Farms', hens: 9.20 },
    { company: 'Kreider Farms', hens: 8.40 },
    { company: 'Versova Management', hens: 7.90 },
    { company: 'Weaver Eggs', hens: 7.80 },
    { company: 'ISE America', hens: 7.50 },
    { company: 'Fremont Farms of Iowa', hens: 6.50 },
    { company: 'Sauder\'s Eggs', hens: 6.30 },
    { company: 'Sparboe Companies', hens: 5.90 }
  ];

  // Calculate total hens for top 20
  const totalHens = top20CompanyHensData.reduce((sum, company) => sum + company.hens, 0);

  // Calculate percentage market share for each company
  const chartData = top20CompanyHensData.map(company => ({
    company: company.company,
    percentage: (company.hens / totalHens) * 100
  }));

  // Sort data in descending order by percentage
  chartData.sort((a, b) => b.percentage - a.percentage);

  // Extract labels and data for the chart
  const labels = chartData.map(item => item.company);
  const data = chartData.map(item => item.percentage);
  const backgroundColors = chartData.map(() => '#f0c040'); // Initialize all to default

    marketShareChart = new Chart(ctxMarketShare, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Market Share (%)',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: '#000',
                borderWidth: 1,
                barPercentage: 0.95, // Thicker bars
                categoryPercentage: 1, // More spacing between bars
            }]
        },
        options: {
            indexAxis: 'y',
            plugins: {
                legend: { display: false },
                datalabels: { display: false },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: (context) => {
                            return `${context.label}: ${context.parsed.x.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                y: { // y-axis configuration
                    ticks: {
                        font: {
                            size: 10 // Smaller font size for y-axis labels
                        },
                        autoSkip: false, // Prevent Chart.js from skipping labels
                        maxRotation: 0,  // Keep labels horizontal
                        minRotation: 0   // Keep labels horizontal
                    }
                },
                x: {
                    beginAtZero: true,
                    max: 30,  //SETTING THE MAX TO BE DYNAMIC
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        },
                        font: {
                            size: 10 // Smaller font size for x-axis labels
                        }
                    },
                    title: { // ADDED TITLE
                        display: true,
                        text: 'Total Share of Hens (%)',
                        font: {
                          size: 12
                        }
                    }
                }
            }
        },
        plugins: []
    });
}