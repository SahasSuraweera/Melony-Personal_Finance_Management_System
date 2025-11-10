import React from "react";
import "../../Styles/ReportTable.css"; // ✅ Import CSS

const ReportTable = ({ report }) => {
  const data = report?.data || [];
  if (!data.length)
    return <p className="error-text">No data available.</p>;

  const columns = Object.keys(data[0]);

  return (
    <div className="report-table-container">
      <h3 className="report-table-title">{report.reportTitle}</h3>

      <table className="report-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col.replace(/_/g, " ")}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col}>{row[col] ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="report-record-count">
        Total Records: {report.recordCount}
      </p>
    </div>
  );
};

export default ReportTable;
