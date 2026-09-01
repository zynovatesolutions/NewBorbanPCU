import React, { useEffect, useState } from "react";
import moment from "moment";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { CgArrowsExchangeAltV } from "react-icons/cg";
import Header from "../../../components/Header/Header";
import { fetchCashSummary } from "../../../store/Slices/CashSummarySlice";
import { useDispatch, useSelector } from "react-redux";
import SearchableTable from "../../../components/Tables/SearchableTable";
import { AccountSummaryColumns } from "../../../assets/Columns";
import FigureCard from "../../../components/Cards/FigureCard";
import { fetchAccountsAmount } from "../../../store/Slices/AccountSlice";
import ExportToExcelButton from "../../../utils/ExportToExcel";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";
import { AppInput, LoadingState } from "../../../components/ui";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const AccountSummary = () => {
  const [OpenEditModal, setOpenEditModal] = useState(false);
  const [OpenDeleteModal, setOpenDeleteModal] = useState(false);
  const [Selected, setSelected] = useState("");
  const [FromNewDate, setFromNewDate] = useState(
    moment(new Date(0)).toDate().toISOString().split("T")[0]
  );
  const [ToNewDate, setToNewDate] = useState(
    moment().toDate().toISOString().split("T")[0]
  );
  const [SearchText, setSearchText] = useState("");

  const dispatch = useDispatch();
  const AccountSummaryState = useSelector((state) => state.AccountSummaryState);
  const AccountState = useSelector((state) => state.AccountState);

  useEffect(() => {
    dispatch(
      fetchCashSummary({
        id: "all",
        payload: {
          startDate: FromNewDate,
          endDate: ToNewDate,
        },
      })
    );
  }, [FromNewDate, ToNewDate, dispatch]);

  useEffect(() => {
    dispatch(fetchAccountsAmount());
  }, [dispatch]);

  const rows = AccountSummaryState.data || [];
  const debitTotal = rows.reduce((acc, curr) => acc + (curr.dr || 0), 0);
  const creditTotal = rows.reduce((acc, curr) => acc + (curr.cr || 0), 0);
  const closingBalance = rows[rows.length - 1]?.bal;

  if (AccountSummaryState.loading) {
    return (
      <BodyWrapper>
        <Header
          back
          title="Account Summary"
          desc="Manage your accounts summary efficiently"
        />
        <div className="py-16">
          <LoadingState label="Loading account summary..." />
        </div>
      </BodyWrapper>
    );
  }

  return (
    <BodyWrapper>
      <Header
        back
        title="Account Summary"
        desc="Manage your accounts summary efficiently"
      >
        <ExportToExcelButton
          data={rows.length ? rows : [{}]}
          fileName={"Account Summary"}
        />
      </Header>

      <div className="mb-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-end">
        <AppInput
          type="date"
          label="From"
          value={FromNewDate}
          onChange={(e) => setFromNewDate(e.target.value)}
          className="sm:max-w-[220px]"
        />
        <FaArrowRightArrowLeft className="mb-3 hidden text-slate-400 sm:block" />
        <CgArrowsExchangeAltV className="mx-auto text-2xl text-slate-400 sm:hidden" />
        <AppInput
          type="date"
          label="To"
          value={ToNewDate}
          onChange={(e) => setToNewDate(e.target.value)}
          className="sm:max-w-[220px]"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <FigureCard
          title="Opening Balance"
          value={AccountState.data?.[0]?.opening_balance ?? "—"}
        />
        <FigureCard title="Debit" value={debitTotal} />
        <FigureCard title="Credit" value={creditTotal} />
        <FigureCard title="Closing Balance" value={closingBalance ?? "—"} />
      </div>

      <SearchableTable
        setOpenEditModal={setOpenEditModal}
        setOpenDeleteModal={setOpenDeleteModal}
        setSelected={setSelected}
        SearchPlaceholder={"Search Account Title..."}
        SearchText={SearchText}
        setSearchText={setSearchText}
        CurrentData={rows.length ? rows : [{}]}
        Columns={AccountSummaryColumns}
      />
    </BodyWrapper>
  );
};

export default AccountSummary;
