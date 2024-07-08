const transactionService = require("../services/transactionService");
 const  getMonthRange  = require("../utils/helpers");

const Transaction = require("../models/Transaction");

exports.initializeDatabase = async (req, res) => {
  try {
    await transactionService.initializeDatabase();
    res.status(200).json({ message: "Database initialized successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listTransactions = async (req, res) => {
    try {
      const { month, page = 1, perPage = 10, search = "" } = req.query;
      const { start, end } = getMonthRange(month);

      console.log(`Searching transactions for month: ${month}`);
      console.log(start.toISOString(), end.toISOString());

      const query = {
        dateOfSale: { $gte: start, $lt: end },
        $or: [
          { title: new RegExp(search, "i") },
          { description: new RegExp(search, "i") },
          // { price: new RegExp(search, "i") },
        ],
      };

      const transactions = await Transaction.find(query)
        .skip((page - 1) * perPage)
        .limit(Number(perPage));

      res.json(transactions);
    } catch (error) {
      res.status(500).send(error.message);
    }
}



exports.getStatistics = async (req, res) => {
  try {
    const { month } = req.query;
    const statistics = await transactionService.getStatistics(month);
    res.status(200).json(statistics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBarChartData = async (req, res) => {
  try {
    const { month } = req.query;
    const barChartData = await transactionService.getBarChartData(month);
    res.status(200).json(barChartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPieChartData = async (req, res) => {
  try {
    const { month } = req.query;
    const pieChartData = await transactionService.getPieChartData(month);
    res.status(200).json(pieChartData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCombinedData = async (req, res) => {
  try {
    const { month } = req.query;
    const combinedData = await transactionService.getCombinedData(month);
    res.status(200).json(combinedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
