import React, { useEffect, useState } from "react";
import SearchableTable from "../../../components/Tables/SearchableTable";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Header from "../../../components/Header/Header";
import DeleteModal from "../../../components/Modals/DeleteModal";
import { DeletePaymentAPI } from "../../../ApiRequests";
import { ErrorToast, SuccessToast } from "../../../utils/ShowToast";
import { fetchPaymentById } from "../../../store/Slices/PaymentSlice";
import { SupplierPaymentsColumns } from "../../../assets/Columns";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import EditPaymentModal from "../../../components/Modals/EditPaymentModal";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";

const CompanyPayments = () => {
  const { id } = useParams();
  const [SearchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const [OpenEditModal, setOpenEditModal] = useState(false);
  const [OpenDeleteModal, setOpenDeleteModal] = useState(false);
  const [Selected, setSelected] = useState("");
  const [Loading, setLoading] = useState(false);

  const CompanyPayments = useSelector((state) => state.PaymentState);

  let Mounted = false;

  useEffect(() => {
    if (!Mounted) {
      dispatch(fetchPaymentById(id));
    }
    Mounted = true;
  }, [dispatch, id]);

  return (
    <BodyWrapper>
      <Header
        back={true}
        title="Supplier Payments"
        desc="Manage your payments efficiently"
      />
      {CompanyPayments.loading ? (
        <FetchingLoading />
      ) : (
        CompanyPayments.data && (
          <SearchableTable
            setOpenEditModal={setOpenEditModal}
            setOpenDeleteModal={setOpenDeleteModal}
            setSelected={setSelected}
            SearchPlaceholder={"Search Invoice #..."}
            SearchText={SearchText}
            setSearchText={setSearchText}
            CurrentData={CompanyPayments.data.filter((dt) =>
              SearchText === ""
                ? true
                : dt.invoice_no.toString().startsWith(SearchText.toLowerCase())
            )}
            Columns={SupplierPaymentsColumns}
          />
        )
      )}

      {OpenEditModal && (
        <EditPaymentModal
          open={OpenEditModal}
          setOpen={setOpenEditModal}
          paymentData={Selected}
          customertype={1}
        />
      )}

      {OpenDeleteModal && (
        <DeleteModal
          Open={OpenDeleteModal}
          setOpen={setOpenDeleteModal}
          Loading={Loading}
          onSubmit={async () => {
            setLoading(true);
            try {
              const response = await DeletePaymentAPI(Selected._id);
              if (response.data.success) {
                setOpenDeleteModal(false);
                SuccessToast("Supplier Payment delete successfully");
                dispatch(dispatch(fetchPaymentById(id)));
              } else {
                ErrorToast(response.data.error?.msg);
              }
            } catch (err) {
              ErrorToast(
                err.response.data.error.msg || "Failed to delete customer!"
              );
            }
            setLoading(false);
          }}
        />
      )}
    </BodyWrapper>
  );
};

export default CompanyPayments;
