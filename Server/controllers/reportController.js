const PDFDocument = require("pdfkit");
const oracledb = require("oracledb");
const { getOracleConnection } = require("../db/oracleDB");

exports.getMonthlyExpenditureAnalysis = async (req, res) => {
  const { user_id, year } = req.params;

  if (!user_id || !year) {
    return res.status(400).json({ error: "Missing parameters. Use /monthly-expenditure/:user_id/:year" });
  }

  let connection, cursor;

  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      BEGIN
        :cursor := fn_monthly_expenditure_analysis(:user_id, :year);
      END;
      `,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        user_id: Number(user_id),
        year: Number(year),
      }
    );

    cursor = result.outBinds.cursor;
    const rows = [];
    let row;
    while ((row = await cursor.getRow())) rows.push(row);
    await cursor.close();

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const filename = `Monthly_Expenditure_Analysis_${user_id}_${year}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    doc.pipe(res);

    doc.rect(0, 0, 595, 45).fill("#007bff");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(13)
      .text("MELONY PERSONAL FINANCE MANAGEMENT SYSTEM", 0, 15, { align: "center" });
    doc.fillColor("black");
    doc.moveDown(2);
    doc.font("Helvetica-Bold").fontSize(12).text("Monthly Expenditure Analysis Report", { align: "center" });
    doc.font("Helvetica-Bold").fontSize(9).text(`Year: ${year}`, { align: "center" });
    doc.font("Helvetica").fontSize(9)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(1);

    const startY = 120;
    const headers = ["Month", "Total Expense (Rs.)", "Prev. Month (Rs.)", "Change (%)", "Top 3 Categories"];
    const colX = [50, 120, 240, 340, 420];
    const colWidths = [100, 120, 100, 70, 150];

    doc.font("Helvetica-Bold").fontSize(9);
    headers.forEach((h, i) => doc.text(h, colX[i], startY, { width: colWidths[i], align: "left" }));
    doc.moveTo(50, startY + 12).lineTo(550, startY + 12).stroke();

    doc.font("Helvetica").fontSize(9);
    let y = startY + 20;

    rows.forEach((r, i) => {
      const [
        MONTH_LABEL,
        TOTAL_EXPENSE,
        PREV_EXPENSE,
        CHANGE_PERCENTAGE,
        TOP_3_CATEGORIES,
      ] = Object.values(r);

      if (i % 2 === 0) {
        doc.rect(50, y - 2, 500, 12).fillOpacity(0.05).fill("#007bff").fillOpacity(1);
      }

      let changeColor = "black";
      if (CHANGE_PERCENTAGE > 0) changeColor = "red";
      else if (CHANGE_PERCENTAGE < 0) changeColor = "green";

      const rowData = [
        MONTH_LABEL || "",
        (TOTAL_EXPENSE || 0).toFixed(2),
        (PREV_EXPENSE || 0).toFixed(2),
        (CHANGE_PERCENTAGE || 0).toFixed(2) + "%",
        TOP_3_CATEGORIES || "—",
      ];

      rowData.forEach((cell, j) => {
        const align = "left";
        const color = j === 3 ? changeColor : "black";
        doc.fillColor(color).text(cell.toString(), colX[j], y, {
          width: colWidths[j],
          align,
        });
      });

      y += 14;

      if (y > 760) {
        doc.addPage();
        y = 60;
        doc.font("Helvetica-Bold").fontSize(9);
        headers.forEach((h, i) => doc.text(h, colX[i], y, { width: colWidths[i], align: "left" }));
        doc.moveTo(50, y + 12).lineTo(550, y + 12).stroke();
        y += 20;
        doc.font("Helvetica").fontSize(9);
      }
    });

    const footerY = 800;
    doc.moveTo(0, footerY).lineTo(595, footerY).strokeColor("#007bff").lineWidth(3).stroke();
    doc.fontSize(8).fillColor("gray")
      .text("© 2025 Melony Personal Finance Management System | Confidential Document", 0, footerY - 15, { align: "center" });

    doc.end();

    doc.on("end", async () => {
      if (connection) await connection.close();
      console.log("Monthly Expenditure Analysis PDF (yearly) generated successfully.");
    });

  } catch (err) {
    console.error("Error generating Monthly Expenditure Analysis PDF:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate PDF", details: err.message });
    }
    if (connection) await connection.close();
  }
};



