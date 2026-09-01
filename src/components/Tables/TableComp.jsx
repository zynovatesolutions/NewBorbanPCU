import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useState, useMemo } from "react";
import CustomPagination from "../TablePagination/TablePagination";
import { useNavigate } from "react-router-dom";
import { DeleteItemInvoiceApi } from "../../ApiRequests";
import { SuccessToast } from "../../utils/ShowToast";
import { useDispatch } from "react-redux";
import { fetchCustomerInvoice } from "../../store/Slices/CustomerInvoiceSlice";
import { fetchCustomerReturnInvoice } from "../../store/Slices/CustomerReturnInvoiceSlice";
import { fetchCustomers } from "../../store/Slices/CustomerSlice";
import { fetchItems } from "../../store/Slices/ItemSlice";
import { ContextMenu, MobileDataCard } from "../ui";
import { formatCellValue, isActionColumn } from "../../utils/tableFormatters";
import { buildRowActions, getActionColumn } from "./tableRowActions";
import { BASE_PATH } from "../../utils/appMode";

const basePath = BASE_PATH;

export default function TableComp({
  setOpenEditModal,
  setOpenDeleteModal,
  setSelected,
  AllRows,
  setRows,
  Columns,
  SelectedCustomer,
  isLedger,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [Loading, setLoading] = useState(false);

  const actionColumn = useMemo(() => getActionColumn(Columns), [Columns]);
  const paginatedRows = AllRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handlers = {
    setSelected,
    setOpenEditModal,
    setOpenDeleteModal,
    navigate,
    setLoading,
    Loading,
    AllRows,
    setRows,
    SelectedCustomer,
    dispatch,
    DeleteItemInvoiceApi,
    SuccessToast,
    fetchCustomerInvoice,
    fetchCustomerReturnInvoice,
    fetchCustomers,
    fetchItems,
  };

  const getActionsForRow = (Data, rowIndex) => {
    if (!actionColumn) return [];
    return buildRowActions({
      column: actionColumn,
      Data,
      rowIndex,
      handlers,
      basePath,
    });
  };

  const headerCellClass =
    "text-xs font-bold uppercase tracking-wide text-white whitespace-nowrap";
  const bodyCellClass = "text-sm text-slate-800 whitespace-nowrap";

  return (
    <div>
      {/* Desktop / tablet table */}
      <div className="hidden md:block">
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ maxWidth: "100%", overflowX: "auto" }}
        >
          <Table aria-label="data table" stickyHeader>
            <TableHead>
              <TableRow>
                {Columns.map((dt, i) => {
                  const isAction = isActionColumn(dt);
                  return (
                    <TableCell
                      key={i}
                      align="center"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: "#0f172a",
                        color: "#fff",
                        borderBottom: "1px solid #e2e8f0",
                        py: 1.5,
                        ...(isAction
                          ? {
                              width: 48,
                              minWidth: 48,
                              maxWidth: 48,
                              px: 0.5,
                            }
                          : {}),
                      }}
                    >
                      {!isAction && (
                        <div className={headerCellClass}>{dt.title}</div>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.map((Data, rowIndex) => {
                const absoluteIndex = page * rowsPerPage + rowIndex;
                const isLastLedgerRow =
                  absoluteIndex === AllRows.length - 1 && isLedger;
                return (
                  <TableRow
                    key={Data._id || absoluteIndex}
                    hover
                    sx={{
                      ...(isLastLedgerRow
                        ? { backgroundColor: "#0f172a", color: "#fff" }
                        : {
                            "&:nth-of-type(even)": { backgroundColor: "#f8fafc" },
                          }),
                    }}
                  >
                    {Columns.map((column, i) => {
                      if (isActionColumn(column)) {
                        const actions = buildRowActions({
                          column,
                          Data,
                          rowIndex: absoluteIndex,
                          handlers,
                          basePath,
                        });
                        return (
                          <TableCell
                            key={i}
                            align="center"
                            sx={{
                              borderBottom: "1px solid #e2e8f0",
                              width: 48,
                              minWidth: 48,
                              maxWidth: 48,
                              px: 0.5,
                            }}
                          >
                            <div className="flex justify-center">
                              <ContextMenu actions={actions} />
                            </div>
                          </TableCell>
                        );
                      }

                      const value = formatCellValue(Data, column);
                      const isDr = column.id === "dr" && Data.dr > 0;
                      const isCr = column.id === "cr" && Data.cr > 0;

                      return (
                        <TableCell
                          key={i}
                          align="center"
                          sx={{ borderBottom: "1px solid #e2e8f0" }}
                        >
                          <div
                            className={[
                              bodyCellClass,
                              column.id === "desc" && "min-w-[200px] whitespace-normal",
                              isDr && "text-red-600 font-semibold",
                              isCr && "text-emerald-600 font-semibold",
                              isLastLedgerRow && "text-white",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {value ?? "-"}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3 p-4">
        {paginatedRows.map((Data, rowIndex) => {
          const absoluteIndex = page * rowsPerPage + rowIndex;
          return (
            <MobileDataCard
              key={Data._id || absoluteIndex}
              data={Data}
              columns={Columns}
              actions={getActionsForRow(Data, absoluteIndex)}
              highlightRemaining
            />
          );
        })}
      </div>

      <CustomPagination
        count={AllRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={setPage}
        RowsPerPage={rowsPerPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(parseInt(value, 10));
          setPage(0);
        }}
      />
    </div>
  );
}
