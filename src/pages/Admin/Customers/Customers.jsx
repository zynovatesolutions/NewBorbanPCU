import React, { useState, useEffect, useMemo } from "react";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";
import Header from "../../../components/Header/Header";
import SearchableTable from "../../../components/Tables/SearchableTable";
import CustomBtn from "../../../components/Buttons/CustomBtn";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomers } from "../../../store/Slices/CustomerSlice";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../../components/Modals/DeleteModal";
import { DeleteCustomerApi } from "../../../ApiRequests";
import { ErrorToast, SuccessToast } from "../../../utils/ShowToast";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import ExportToExcelButton from "../../../utils/ExportToExcel";
import PrintButton from "../../../components/Buttons/PrintButton";
import AddOpeningBalanceCustomerModal from "../../../components/Modals/AddOpeningBalanceCustomerModal";
import { CustomerColumns } from "../../../assets/Columns";
import EditCustomerModal from "../../../components/Modals/EditCustomerModal";
import CreateCustomerModal from "../../../components/Modals/CreateCustomer";
import CityFilter from "../../../components/Selector/CityFilter";

const userData = JSON.parse(localStorage.getItem("user"));
const role = Number(localStorage.getItem("role")) || "";
const branchId = "";

const Customers = () => {
  const [SearchText, setSearchText] = useState("");
  const [OpenModal, setOpenModal] = useState(false);
  const [OpenInvoiceModal, setOpenInvoiceModal] = useState(false);
  const [OpenEditModal, setOpenEditModal] = useState(false);
  const [OpenDeleteModal, setOpenDeleteModal] = useState(false);
  const [Selected, setSelected] = useState("");
  const [Loading, setLoading] = useState(false);
  const [SelectedCities, setSelectedCities] = useState([]);

  const [OpenOpeningBalance, setOpenOpeningBalance] = useState(false);

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const CustomersState = useSelector((state) => state.CustomerState);

  let Mounted = false;

  useEffect(() => {
    if (!Mounted) {
      dispatch(fetchCustomers());
    }
    Mounted = true;
  }, [dispatch]);

  const filteredData = useMemo(() => {
    const data = CustomersState.data || [];
    if (SelectedCities.length === 0) return data;
    return data.filter((c) => SelectedCities.includes(c.address || ""));
  }, [CustomersState.data, SelectedCities]);

  const summary = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return { total: 0, paid: 0, remaining: 0 };
    }
    return filteredData.reduce(
      (acc, customer) => ({
        total: acc.total + (customer.total || 0),
        paid: acc.paid + (customer.paid || 0),
        remaining: acc.remaining + (customer.remaining || 0),
      }),
      { total: 0, paid: 0, remaining: 0 }
    );
  }, [filteredData]);

  return (
    <BodyWrapper>
      <Header title="Customers" desc="Overview of your customer management">
        <CustomBtn
          title={"Add Opening Balance"}
          onClick={() => {
            setOpenOpeningBalance(true);
          }}
        />
        <CustomBtn
          title={"Add New Customer"}
          onClick={() => {
            setOpenModal(true);
          }}
        />
      </Header>
      <div className="flex flex-col gap-x-2 items-end justify-end gap-y-4">
        <div className="max-w-[400px] w-full">
          <CityFilter
            selectedCities={SelectedCities}
            onSelectionChange={setSelectedCities}
          />
        </div>
        <div className="flex justify-end gap-x-2">
          <PrintButton
            onClick={() => {
              navigate("/admin/customers-ograi-report");
            }}
            title="Ograi Report"
          />
          <PrintButton
            onClick={() => {
              navigate("/admin/customers-report");
            }}
            title="Customers Report"
          />
          <ExportToExcelButton
            data={filteredData
              .filter((dt) => {
                const searchMatch =
                  SearchText === "" ||
                  dt.name.toLowerCase().startsWith(SearchText.toLowerCase());
                return searchMatch;
              })
              .map((dt) => {
                return {
                  name: dt.name,
                  address: dt.address,
                  total: dt.total,
                  opening_balance: dt.opening_balance,
                  discount: dt.discount,
                  return_amount: dt.return_amount,
                  paid: dt.paid,
                  remaining: dt.remaining,
                };
              })}
            fileName={"Customers"}
          />
        </div>
      </div>
      <div className="w-full mt-10 flex flex-col items-center">
        {CustomersState.loading ? (
          <div className="flex flex-1 justify-center items-center">
            <FetchingLoading />
          </div>
        ) : (
          CustomersState.data.length !== 0 && (
            <div className="w-full max-w-7xl">
              <SearchableTable
                setOpenEditModal={setOpenEditModal}
                setOpenDeleteModal={setOpenDeleteModal}
                setSelected={setSelected}
                SearchPlaceholder={"Search Customer Name..."}
                SearchText={SearchText}
                setSearchText={setSearchText}
                CurrentData={filteredData.filter((dt) => {
                  const searchMatch =
                    SearchText === "" ||
                    dt.name.toLowerCase().startsWith(SearchText.toLowerCase());
                  return searchMatch;
                })}
                Columns={
                  CustomerColumns.filter((dt) => dt.id !== "branchId")
                }
              />
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md border-[2px] border-black">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Amount
                  </h3>
                  <p className="text-2xl font-bold text-gray-800">
                    Rs {summary.total.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md border-[2px] border-black">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Received
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    Rs {summary.paid.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md border-[2px] border-black">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Receivable
                  </h3>
                  <p className="text-2xl font-bold text-red-600">
                    Rs {summary.remaining.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
      {OpenModal && (
        <CreateCustomerModal
          OpenModal={OpenModal}
          setOpenModal={setOpenModal}
        />
      )}

      {OpenOpeningBalance && (
        <AddOpeningBalanceCustomerModal
          Open={OpenOpeningBalance}
          setOpen={setOpenOpeningBalance}
        />
      )}
      {OpenEditModal && (
        <EditCustomerModal
          OpenModal={OpenEditModal}
          setOpenModal={setOpenEditModal}
          customer={Selected}
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
              const response = await DeleteCustomerApi(Selected._id);
              if (response.data.success) {
                setOpenDeleteModal(false);
                SuccessToast("Customer delete successfully");
                dispatch(fetchCustomers());
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

export default Customers;