exports.getBudgetAdherenceReport = async (req, res) => {
  const { user_id, year, month } = req.params; 

  if (!user_id || !year || !month) {
    return res.status(400).json({
      error: "Missing parameters. URL format: /pdf/:user_id/:year/:month",
    });
  }

  let connection;
  let cursor;

  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      BEGIN
        :cursor := fn_budget_adherence_monthly(:user_id, :year, :month);
      END;
      `,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        user_id: Number(user_id),
        year: Number(year),
        month: Number(month),
      }
    );

    cursor = result.outBinds.cursor;
    const rows = [];
    let row;
    while ((row = await cursor.getRow())) rows.push(row);
    await cursor.close();

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const filename = `BudgetAdherence_Report_${user_id}_${year}_${month}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    doc.pipe(res);

        doc.rect(0, 0, 595, 45).fill("#007bff");

        doc.fillColor("white")
        .font("Helvetica-Bold")
        .fontSize(13)
        .text("MELONY PERSONAL FINANCE MANAGEMENT SYSTEM", 0, 15, {
            align: "center",
        });

        doc.fillColor("black");

        const currentDate = new Date().toLocaleString();
        doc.moveDown(2.5); 
        doc.font("Helvetica-Bold").fontSize(12).text("Budget Adherence Report", {
        align: "center",
        });
        doc.moveDown(0.15);
        doc.font("Helvetica-Bold").fontSize(9).text(`Month: ${month} / ${year}`, {
        align: "center",
        });
        doc.moveDown(0.25);
        doc.font("Helvetica").fontSize(9).text(`Generated on: ${currentDate}`, {
        align: "center",
        });
        doc.moveDown(1);

const startY = 135;
const headers = [
  "Category",
  "Budget Limit (Rs.)",
  "Actual Spent (Rs.)",
  "Used (%)",
  "Remaining (Rs.)",
  "Status",
];

const colX = [50, 150, 240, 330, 400, 490];
const colWidths = [100, 100, 90, 80, 80, 70];

doc.font("Helvetica-Bold").fontSize(7);
headers.forEach((header, i) => {
  doc.text(header, colX[i], startY, {
    width: colWidths[i],
    align: "left",
  });
});
doc.moveTo(50, startY + 12).lineTo(550, startY + 12).stroke();

doc.moveDown(0.5);
doc.font("Helvetica").fontSize(9);
let y = startY + 20;

rows.forEach((r, i) => {
  const [
    CATEGORY,
    BUDGET_LIMIT,
    ACTUAL_SPENT,
    USED_PERCENTAGE,
    REMAINING_AMOUNT,
    STATUS,
  ] = Object.values(r);

  if (i % 2 === 0) {
    doc.rect(50, y - 2, 500, 14).fillOpacity(0.05).fill("#007bff").fillOpacity(1);
  }

  let statusColor = "black";
  if (STATUS === "Exceeded Budget") statusColor = "red";
  else if (STATUS === "Near Limit") statusColor = "orange";
  else if (STATUS === "Within Budget") statusColor = "green";

  const data = [
    CATEGORY || "",
    (BUDGET_LIMIT || 0).toFixed(2),
    (ACTUAL_SPENT || 0).toFixed(2),
    (USED_PERCENTAGE || 0).toFixed(2) + "%",
    (REMAINING_AMOUNT || 0).toFixed(2),
    STATUS || "",
  ];

  data.forEach((cell, j) => {
    const align = "left";
    const color = j === 5 ? statusColor : "black";
    doc.fillColor(color).text(cell.toString(), colX[j], y, {
      width: colWidths[j],
      align,
    });
  });

  y += 24;

  if (y > 760) {
    doc.addPage();
    y = 60;
    doc.font("Helvetica-Bold").fontSize(10);
    headers.forEach((header, i) => {
      doc.text(header, colX[i], y, {
        width: colWidths[i],
        align: i >= 1 && i <= 4 ? "right" : "left",
      });
    });
    doc.moveTo(50, y + 12).lineTo(550, y + 12).stroke();
    y += 20;
    doc.font("Helvetica").fontSize(9);
  }
});
        
            doc.fontSize(8).fillColor("gray") .text("© 2025 Melony Personal Finance Management System | Confidential Document", 0, 780, { align: "center", });

            doc.end();

            doc.on("end", async () => {
            if (connection) await connection.close();
            console.log("Budget Adherence PDF generated successfully.");
            });

        } catch (err) {
            console.error("Error generating Budget Adherence Report PDF:", err);
            if (!res.headersSent) {
            res.status(500).json({ error: "Failed to generate PDF", details: err.message });
            }
            if (connection) await connection.close();
        }
    };

  exports.getSavingGoalProgress = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id in URL." });
  }

  let connection;
  let cursor;

  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      BEGIN
        :cursor := fn_saving_goal_progress(:user_id);
      END;
      `,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        user_id: Number(user_id),
      }
    );

    cursor = result.outBinds.cursor;
    const rows = [];
    let row;
    while ((row = await cursor.getRow())) rows.push(row);
    await cursor.close();

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const filename = `SavingGoal_Progress_${user_id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    doc.pipe(res);

    doc.rect(0, 0, 595, 45).fill("#007bff");

    doc.fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(13)
      .text("MELONY PERSONAL FINANCE MANAGEMENT SYSTEM", 0, 15, { align: "center" });

    doc.fillColor("black");

    const currentDate = new Date().toLocaleString();
    doc.moveDown(2.5);
    doc.font("Helvetica-Bold").fontSize(12).text("Savings Goal Progress Report", { align: "center" });
    doc.moveDown(0.25);
    doc.font("Helvetica").fontSize(9).text(`Generated on: ${currentDate}`, { align: "center" });
    doc.moveDown(1);

    const startY = 135;
    const headers = [
      "Goal Name",
      "Target (Rs.)",
      "Saved (Rs.)",
      "Progress (%)",
      "Status",
      "Start Date",
      "End Date",
    ];

    const colX = [50, 150, 230, 310, 380, 460, 520];
    const colWidths = [100, 80, 80, 70, 80, 60, 60];

    doc.font("Helvetica-Bold").fontSize(7);
    headers.forEach((header, i) => {
      doc.text(header, colX[i], startY, {
        width: colWidths[i],
        align: "left",
      });
    });
    doc.moveTo(50, startY + 12).lineTo(550, startY + 12).stroke();

    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(9);
    let y = startY + 20;

    rows.forEach((r, i) => {
      const [
        GOAL_NAME,
        TARGET_AMOUNT,
        CURRENT_AMOUNT,
        PROGRESS_PERCENTAGE,
        STATUS,
        START_DATE,
        END_DATE,
      ] = Object.values(r);

      if (i % 2 === 0) {
        doc.rect(50, y - 2, 500, 14).fillOpacity(0.05).fill("#007bff").fillOpacity(1);
      }

      let statusColor = "black";
      if (STATUS === "Completed") statusColor = "green";
      else if (STATUS === "Near Goal") statusColor = "orange";
      else if (STATUS === "In Progress") statusColor = "blue";

      const data = [
        GOAL_NAME || "",
        (TARGET_AMOUNT || 0).toFixed(2),
        (CURRENT_AMOUNT || 0).toFixed(2),
        (PROGRESS_PERCENTAGE || 0).toFixed(2) + "%",
        STATUS || "",
        START_DATE ? new Date(START_DATE).toISOString().split("T")[0] : "",
        END_DATE ? new Date(END_DATE).toISOString().split("T")[0] : "",
      ];

      data.forEach((cell, j) => {
        const color = j === 4 ? statusColor : "black";
        doc.fillColor(color).text(cell.toString(), colX[j], y, {
          width: colWidths[j],
          align: "left",
        });
      });

      y += 24;

      if (y > 760) {
        doc.addPage();
        y = 60;
        doc.font("Helvetica-Bold").fontSize(9);
        headers.forEach((header, i) => {
          doc.text(header, colX[i], y, {
            width: colWidths[i],
            align: "left",
          });
        });
        doc.moveTo(50, y + 12).lineTo(550, y + 12).stroke();
        y += 20;
        doc.font("Helvetica").fontSize(9);
      }
    });

    doc.fontSize(8)
      .fillColor("gray")
      .text("© 2025 Melony Personal Finance Management System | Confidential Document", 0, 780, {
        align: "center",
      });

    doc.end();

    doc.on("end", async () => {
      if (connection) await connection.close();
      console.log("Savings Goal Progress PDF generated successfully.");
    });

  } catch (err) {
    console.error("Error generating Savings Goal Progress PDF:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate PDF", details: err.message });
    }
    if (connection) await connection.close();
  }
};

