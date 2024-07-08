const axios = require("axios");
const Transaction = require("../models/Transaction");
const getMonthRange = require('../utils/helpers'); // Adjust the path as per your file structure


const API_URL = "https://s3.amazonaws.com/roxiler.com/product_transaction.json";

exports.initializeDatabase = async () => {
  try {
    const response = await axios.get(API_URL);
    const transactions = response.data;

    await Transaction.deleteMany({});
    await Transaction.insertMany(transactions);

    return { message: "Database initialized successfully with seed data." };
  } catch (error) {
    throw new Error("Error initializing database: " + error.message);
  }
};

exports.listTransactions = async (month, search, page, perPage) => {
  const { startDate, endDate } = getDateRange(month);

  console.log(`Searching transactions for month: ${month}`);
  console.log(
    `Date Range: ${startDate.toISOString()} - ${endDate.toISOString()}`
  );

  const query = {
    dateOfSale: { $gte: start, $lt: end },
    $or: [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
      { price: new RegExp(search, "i") },
    ],
  };
  if (search) {
    const searchFloat = parseFloat(search);
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      ...(isNaN(searchFloat) ? [] : [{ price: searchFloat }]),
    ];
  }

  console.log("Query:", JSON.stringify(query));

  const total = await Transaction.countDocuments(query);
  const transactions = await Transaction.find(query)
    .skip((page - 1) * perPage)
    .limit(parseInt(perPage));

  console.log("Found Transactions:", transactions.length);
  console.log("Transactions Data:", transactions);

  return {
    transactions,
    total,
    page: parseInt(page),
    perPage: parseInt(perPage),
    totalPages: Math.ceil(total / perPage),
  };
};


exports.getStatistics = async (month) => {
  const { start, end } = getMonthRange(month);

  console.log(`Getting statistics for month: ${month}`);
  console.log(`Start Date: ${start}, End Date: ${end}`);

  const totalSaleAmount = await Transaction.aggregate([
    { $match: { dateOfSale: { $gte: start, $lte: end }, sold: true } },
    { $group: { _id: null, total: { $sum: "$price" } } },
  ]);

  const soldItems = await Transaction.countDocuments({
    dateOfSale: { $gte: start, $lte: end },
    sold: true,
  });

  const notSoldItems = await Transaction.countDocuments({
    dateOfSale: { $gte: start, $lte: end },
    sold: false,
  });

  return {
    totalSaleAmount: totalSaleAmount.length > 0 ? totalSaleAmount[0].total : 0,
    soldItems,
    notSoldItems,
  };
};


exports.getBarChartData = async (month) => {
  const { start, end } = getMonthRange(month);

  console.log(`Getting bar chart data for month: ${month}`);
  console.log(`Start Date: ${start}, End Date: ${end}`);

  const ranges = [
    { min: 0, max: 100 },
    { min: 101, max: 200 },
    { min: 201, max: 300 },
    { min: 301, max: 400 },
    { min: 401, max: 500 },
    { min: 501, max: 600 },
    { min: 601, max: 700 },
    { min: 701, max: 800 },
    { min: 801, max: 900 },
    { min: 901, max: Infinity },
  ];

  try {
    const barChartData = await Promise.all(
      ranges.map(async ({ min, max }) => {
        const count = await Transaction.countDocuments({
          dateOfSale: {
            $gte: new Date(start.toISOString()), // Ensure start date is in ISO format
            $lt: new Date(end.toISOString()), // Ensure end date is in ISO format
          },
          price: { $gte: min, $lt: max },
        });
        return { range: `${min} - ${max === Infinity ? "above" : max}`, count };
      })
    );

    return barChartData;
  } catch (error) {
    console.error("Error fetching bar chart data:", error);
    throw error;
  }
};


exports.getPieChartData = async (month) => {
   const { start, end } = getMonthRange(month);

   console.log(`Getting bar chart data for month: ${month}`);
   console.log(`Start Date: ${start}, End Date: ${end}`);

  const pieChartData = await Transaction.aggregate([
    { $match: { dateOfSale: { $gte: start, $lte: end } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $project: { category: "$_id", count: 1, _id: 0 } },
  ]);

  return pieChartData;
};

exports.getCombinedData = async (month) => {
  const statistics = await this.getStatistics(month);
  const barChartData = await this.getBarChartData(month);
  const pieChartData = await this.getPieChartData(month);

  return {
    statistics,
    barChartData,
    pieChartData,
  };
};
