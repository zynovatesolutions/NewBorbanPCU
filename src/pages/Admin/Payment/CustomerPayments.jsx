import React, { useEffect, useState } from "react";
import SearchableTable from "../../../components/Tables/SearchableTable";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchPaymentById } from "../../../store/Slices/PaymentSlice";
import Header from "../../../components/Header/Header";
import DeleteModal from "../../../components/Modals/DeleteModal";
import { CustomerPaymentsColumns } from "../../../assets/Columns";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import EditPaymentModal from "../../../components/Modals/EditPaymentModal";
import { DeletePaymentAPI } from "../../../ApiRequests";
import { SuccessToast } from "../../../utils/ShowToast";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";

const CustomerPayments = () => {
  const { id } = useParams();
  const [SearchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const [OpenEditModal, setOpenEditModal] = useState(false);
  const [OpenDeleteModal, setOpenDeleteModal] = useState(false);
  const [Selected, setSelected] = useState("");
  const [Loading, setLoading] = useState(false);

  const CustomerPayments = useSelector((state) => state.PaymentState);

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
        title="Customer Payments"
        desc="Manage your payments efficiently"
      />
      {CustomerPayments.loading ? (
        <FetchingLoading />
      ) : (
        CustomerPayments.data && (
          <SearchableTable
            setOpenEditModal={setOpenEditModal}
            setOpenDeleteModal={setOpenDeleteModal}
            setSelected={setSelected}
            SearchPlaceholder={"Search Invoice #..."}
            SearchText={SearchText}
            setSearchText={setSearchText}
            CurrentData={CustomerPayments.data.filter((dt) =>
              SearchText === ""
                ? true
                : dt.invoice_no.toString().startsWith(SearchText.toLowerCase())
            )}
            Columns={CustomerPaymentsColumns}
          />
        )
      )}

      {OpenEditModal && (
        <EditPaymentModal
          open={OpenEditModal}
          setOpen={setOpenEditModal}
          paymentData={Selected}
          customertype={2}
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
                SuccessToast("Customer Payment delete successfully");
                dispatch(fetchPaymentById(id));
              } else {
                ErrorToast(response.data.error?.msg);
              }
            } catch (err) {
              console.log(err);
            }
            setLoading(false);
          }}
        />
      )}
    </BodyWrapper>
  );
};

export default CustomerPayments;