exports.getCategoryExpenseMonthly = async (req, res) => {
  const { user_id, year, month } = req.params;

  if (!user_id || !year || !month) {
    return res.status(400).json({
      error: "Missing parameters. URL format: /category-expense/:user_id/:year/:month/pdf",
    });
  }

  let connection;
  let cursor;

  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      BEGIN
        :cursor := fn_category_expense_monthly(:user_id, :year, :month);
      END;
      `,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        user_id: Number(user_id),
        year: Number(year),
        month: Number(month),
      }
    );

    cursor = result.outBinds.cursor;
    const rows = [];
    let row;
    while ((row = await cursor.getRow())) rows.push(row);
    await cursor.close();

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const filename = `Category_Expense_Report_${user_id}_${year}_${month}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    doc.pipe(res);

    doc.rect(0, 0, 595, 45).fill("#007bff");
    doc.fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(13)
      .text("MELONY PERSONAL FINANCE MANAGEMENT SYSTEM", 0, 15, { align: "center" });

    doc.fillColor("black");
    const currentDate = new Date().toLocaleString();
    doc.moveDown(2.5);
    doc.font("Helvetica-Bold").fontSize(12).text("Category-wise Expense Distribution Report", { align: "center" });
    doc.moveDown(0.25);
    doc.font("Helvetica-Bold").fontSize(9).text(`Month: ${month} / ${year}`, { align: "center" });
    doc.moveDown(0.25);
    doc.font("Helvetica").fontSize(9).text(`Generated on: ${currentDate}`, { align: "center" });
    doc.moveDown(1);

    const startY = 135;
    const headers = ["Category", "Total Spent (Rs.)", "Percentage (%)"];
    const colX = [70, 250, 460];
    const colWidths = [230, 160, 80];

    doc.font("Helvetica-Bold").fontSize(9);
    headers.forEach((h, i) => {
      doc.text(h, colX[i], startY, { width: colWidths[i], align: "left" });
    });
    doc.moveTo(50, startY + 12).lineTo(550, startY + 12).stroke();

    doc.font("Helvetica").fontSize(9);
    let y = startY + 20;

    rows.forEach((r, i) => {
      const [CATEGORY, TOTAL_SPENT, PERCENTAGE] = Object.values(r);

      if (i % 2 === 0) {
        doc.rect(50, y - 2, 500, 14).fillOpacity(0.05).fill("#007bff").fillOpacity(1);
      }

      const data = [
        CATEGORY || "",
        (TOTAL_SPENT || 0).toFixed(2),
        (PERCENTAGE || 0).toFixed(2) + "%",
      ];

      data.forEach((cell, j) => {
        doc.fillColor("black").text(cell.toString(), colX[j], y, {
          width: colWidths[j],
          align: "left",
        });
      });

      y += 20;

      if (y > 760) {
        drawFooter();
        doc.addPage();
        y = 60;
        doc.font("Helvetica-Bold").fontSize(9);
        headers.forEach((h, i) => doc.text(h, colX[i], y, { width: colWidths[i], align: "left" }));
        doc.moveTo(50, y + 12).lineTo(550, y + 12).stroke();
        y += 20;
        doc.font("Helvetica").fontSize(9);
      }
    });

    const drawFooter = () => {
      const footerY = 780;
      doc.moveTo(0, footerY)
        .lineTo(595, footerY)
        .strokeColor("#007bff")
        .lineWidth(3)
        .stroke();
      doc.fontSize(8)
        .fillColor("gray")
        .text("© 2025 Melony Personal Finance Management System | Confidential Document", 0, footerY - 15, {
          align: "center",
        });
    };

    drawFooter();
    doc.end();

    doc.on("end", async () => {
      if (connection) await connection.close();
      console.log("Category Expense Monthly PDF generated successfully.");
    });

  } catch (err) {
    console.error("Error generating Category Expense Monthly PDF:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate PDF", details: err.message });
    }
    if (connection) await connection.close();
  }
};

