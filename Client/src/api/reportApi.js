import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

// Fetch JSON preview
export const fetchReportPreview = async (type, userId, year, month) => {
  let url = `${BASE_URL}/reportPreviews`;

  switch (type) {
    case "monthly-expenditure":
      url += `/monthly-expenditure-report/${userId}/${year}`;
      break;
    case "budget-adherence":
      url += `/budget-adherence-report/${userId}/${year}/${month}`;
      break;
    case "saving-progress":
      url += `/saving-progress-report/${userId}`;
      break;
    case "category-expense":
      url += `/category-expense-report/${userId}/${year}/${month}`;
      break;
    case "forecasted-savings":
      url += `/forecasted-savings-report/${userId}`;
      break;
    default:
      throw new Error("Invalid report type");
  }

  const response = await axios.get(url);
  return response.data;
};

// Download PDF
export const downloadReportPDF = (type, userId, year, month) => {
  let url = `${BASE_URL}/reports`;

  switch (type) {
    case "monthly-expenditure":
      url += `/monthly-expenditure-report/${userId}/${year}/pdf`;
      break;
    case "budget-adherence":
      url += `/budget-adherence-report/${userId}/${year}/${month}/pdf`;
      break;
    case "saving-progress":
      url += `/saving-progress-report/${userId}/pdf`;
      break;
    case "category-expense":
      url += `/category-expense-report/${userId}/${year}/${month}/pdf`;
      break;
    case "forecasted-savings":
      url += `/forecasted-savings-report/${userId}/pdf`;
      break;
    default:
      throw new Error(`Unsupported report type`);
  }

  window.open(url, "_blank");
};
