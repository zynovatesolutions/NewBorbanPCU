import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ExportExcelBtn from "../components/Buttons/ExportExcelBtn";

const exportToExcel = (data, fileName) => {
  console.log(data);

  const updatedData = data.map((dt) => {
    return { ...dt };
  });
  console.log(updatedData);

  const worksheet = XLSX.utils.json_to_sheet(updatedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `${fileName}.xlsx`);
};

const ExportToExcelButton = ({ data, fileName }) => {
  return (
    <ExportExcelBtn
      onClick={() => {
        try {
          exportToExcel(data, fileName);
        } catch (error) {
          console.error("Error exporting to Excel:", error);
        }
      }}
    />
  );
};

export default ExportToExcelButton;