exports.getForecastedSavings= async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id in URL." });
  }

  let connection;
  let cursor;

  try {
    connection = await getOracleConnection();

    const result = await connection.execute(
      `
      BEGIN
        :cursor := fn_forecasted_savings_trends(:user_id);
      END;
      `,
      {
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
        user_id: Number(user_id),
      }
    );

    cursor = result.outBinds.cursor;
    const rows = [];
    let row;
    while ((row = await cursor.getRow())) rows.push(row);
    await cursor.close();

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const filename = `Forecasted_Savings_Trends_${user_id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    doc.pipe(res);

    doc.rect(0, 0, 595, 45).fill("#007bff");
    doc.fillColor("white").font("Helvetica-Bold").fontSize(13)
      .text("MELONY PERSONAL FINANCE MANAGEMENT SYSTEM", 0, 15, { align: "center" });
    doc.fillColor("black");
    doc.moveDown(2);
    doc.font("Helvetica-Bold").fontSize(12).text("Forecasted Savings Trends Report", { align: "center" });
    doc.font("Helvetica").fontSize(9)
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown(1);

    const startY = 120;
    const headers = [
      "Month",
      "Total Income (Rs.)",
      "Total Expense (Rs.)",
      "Actual Savings (Rs.)",
      "Forecasted Savings (Rs.)",
    ];
    const colX = [50, 120, 220, 330, 440];
    const colWidths = [100, 120, 120, 100, 120];

    doc.font("Helvetica-Bold").fontSize(9);
    headers.forEach((h, i) => doc.text(h, colX[i], startY, { width: colWidths[i], align: "left" }));
    doc.moveTo(50, startY + 12).lineTo(550, startY + 12).stroke();

    doc.font("Helvetica").fontSize(9);
    let y = startY + 25;

    rows.forEach((r, i) => {
      const [
        MONTH_LABEL,
        TOTAL_INCOME,
        TOTAL_EXPENSE,
        ACTUAL_SAVINGS,
        FORECASTED_SAVINGS,
      ] = Object.values(r);

      const isForecast = FORECASTED_SAVINGS !== null;
      const bgColor = isForecast ? "#aee6ff" : "#007bff";

      if (i % 2 === 0) {
        doc.rect(50, y - 2, 500, 12).fillOpacity(0.05).fill(bgColor).fillOpacity(1);
      }

      const rowData = [
        MONTH_LABEL || "",
        TOTAL_INCOME ? TOTAL_INCOME.toFixed(2) : "",
        TOTAL_EXPENSE ? TOTAL_EXPENSE.toFixed(2) : "",
        ACTUAL_SAVINGS ? ACTUAL_SAVINGS.toFixed(2) : "",
        FORECASTED_SAVINGS ? FORECASTED_SAVINGS.toFixed(2) : "",
      ];

      rowData.forEach((cell, j) => {
        doc.fillColor("black").text(cell.toString(), colX[j], y, {
          width: colWidths[j],
          align: "left",
        });
      });

      y += 24;

      if (y > 760) {
        doc.addPage();
        y = 60;
        doc.font("Helvetica-Bold").fontSize(9);
        headers.forEach((h, i) => doc.text(h, colX[i], y, { width: colWidths[i], align: "left" }));
        doc.moveTo(50, y + 12).lineTo(550, y + 12).stroke();
        y += 20;
        doc.font("Helvetica").fontSize(9);
      }
    });

    const footerY = 800;
    doc.moveTo(0, footerY).lineTo(595, footerY).strokeColor("#007bff").lineWidth(3).stroke();
    doc.fontSize(8).fillColor("gray")
      .text("© 2025 Melony Personal Finance Management System | Confidential Document", 0, footerY - 15, { align: "center" });

    doc.end();

    doc.on("end", async () => {
      if (connection) await connection.close();
      console.log("Forecasted Savings Trends PDF generated successfully.");
    });

  } catch (err) {
    console.error("Error generating Forecasted Savings PDF:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate PDF", details: err.message });
    }
    if (connection) await connection.close();
  }
};






