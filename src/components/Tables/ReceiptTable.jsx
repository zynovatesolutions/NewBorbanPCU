import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { BiEdit } from "react-icons/bi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Popover, Switch, Typography } from "@mui/material";
import CustomPagination from "./TablePagination";
import { BsEye, BsEyeFill } from "react-icons/bs";
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import { ReceiptCol } from "../../assets/Columns";

export default function ReceiptTable({ Data }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [OpenModal, setOpenModal] = useState(false);
  const [CurrentIndex, setCurrentIndex] = useState("");
  const modalRef = useRef(null);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (val) => {
    setRowsPerPage(parseInt(val, 10));
    setPage(0);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setOpenModal(false);
        setCurrentIndex("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

  return (
    <div>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead style={{ borderBottomWidth: 2, borderColor: "black" }}>
            <TableRow>
              {ReceiptCol.map((dt, i) => {
                const isLast = i === ReceiptCol.length - 1;
                return (
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontFamily: "Quicksand",
                      backgroundColor: "#D9D9D9",
                      padding: "10px 16px",
                      height: "40px",
                      width: "auto",
                      borderRight: isLast ? "none" : "1px solid #b0b0b0",
                    }}
                    align="left"
                    key={i}
                  >
                    <div className="text-[14px] text-black">{dt.title}</div>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {Data.map((data, index) => {
              return (
                <TableRow
                  key={Data._id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  {ReceiptCol.map((r_col, i) => {
                    let get_data;
                    if (r_col.id === "total")
                      get_data =
                        data["price"] * data["quantity"] || "not specified";
                    else get_data = data[r_col.id] || "not specified";
                    const isLastColumn = i === ReceiptCol.length - 1;
                    return (
                      <TableCell
                        sx={{
                          fontWeight: 400,
                          fontFamily: "Quicksand",
                          padding: "8px 16px",
                          borderRight: isLastColumn ? "none" : "1px solid #e0e0e0",
                          borderBottom: "1px solid #eee",
                        }}
                        component="th"
                        scope="row"
                        align="left"
                      >
                        <div
                          className={`flex justify-start items-center ${
                            i === 0 ? "whitespace-nowrap" : ""
                          }`}
                        >
                          {get_data}
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
      {/* <CustomPagination
        count={Data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        RowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      /> */}
    </div>
  );
}
