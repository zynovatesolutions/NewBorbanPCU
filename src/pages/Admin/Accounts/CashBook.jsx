import React, { useEffect, useState } from "react";
import Header from "../../../components/Header/Header";
import CustomBtn from "../../../components/Buttons/CustomBtn";
import SearchableTable from "../../../components/Tables/SearchableTable";
import { useDispatch, useSelector } from "react-redux";
import { fetchCashBooks } from "../../../store/Slices/CashBookSlice";
import { CashBookColumns } from "../../../assets/Columns/CashBookColumns";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";

const CashBook = () => {
  const [SearchText, setSearchText] = useState("");

  const dispatch = useDispatch();
  const CashBookState = useSelector((state) => state.CashBookState);

  let Mounted = false;

  useEffect(() => {
    if (!Mounted) {
      dispatch(fetchCashBooks());
    }
    Mounted = true;
  }, [dispatch]);
  return (
    <BodyWrapper>
      <Header title="Cash Book" desc="Manage your cash book efficiently" />
      <SearchableTable
        SearchPlaceholder={""}
        SearchText={SearchText}
        setSearchText={setSearchText}
        CurrentData={CashBookState.data ? CashBookState.data : [{}]}
        Columns={CashBookColumns}
      />
    </BodyWrapper>
  );
};

export default CashBook;
