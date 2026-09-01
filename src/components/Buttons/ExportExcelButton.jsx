import React from "react";
import { Button } from "@mui/material";
import { FaFileExcel } from "react-icons/fa"; // Using react-icons instead of MUI icons
import * as XLSX from "xlsx";

const ExportExcelButton = ({ data, fileName, columns }) => {
  const exportToExcel = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn("No data available for export");
      return;
    }

    // Prepare the data for export with proper date handling
    const exportData = data.map((item) => {
      const row = {};
      columns.forEach((column) => {
        if (column.field) {
          const value = item[column.field];

          // Handle date values
          if (value instanceof Date) {
            row[column.headerName] = value.toISOString().split("T")[0]; // Format as YYYY-MM-DD
          }
          // Handle null or undefined values
          else if (value === null || value === undefined) {
            row[column.headerName] = "";
          }
          // Handle other values
          else {
            row[column.headerName] = value;
          }
        }
      });
      return row;
    });

    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      // Generate the Excel file
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={<FaFileExcel />} // Updated to use react-icons
      onClick={exportToExcel}
      sx={{
        backgroundColor: "#4CAF50",
        "&:hover": {
          backgroundColor: "#45a049",
        },
      }}
    >
      Export to Excel
    </Button>
  );
};

export default ExportExcelButton;
