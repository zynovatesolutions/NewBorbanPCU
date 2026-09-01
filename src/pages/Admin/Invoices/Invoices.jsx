import React, { useEffect, useRef, useState } from "react";
import CustomTabs from "../../../components/Tabs/CustomTabs";
import Header from "../../../components/Header/Header";
import CustomBtn from "../../../components/Buttons/CustomBtn";
import SearchableTable from "../../../components/Tables/SearchableTable";
import { useDispatch, useSelector } from "react-redux";
import CustomerSelector from "../../../components/Selector/CustomerSelector";
import AddStockModal from "../../../components/Modals/AddStockModal";
import { fetchSupplierInvoice } from "../../../store/Slices/SupplierInvoiceSlice";
import { useNavigate } from "react-router-dom";
import { fetchCustomerInvoice } from "../../../store/Slices/CustomerInvoiceSlice";
import InvoiceSelector from "../../../components/Selector/InvoiceSelector";
import SaleType from "../../../components/Inputs/SaleType";
import { fetchCustomerReturnInvoice } from "../../../store/Slices/CustomerReturnInvoiceSlice";
import InvoiceEditItem from "../../../components/InoviceAddItem/InvoiceEditItem";
import InoviceAddItem from "../../../components/InoviceAddItem/InoviceAddItem";
import {
  Delete_RM_StatsApi,
  DELETECustomerReturnInvoicesApi,
  DeleteWholeCustomerInvoice,
} from "../../../ApiRequests";
import { ErrorToast, SuccessToast } from "../../../utils/ShowToast";
import DeleteModal from "../../../components/Modals/DeleteModal";
import { fetchCustomers } from "../../../store/Slices/CustomerSlice";
import { fetchItems } from "../../../store/Slices/ItemSlice";
// import EditStockModal from "../../../components/Modals/EditStockModal";
import SupplierSelector from "../../../components/Selector/SupplierSelector";
import {
  CustomerInvoiceColumns,
  SupplierInvoiceColumns,
} from "../../../assets/Columns";
import ProcessLoader from "../../../components/Loaders/ProcessLoader";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";
import { AppButton } from "../../../components/ui";

const userData = JSON.parse(localStorage.getItem("user"));
const invoiceRole = "";
const invoiceBranchId = "";

