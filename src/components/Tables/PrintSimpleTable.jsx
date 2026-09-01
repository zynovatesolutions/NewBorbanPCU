import React, { useMemo } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import moment from "moment";

/** Column ids that should be right-aligned (numeric columns) */
const RIGHT_ALIGN_IDS = new Set([
  "qty",
  "in_qty",
  "out_qty",
  "price",
  "amount",
  "remaining",
  "total",
  "paid",
  "return_amount",
  "opening_balance",
  "discount",
]);

const DEFAULT_HEADER_BG = "#000";
const DEFAULT_BORDER = "#000";

/**
 * @param {Object} props
 * @param {Array<Object>} props.rows - Array of row objects (keys match column ids)
 * @param {Array<{ id: string, title: string, format?: (v: number) => any, align?: string }>} props.columns
 * @param {string} [props.bgColor] - Optional header background & border color (hex)
 * @param {number} [props.stickyHeaderTop] - When set, table header sticks below this offset (e.g. below app toolbar). Reset to 0 in print.
 */
export default function PrintSimpleTable({
  rows = [],
  columns = [],
  bgColor,
  stickyHeaderTop,
}) {
  const headerBg = bgColor || DEFAULT_HEADER_BG;
  const borderColor = bgColor || DEFAULT_BORDER;

  const tableSx = useMemo(() => {
    if (typeof stickyHeaderTop !== "number") return undefined;
    return {
      "& thead th": { top: stickyHeaderTop },
      "@media print": { "& thead th": { top: 0 } },
    };
  }, [stickyHeaderTop]);

  const getAlign = (columnId, columnAlign) =>
    columnAlign || (RIGHT_ALIGN_IDS.has(columnId) ? "right" : "left");

  const formatCellValue = (value, column) => {
    if (value === "" || value === null || value === undefined) return "";
    if (column.format && typeof value === "number") return column.format(value);
    if (column.id === "date" && (typeof value === "number" || value)) {
      const date = typeof value === "number" ? (value < 1e12 ? value * 1000 : value) : value;
      return moment(new Date(date)).format("DD/MM/YY");
    }
    if (typeof value === "number" && RIGHT_ALIGN_IDS.has(column.id)) {
      return Number(value).toLocaleString("en-US");
    }
    return value;
  };

  const getRowKey = (row, index) => row.id ?? row._id ?? index;

  const renderBodyRows = () =>
    rows.map((row, index) => (
      <TableRow key={getRowKey(row, index)} hover>
        {columns.map((col) => {
          const d = formatCellValue(row[col.id], col);
          const text = d === "" ? "" : d ?? "N/A";
          return (
            <TableCell
              key={col.id}
              align={getAlign(col.id, col.align)}
              sx={{
                fontWeight: 600,
                fontSize: "0.95rem",
                color: bgColor || "#000",
              }}
            >
              {text}
            </TableCell>
          );
        })}
      </TableRow>
    ));

  if (!rows.length) {
    return (
      <TableContainer
        component={Paper}
        sx={{
          border: `2px solid ${borderColor}`,
          borderRadius: "10px",
          minHeight: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="text.secondary" sx={{ py: 3 }}>
          No data to display
        </Typography>
      </TableContainer>
    );
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer
        sx={{
          border: `2px solid ${borderColor}`,
          borderRadius: "10px",
        }}
      >
        <Table stickyHeader aria-label="print table" sx={tableSx}>
          <TableHead>
            {/* Spacer row: jab header 88px neeche stick ho to pehli body row header ke upar na dikhe */}
            {typeof stickyHeaderTop === "number" && stickyHeaderTop > 0 && (
              <TableRow
                sx={{
                  visibility: "hidden",
                  pointerEvents: "none",
                  "@media print": { display: "none" },
                }}
              >
                <TableCell
                  colSpan={columns.length}
                  padding="none"
                  sx={{ height: stickyHeaderTop, border: 0, lineHeight: 0, verticalAlign: "top" }}
                />
              </TableRow>
            )}
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={getAlign(col.id, col.align)}
                  sx={{
                    minWidth: col.minWidth,
                    backgroundColor: headerBg,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    fontFamily: "'Roboto', sans-serif",
                  }}
                >
                  {col.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
            <TableBody>
              {renderBodyRows()}
            </TableBody>
          </Table>
        </TableContainer>
    </Paper>
  );
}
