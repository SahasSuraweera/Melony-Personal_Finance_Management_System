import React, { useState, useEffect } from "react";
import { fetchReportPreview, downloadReportPDF } from "../../api/reportApi";
import ReportTable from "./ReportTable";
import "../../Styles/ReportPreviewPage.css"; // ✅ Import CSS

const ReportPreviewPage = () => {
  const [type, setType] = useState("monthly-expenditure");
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(1);
  const [userId, setUserId] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.user_id) {
      setUserId(storedUser.user_id);
    } else {
      setUserId(1); // fallback for testing
    }
  }, []);

  const reportConfig = {
    "monthly-expenditure": { needYear: true, needMonth: false },
    "budget-adherence": { needYear: true, needMonth: true },
    "saving-progress": { needYear: false, needMonth: false },
    "category-expense": { needYear: true, needMonth: true },
    "forecasted-savings": { needYear: false, needMonth: false },
  };

  const handleFetch = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fetchReportPreview(type, userId, year, month);
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Failed to load report preview. Please check your parameters.");
    } finally {
      setLoading(false);
    }
  };

  const { needYear, needMonth } = reportConfig[type];

  return (
    <div className="report-page">
      <h2 className="report-title">Report Preview Dashboard</h2>

      {/* Filter Controls */}
      <div className="filter-bar">
        <label className="filter-label">Report Type:</label>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setData(null);
          }}
          className="filter-select"
        >
          <option value="monthly-expenditure">Monthly Expenditure</option>
          <option value="budget-adherence">Budget Adherence</option>
          <option value="saving-progress">Saving Goal Progress</option>
          <option value="category-expense">Category-wise Expense</option>
          <option value="forecasted-savings">Forecasted Savings</option>
        </select>

        {/* Year Input */}
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          disabled={!needYear}
          className="filter-input"
          placeholder="Year"
        />

        {/* Month Input */}
        <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            disabled={!needMonth}
            className="filter-input"
            >
            <option value="">Select Month</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
        </select>

        <button
          onClick={handleFetch}
          disabled={(needYear && !year) || (needMonth && !month) || loading}
          className={`btn btn-blue ${loading ? "btn-gray" : ""}`}
        >
          {loading ? "Loading..." : "Preview"}
        </button>

        {data && (
          <button
            onClick={() => downloadReportPDF(type, userId, year, month)}
            className="btn btn-green"
          >
            Download PDF
          </button>
        )}
      </div>

      {error && <p className="error-text">{error}</p>}
      {data && <ReportTable report={data} />}
    </div>
  );
};

export default ReportPreviewPage;
