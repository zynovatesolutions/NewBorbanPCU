import React, { useEffect, useState } from "react";
import CustomTabs from "../../../components/Tabs/CustomTabs";
import Header from "../../../components/Header/Header";
import CustomBtn from "../../../components/Buttons/CustomBtn";
import SearchableTable from "../../../components/Tables/SearchableTable";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomers } from "../../../store/Slices/CustomerSlice";
import { fetchSuppliers } from "../../../store/Slices/SupplierSlice";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import { CustomerColumns, SupplierColumns } from "../../../assets/Columns";
import AddNewPaymentModal from "../../../components/Modals/AddNewPaymentModal";
import { useNavigate } from "react-router-dom";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const Payment = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [SearchText, setSearchText] = useState("");
  const [OpenModal, setOpenModal] = useState(false);

  const dispatch = useDispatch();
  const CustomerState = useSelector((state) => state.CustomerState);
  const SupplierState = useSelector((state) => state.SupplierState);
  const navigate = useNavigate();

  let Mounted = false;

  useEffect(() => {
    if (!Mounted) {
      dispatch(fetchSuppliers());
      dispatch(fetchCustomers());
    }
    Mounted = true;
  }, [dispatch]);

  return (
    <BodyWrapper>
      <Header title="Payments" desc="Manage your payments efficiently">
        <CustomBtn
          title={"Add Payment"}
          onClick={() => {
            setOpenModal(true);
          }}
        />
        <CustomBtn
          title={"Deleted Payments"}
          onClick={() => {
            navigate(
              "/admin/deleted-payments"
            );
          }}
        />
      </Header>
      <div className="z-10 mb-1">
        <CustomTabs
          tabs={[{ label: "Customer" }, { label: "Supplier" }]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      <div className="z-20">
        <div className="w-full mt-5 flex justify-center items-center">
          {CustomerState.loading && activeTab === 0 ? (
            <FetchingLoading />
          ) : (
            CustomerState.loading === false &&
            CustomerState.data.length > 0 &&
            CustomerState.data &&
            activeTab === 0 && (
              <SearchableTable
                SearchPlaceholder={"Search Customer Name..."}
                SearchText={SearchText}
                setSearchText={setSearchText}
                CurrentData={CustomerState.data.filter(
                  (dt) =>
                    SearchText === "" ||
                    dt.name.toLowerCase().startsWith(SearchText.toLowerCase())
                )}
                Columns={[
                  { id: "payments", title: "Payments", type: "Customer" },
                  ...CustomerColumns.filter((dt) =>
                    ["name", "total", "paid", "remaining"].includes(dt.id)
                  ),
                ]}
              />
            )
          )}
          {activeTab === 1 && SupplierState.loading ? (
            <FetchingLoading />
          ) : (
            SupplierState.loading === false &&
            SupplierState.data.length > 0 &&
            SupplierState.data &&
            activeTab === 1 && (
              <SearchableTable
                SearchPlaceholder={"Search Supplier Name..."}
                SearchText={SearchText}
                setSearchText={setSearchText}
                CurrentData={SupplierState.data.filter(
                  (dt) =>
                    SearchText === "" ||
                    dt.name.toLowerCase().startsWith(SearchText.toLowerCase())
                )}
                Columns={[
                  { id: "payments", title: "Payments", type: "Company" },
                  ...SupplierColumns.filter((dt) =>
                    ["name", "total", "paid", "remaining"].includes(dt.id)
                  ),
                ]}
              />
            )
          )}
        </div>
        {OpenModal && (
          <AddNewPaymentModal open={OpenModal} setOpen={setOpenModal} />
        )}
      </div>
    </BodyWrapper>
  );
};

export default Payment;
