import React, { useEffect, useState } from "react";
import SearchableTable from "../../../components/Tables/SearchableTable";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../../components/Header/Header";
import { CustomerPaymentsColumns } from "../../../assets/Columns";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import { fetchDeletedPayment } from "../../../store/Slices/DeletedPaymentSlice";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";

const DeletedPayment = () => {
  const [SearchText, setSearchText] = useState("");
  const dispatch = useDispatch();

  const DeletedPayments = useSelector((state) => state.DeletedPaymentState);

  let Mounted = false;

  useEffect(() => {
    if (!Mounted) {
      dispatch(fetchDeletedPayment());
    }
    Mounted = true;
  }, [dispatch]);

  return (
    <BodyWrapper>
      <Header
        back={true}
        title="Deleted Payments"
        desc="Manage your payments efficiently"
      />
      {DeletedPayments.loading ? (
        <FetchingLoading />
      ) : (
        DeletedPayments.data && (
          <SearchableTable
            SearchPlaceholder={"Search Invoice #..."}
            SearchText={SearchText}
            setSearchText={setSearchText}
            CurrentData={DeletedPayments.data.filter((dt) =>
              SearchText === ""
                ? true
                : dt.invoice_no.toString().startsWith(SearchText.toLowerCase())
            )}
            Columns={CustomerPaymentsColumns.filter(
              (col) => col.id !== "actions"
            )}
          />
        )
      )}
    </BodyWrapper>
  );
};

export default DeletedPayment;
