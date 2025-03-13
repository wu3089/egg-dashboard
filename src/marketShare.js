// Market share chart

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
    { company: 'Sauder\'s Eggs', hens: 7.41 },
    { company: 'Cooper Farms', hens: 7.24 },
    { company: 'Fremont Farms of Iowa', hens: 7.00 },
    { company: 'Hickman\'s Egg Ranch', hens: 6.00 },
    { company: 'Vital Farms', hens: 5.70 },
    { company: 'Iowa Cage Free', hens: 5.50 },
  ];

  // Data for companies ranked 21st and below
  const otherCompaniesData = [
    { company: 'Sunrise Farms Inc.', hens: 5.00 },
    { company: 'S&R Egg Farm', hens: 4.85 },
    // ... all other companies data
  ];

  // Calculate total hens for "Other" category
  const otherHensTotal = otherCompaniesData.reduce((sum, company) => sum + company.hens, 0);

  // Create final data array: Top 20 + "Other" category
  const companyHensData = [
    ...top20CompanyHensData,
    { company: 'Other Producers', hens: otherHensTotal }
  ];

  // Sort data by hen count in descending order
  companyHensData.sort((a, b) => b.hens - a.hens);

  const companyNames = companyHensData.map(item => item.company);
  const henCounts = companyHensData.map(item => item.hens);
  const totalHensAllCompanies = companyHensData.reduce((sum, company) => sum + company.hens, 0);

  const top20Color = 'rgba(100, 149, 237, 0.7)'; // Cornflower Blue
  const otherColor = 'rgba(220,220,220, 0.7)';   // Light gray for "Other"
  const backgroundColors = companyNames.map(name => name.includes('Other') ? otherColor : top20Color);

  new Chart(ctxMarketShare.getContext('2d'), {
    type: 'pie',
    data: {
      labels: companyNames,
      datasets: [{
        label: 'Hens (Millions)',
        data: henCounts,
        backgroundColor: backgroundColors,
        borderColor: 'white',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.dataset.data[context.dataIndex];
              const percentage = ((value / totalHensAllCompanies) * 100).toFixed(1);
              return label + ': ' + value + ' Million Hens (' + percentage + '%)';
            }
          }
        },
        legend: {
          display: false
        },
        datalabels: {
          color: 'black',
          font: {
            weight: 'normal',
            size: 11
          },
          formatter: (value, context) => {
            return context.chart.data.labels[context.dataIndex];
          },
          position: 'outside',
          textAlign: 'left',
          offset: 10
        },
        title: {
          display: 'none',
          text: ''
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}