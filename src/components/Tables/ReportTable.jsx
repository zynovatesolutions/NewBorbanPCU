import React, { useMemo } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import moment from "moment";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const RIGHT_ALIGN_IDS = new Set([
  "qty", "in_qty", "out_qty", "price", "amount", "remaining",
  "total", "paid", "return_amount", "opening_balance", "discount",
]);

const DEFAULTS = {
  headerBg: "#1a1a1a",
  borderColor: "#1a1a1a",
  emptyMessage: "No data to display",
};

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function getAlign(columnId, columnAlign) {
  return columnAlign || (RIGHT_ALIGN_IDS.has(columnId) ? "right" : "left");
}

function formatCellValue(value, column) {
  if (value === "" || value == null) return "";
  if (column.format && typeof value === "number") return column.format(value);
  if (column.id === "date" && (typeof value === "number" || value)) {
    const ms = typeof value === "number" ? (value < 1e12 ? value * 1000 : value) : value;
    return moment(new Date(ms)).format("DD/MM/YY");
  }
  if (typeof value === "number" && RIGHT_ALIGN_IDS.has(column.id)) {
    return Number(value).toLocaleString("en-US");
  }
  return value;
}

function getRowKey(row, index) {
  return row?.id ?? row?._id ?? index;
}

// -----------------------------------------------------------------------------
// ReportTable
// -----------------------------------------------------------------------------

/**
 * Report table for print / report views.
 * Supports sticky header with offset, optional header styling, and empty state.
 *
 * @param {Object} props
 * @param {Array<Record<string, any>>} props.rows - Row data (keys match column ids)
 * @param {Array<{ id: string, title: string, format?: (v: number) => any, align?: string, minWidth?: number }>} props.columns
 * @param {number} [props.stickyOffset] - Px from top for sticky header (e.g. below toolbar). Hidden in print.
 * @param {string} [props.headerBg] - Header background (default dark)
 * @param {string} [props.borderColor] - Table border color
 * @param {string} [props.emptyMessage] - Message when rows.length === 0
 */
export default function ReportTable({
  rows = [],
  columns = [],
  stickyOffset,
  headerBg = DEFAULTS.headerBg,
  borderColor = DEFAULTS.borderColor,
  emptyMessage = DEFAULTS.emptyMessage,
}) {
  const hasStickyOffset = typeof stickyOffset === "number" && stickyOffset > 0;

  const tableSx = useMemo(() => {
    if (!hasStickyOffset) return undefined;
    return {
      "& thead th": { top: stickyOffset },
      "@media print": { "& thead th": { top: 0 } },
    };
  }, [stickyOffset, hasStickyOffset]);

  const headerCells = useMemo(
    () =>
      columns.map((col, i) => {
        const isLast = i === columns.length - 1;
        return (
          <TableCell
            key={col.id}
            align={getAlign(col.id, col.align)}
            sx={{
              minWidth: col.minWidth,
              backgroundColor: headerBg,
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              fontFamily: "'Roboto', sans-serif",
              py: 1.5,
              px: 2,
              borderRight: isLast ? "none" : "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {col.title}
          </TableCell>
        );
      }),
    [columns, headerBg]
  );

  const bodyRows = useMemo(
    () =>
      rows.map((row, index) => (
        <TableRow key={getRowKey(row, index)} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
          {columns.map((col, colIndex) => {
            const raw = row[col.id];
            const formatted = formatCellValue(raw, col);
            const display = formatted === "" ? "" : formatted ?? "—";
            const isLastCol = colIndex === columns.length - 1;
            return (
              <TableCell
                key={col.id}
                align={getAlign(col.id, col.align)}
                sx={{
                  fontWeight: 500,
                  fontSize: "0.9375rem",
                  color: "text.primary",
                  py: 1.25,
                  px: 2,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  borderRight: isLastCol ? "none" : "1px solid",
                  borderRightColor: "divider",
                }}
              >
                {display}
              </TableCell>
            );
          })}
        </TableRow>
      )),
    [rows, columns]
  );

  if (rows.length === 0) {
    return (
      <TableContainer
        component={Paper}
        sx={{
          border: `2px solid ${borderColor}`,
          borderRadius: 2,
          minHeight: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      </TableContainer>
    );
  }

  return (
    <Paper elevation={0} sx={{ width: "100%", overflow: "hidden", border: `1px solid ${borderColor}`, borderRadius: 2 }}>
      <TableContainer>
        <Table stickyHeader aria-label="Report table" sx={tableSx} size="small">
          <TableHead>
            {hasStickyOffset && (
              <TableRow
                sx={{
                  visibility: "hidden",
                  pointerEvents: "none",
                  "@media print": { display: "none" },
                }}
              >
                <TableCell colSpan={columns.length} padding="none" sx={{ height: stickyOffset, border: 0, lineHeight: 0 }} />
              </TableRow>
            )}
            <TableRow>{headerCells}</TableRow>
          </TableHead>
          <TableBody>{bodyRows}</TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