const Invoices = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [SearchText, setSearchText] = useState("");
  const [saleType, setSaleType] = useState("SALE");
  const [OpenCustomerModal, setOpenCustomerModal] = useState(false);
  const [OpenCompanyModal, setOpenCompanyModal] = useState(false);
  const [SelectedCustomer, setSelectedCustomer] = useState("");
  const [SelectedSupplier, setSelectedSupplier] = useState("");
  const [SelectedInvoice, setSelectedInvoice] = useState("");
  const [OpenEditModal, setOpenEditModal] = useState(false);
  const [OpenDeleteModal, setOpenDeleteModal] = useState(false);
  const [Selected, setSelected] = useState("");
  const [Purchase, setPurchase] = useState("");
  const [Loading, setLoading] = useState(false);
  const [AddItemLoading, setAddItemLoading] = useState(false);
  const [DeleteLoading, setDeleteLoading] = useState(false);

  const [OpenNewOne, setOpenNewOne] = useState(false);

  const [OpenDeleteInvoiceModal, setOpenDeleteInvoiceModal] = useState(false);

  const [itemId, setItemId] = useState("");
  const [name, setName] = useState("");
  const [net_vol, setNet_vol] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [NewItems, setNewItems] = useState([]);
  const [code, setCode] = useState("");
  const itemCodeInputRef = useRef(null);
  const [Discount, setDiscount] = useState(0);
  const [CurDate, setCurDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const CompanyInvoices = useSelector((state) => state.SupplierInvoices);
  const CustomerInvoices = useSelector((state) => state.CustomerInvoices);
  const CustomerReturnInvoices = useSelector(
    (state) => state.CustomerReturnInvoices
  );

  // const Suppliers = useSelector((state) => state.Suppliers);

  let MountedSupplier = false;

  useEffect(() => {
    if (!MountedSupplier && SelectedSupplier) {
      dispatch(fetchSupplierInvoice(SelectedSupplier._id));
    }
    MountedSupplier = true;
  }, [SelectedSupplier, dispatch]);

  let MountedCustomer = false;

  useEffect(() => {
    if (!MountedCustomer) {
      setSelectedInvoice("");
      if (SelectedCustomer) {
        if (saleType === "SALE") {
          const p = { id: SelectedCustomer._id, role: 3 };
          dispatch(fetchCustomerInvoice(p));
        } else if (saleType === "RETURN") {
          setSelectedInvoice("");
          const p = { id: SelectedCustomer._id, role: 3 };
          dispatch(fetchCustomerReturnInvoice(p));
        }
      }
    }
    MountedCustomer = true;
  }, [SelectedCustomer, saleType, dispatch]);

  return (
    <BodyWrapper>
      <Header title="Invoices" desc="Manage your invoices efficiently">
        <CustomBtn
          title={"Add Stock"}
          onClick={() => {
            setOpenCompanyModal(true);
          }}
        />
      </Header>

      <div className="z-10  mb-1">
        <CustomTabs
          tabs={[{ label: "Customer" }, { label: "Supplier" }]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      <div className="z-10">
        <div className="w-full mt-5 flex justify-center items-center">
          {activeTab === 0 && (
            <div className="flex flex-col items-end w-full gap-y-3">
              <div className="mb-5 z-5 w-full">
                <SaleType saleType={saleType} setSaleType={setSaleType} />
              </div>
              <div className="w-full flex flex-col gap-y-2">
                <CustomerSelector
                  SelectedCustomer={SelectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                />
                {SelectedCustomer &&
                  CustomerInvoices.data &&
                  CustomerInvoices.data.length > 0 && (
                    <InvoiceSelector
                      InvoicesData={
                        saleType === "SALE"
                          ? CustomerInvoices.data
                          : CustomerReturnInvoices.data
                      }
                      activeTab={SelectedInvoice}
                      setActiveTab={setSelectedInvoice}
                    />
                  )}
              </div>
              {SelectedInvoice && (
                <div className="flex flex-col w-full">
                  <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <span className="font-semibold text-slate-500">Name: </span>
                        <span className="font-semibold text-slate-900">
                          {SelectedCustomer.name}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500">Address: </span>
                        <span className="font-semibold text-slate-900">
                          {SelectedCustomer.address}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500">Contact: </span>
                        <span className="font-semibold text-slate-900">
                          {SelectedCustomer.contact}
                        </span>
                      </div>
                      {saleType === "SALE" && (
                        <div>
                          <span className="font-semibold text-slate-500">Discount: </span>
                          <span className="font-semibold text-slate-900">
                            {
                              CustomerInvoices.data?.find(
                                (dt) => dt._id === SelectedInvoice
                              )?.discount
                            }
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-slate-500">Total: </span>
                        <span className="font-semibold text-slate-900">
                          {saleType === "SALE"
                            ? CustomerInvoices.data?.find(
                                (dt) => dt._id === SelectedInvoice
                              )?.total_amount || 0
                            : CustomerReturnInvoices.data?.find(
                                (dt) => dt._id === SelectedInvoice
                              )?.total_amount || 0}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500">Invoice No: </span>
                        <span className="font-semibold text-slate-900">
                          {saleType === "SALE"
                            ? CustomerInvoices.data?.find(
                                (dt) => dt._id === SelectedInvoice
                              )?.invoice_no || ""
                            : CustomerReturnInvoices.data?.find(
                                (dt) => dt._id === SelectedInvoice
                              )?.invoice_no || ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {saleType !== "RETURN" &&
                    SelectedCustomer &&
                    !OpenEditModal && (
                      <InoviceAddItem
                        bgColor={saleType === "SALE" ? "bg-slate-900" : "bg-red-600"}
                        NewItems={NewItems}
                        setNewItems={setNewItems}
                        Loading={AddItemLoading}
                        OnAdd={true}
                        InvoiceId={SelectedInvoice}
                        SelectedCustomer={SelectedCustomer}
                      />
                    )}
                  {Selected && OpenEditModal && (
                    <InvoiceEditItem
                      selectedItem={Selected}
                      setOpen={setOpenEditModal}
                      setSelected={setSelected}
                      InvoiceId={SelectedInvoice}
                      SelectedCustomer={SelectedCustomer}
                    />
                  )}
                  {SelectedInvoice &&
                    !CustomerInvoices.loading &&
                    !CustomerReturnInvoices.loading && (
                      <SearchableTable
                        SelectedCustomer={SelectedCustomer}
                        setOpenEditModal={setOpenEditModal}
                        setOpenDeleteModal={setOpenDeleteModal}
                        setSelected={setSelected}
                        SearchPlaceholder={"Search Item Name..."}
                        SearchText={SearchText}
                        setSearchText={setSearchText}
                        CurrentData={
                          saleType === "SALE"
                            ? CustomerInvoices.data?.find(
                                (dt) => dt._id === SelectedInvoice
                              )?.items || []
                            : saleType === "RETURN"
                            ? CustomerReturnInvoices.data?.find(
                                (dt) => dt._id === SelectedInvoice
                              )?.items || []
                            : []
                        }
                        Columns={CustomerInvoiceColumns}
                      />
                    )}
                </div>
              )}
              <div className="">
                {saleType === "RETURN" && (
                  <button
                    onClick={async () => {
                      console.log(SelectedInvoice);

                      try {
                        const response = await DELETECustomerReturnInvoicesApi(
                          SelectedInvoice
                        );
                        console.log(response);
                        dispatch(
                          fetchCustomerReturnInvoice(SelectedCustomer._id)
                        );
                        SelectedInvoice("");
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                    className="bo"
                  >
                    Delete Invoice
                  </button>
                )}
                {saleType === "SALE" && SelectedInvoice && !DeleteLoading && (
                  <button
                    onClick={async () => {
                      setDeleteLoading(true);
                      try {
                        const InvoicesData =
                          saleType === "SALE"
                            ? CustomerInvoices.data
                            : CustomerReturnInvoices.data;

                        const s_invoice = InvoicesData.find(
                          (dt) => dt._id === SelectedInvoice
                        )?._id;

                        const response = await DeleteWholeCustomerInvoice(
                          s_invoice
                        );
                        if (response.data.success) {
                          SuccessToast("Invoice deleted successfully");
                          dispatch(
                            fetchCustomerInvoice({
                              id: SelectedCustomer._id,
                              role: 3,
                            })
                          );
                          dispatch(fetchCustomers());
                            dispatch(fetchItems());
                        }
                        setSelectedInvoice("");
                      } catch (error) {
                        console.log(error);
                      }
                      setDeleteLoading(false);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 px-3 font-JakartaSans font-bold transition-all ease-in-out duration-500 hover:rounded-[5px]"
                  >
                    Delete Invoice
                  </button>
                )}
                {DeleteLoading && <ProcessLoader />}
              </div>
              {SelectedInvoice && (
                <AppButton
                  variant="accent"
                  onClick={() => {
                    const InvoicesData =
                      saleType === "SALE"
                        ? CustomerInvoices.data
                        : CustomerReturnInvoices.data;

                    const s_invoice = InvoicesData.find(
                      (dt) => dt._id === SelectedInvoice
                    )?._id;

                    navigate(
                      "/admin" +
                        "/customer-invoice/detail/" +
                        s_invoice
                    );
                  }}
                >
                  Print Invoice
                </AppButton>
              )}
            </div>
          )}
          {activeTab === 1 && (
            <div className="flex flex-col w-full gap-y-3 items-end">
              <div className="w-full">
                <SupplierSelector
                  SelectedSupplier={SelectedSupplier}
                  setSelectedSupplier={setSelectedSupplier}
                />
              </div>
              {SelectedSupplier && CompanyInvoices.data && (
                <SearchableTable
                  setOpenEditModal={setOpenEditModal}
                  setOpenDeleteModal={setOpenDeleteModal}
                  setSelected={setSelected}
                  SearchPlaceholder={"Search Invoice #..."}
                  SearchText={SearchText}
                  setSearchText={setSearchText}
                  CurrentData={CompanyInvoices.data.filter((dt) =>
                    SearchText === ""
                      ? true
                      : dt.invoice_no
                          .toLowerCase()
                          .startsWith(SearchText.toLowerCase())
                  )}
                  Columns={SupplierInvoiceColumns}
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
                      const response = await Delete_RM_StatsApi(Selected._id);
                      if (response.data.success) {
                        setOpenDeleteModal(false);
                        SuccessToast("Supplier Invoice delete successfully");
                        dispatch(fetchSupplierInvoice(SelectedSupplier._id));
                      } else {
                        ErrorToast(response.data.error?.msg);
                      }
                    } catch (err) {
                      ErrorToast(
                        err.response.data.error.msg ||
                          "Failed to delete customer!"
                      );
                    }
                    setLoading(false);
                  }}
                />
              )}
              {/* {OpenEditModal && (
                <EditStockModal
                  stockDetail={Selected}
                  Open={OpenEditModal}
                  setOpen={setOpenEditModal}
                />
              )} */}
            </div>
          )}
        </div>
        {OpenCompanyModal && (
          <AddStockModal
            Open={OpenCompanyModal}
            setOpen={setOpenCompanyModal}
          />
        )}
      </div>
    </BodyWrapper>
  );
};

export default Invoices;
