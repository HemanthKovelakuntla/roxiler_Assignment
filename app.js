const express = require('express');
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser');
app.use(bodyParser.json());

let data = [];

// Initialize database with seed data
app.get('/init', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    data = response.data;
    res.status(200).send('Database initialized with seed data');
  } catch (error) {
    res.status(500).send('Error initializing database');
  }
});

// Get statistics for a given month
app.get('/statistics/:month', (req, res) => {
  const month = req.params.month;
  let totalSaleAmount = 0;
  let totalSoldItems = 0;
  let totalNotSoldItems = 0;

  data.forEach(item => {
    const dateOfSale = new Date(item.dateOfSale);
    if (dateOfSale.toLocaleString('default', { month: 'long' }) === month) {
      totalSaleAmount += item.price;
      if (item.sold) {
        totalSoldItems++;
      } else {
        totalNotSoldItems++;
      }
    }
  });

  res.status(200).send({
    totalSaleAmount,
    totalSoldItems,
    totalNotSoldItems
  });
});

// Get bar chart data for a given month
app.get('/barchart/:month', (req, res) => {
  const month = req.params.month;
  const priceRanges = [
    '0-100',
    '101-200',
    '201-300',
    '301-400',
    '401-500',
    '501-600',
    '601-700',
    '701-800',
    '801-900',
    '901-above'
  ];
  let barChartData = {};

  priceRanges.forEach(range => {
    barChartData[range] = 0;
  });

  data.forEach(item => {
    const dateOfSale = new Date(item.dateOfSale);
    if (dateOfSale.toLocaleString('default', { month: 'long' }) === month) {
      if (item.price >= 0 && item.price <=100) {
        barChartData['0-100']++;
      } else if (item.price >= 101 && item.price <=200) {
        barChartData['101-200']++;
      } else if (item.price >= 201 && item.price <=300) {
        barChartData['201-300']++;
      } else if (item.price >= 301 && item.price <=400) {
        barChartData['301-400']++;
      } else if (item.price >= 401 && item.price <=500) {
        barChartData['401-500']++;
      } else if (item.price >= 501 && item.price <=600) {
        barChartData['501-600']++;
      } else if (item.price >= 601 && item.price <=700) {
        barChartData['601-700']++;
      } else if (item.price >= 701 && item.price <=800) {
        barChartData['701-800']++;
      } else if (item.price >= 801 && item.price <=900) {
        barChartData['801-900']++;
      } else if (item.price >= 901) {
        barChartData['901-above']++;
      }
    }
  });

  res.status(200).send(barChartData);
});

// Get pie chart data for a given month
app.get('/piechart/:month', (req, res) => {
  const month = req.params.month;
  let pieChartData = {};

  data.forEach(item => {
    const dateOfSale = new Date(item.dateOfSale);
    if (dateOfSale.toLocaleString('default', { month: 'long' }) === month) {
      if (!pieChartData[item.category]) {
        pieChartData[item.category] = 0;
      }
      pieChartData[item.category]++;
    }
  });

  res.status(200).send(pieChartData);
});

// Get combined data from all APIs for a given month
app.get('/combined/:month', async (req, res) => {
  try {
    const month = req.params.month;
    const statisticsResponse = await axios.get(`http://localhost:3000/statistics/${month}`);
    const statisticsData = statisticsResponse.data;
    
    const barChartResponse = await axios.get(`http://localhost:3000/barchart/${month}`);
    const barChartData = barChartResponse.data;

    const pieChartResponse = await axios.get(`http://localhost:3000/piechart/${month}`);
    const pieChartData = pieChartResponse.data;

    res.status(200).send({
      statistics: statisticsData,
      barChart: barChartData,
      pieChart: pieChartData
    });
  } catch (error) {
    res.status(500).send('Error fetching combined data');
  }
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
