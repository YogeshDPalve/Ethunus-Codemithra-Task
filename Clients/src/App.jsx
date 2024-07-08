// App.js
import React, { useState, useEffect } from "react";
import TransactionTable from "./components/TransactionTable";
import Statistics from "./components/Statistics";
import BarChart from "./components/BarChart";
import PieChart from "./components/PieChart";
import axios from "axios";

function App() {
  const [month, setMonth] = useState(3); // Default to March
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, [month]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`/api/combined-data?month=${month}`);
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  return (
    <div className="App">
      <h1>Transaction Dashboard</h1>
      <select
        value={month}
        onChange={(e) => setMonth(e.target.value)}
      >
        {[...Array(12)].map((_, i) => (
          <option
            key={i}
            value={i + 1}
          >
            {new Date(0, i).toLocaleString("default", { month: "long" })}
          </option>
        ))}
      </select>
      {data && (
        <>
          <TransactionTable transactions={data.transactions} />
          <Statistics statistics={data.statistics} />
          <BarChart data={data.barChartData} />
          <PieChart data={data.pieChartData} />
        </>
      )}
    </div>
  );
}

export default App;
