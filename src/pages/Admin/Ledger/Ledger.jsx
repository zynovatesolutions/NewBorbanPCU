import React, { useEffect, useState, useMemo } from "react";
import CustomTabs from "../../../components/Tabs/CustomTabs";
import Header from "../../../components/Header/Header";
import SearchableTable from "../../../components/Tables/SearchableTable";
import { useDispatch, useSelector } from "react-redux";
import CustomerSelector from "../../../components/Selector/CustomerSelector";
import { fetchCustomerLedger } from "../../../store/Slices/CustomerLedgerSlice";
import { fetchSupplierLedger } from "../../../store/Slices/SupplierLedgerSlice";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import PrintButton from "../../../components/Buttons/PrintButton";
import ExportToExcelButton from "../../../utils/ExportToExcel";
import { useNavigate, useLocation } from "react-router-dom";
// import { fetchCustomerItemSummary } from "../../../store/Slices/CustomerItemSummarySlice";
// import { CustomerItemSummaryColumns } from "../../../assets/Columns/CustomerItemSummaryColumns";
// import ItemSummaryTable from "../../../components/Tables/ItemSummaryTable";
import FigureCard from "../../../components/Cards/FigureCard";
// import { fetchCompanyItemSummary } from "../../../store/Slices/CompanyItemSummarySlice";
import SupplierSelector from "../../../components/Selector/SupplierSelector";
import {
  CompanyCompleteLedgerColumns,
  CustomerCompleteLedgerColumns,
} from "../../../assets/Columns";
import NewCustomTabs from "../../../components/Tabs/NewCustomTabs";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";

const userData = JSON.parse(localStorage.getItem("user"));
const role = userData ? Number(userData.role) : "";
const basePath = "/admin";

const Ledger = () => {
  const tabs = ["Customer", "Supplier"];
  const location = useLocation();
  const [NewCurrentTab, setNewCurrentTab] = useState(0);

  const [activeTab, setActiveTab] = useState(0);
  const [SearchText, setSearchText] = useState("");
  const [SelectedCustomer, setSelectedCustomer] = useState("");
  const [SelectedSupplier, setSelectedSupplier] = useState("");
  const [CurrentTab, setCurrentTab] = useState("All");
  const [CurrentSummaryTab, setCurrentSummaryTab] = useState("All");

  const dispatch = useDispatch();

  // Open ledger directly from Customers / Suppliers list
  useEffect(() => {
    const { ledgerType, party } = location.state || {};
    if (!party?._id) return;
    if (ledgerType === "customer") {
      setNewCurrentTab(0);
      setSelectedCustomer(party);
      setSelectedSupplier("");
    } else if (ledgerType === "supplier") {
      setNewCurrentTab(1);
      setSelectedSupplier(party);
      setSelectedCustomer("");
    }
  }, [location.state]);
  const CustomerLedgers = useSelector((state) => state.CustomerLedgers);
  const SupplierLedgers = useSelector((state) => state.SupplierLedgers);
  const CustomerItemSummaryState = useSelector(
    (state) => state.CustomerItemSummaryState
  );
  const CompanyItemSummaryState = useSelector(
    (state) => state.CompanyItemSummaryState
  );

  const totalReturn = useMemo(() => {
    if (!Array.isArray(CustomerLedgers.data)) return 0;
    return CustomerLedgers.data
      .filter((dt) => dt.type === 3)
      .reduce((acc, item) => acc + (item.cr || 0), 0);
  }, [CustomerLedgers.data]);

  const customerLedgerSummary = useMemo(() => {
    if (!CustomerLedgers.data.length) return { cr: 0, dr: 0, qty: 0 };

    return CustomerLedgers.data.reduce(
      (acc, item) => ({
        cr: acc.cr + (item.cr || 0),
        dr: acc.dr + (item.dr || 0),
        qty: acc.qty + (item.qty || 0),
      }),
      { cr: 0, dr: 0, qty: 0 }
    );
  }, [CustomerLedgers.data]);

  const supplierLedgerSummary = useMemo(() => {
    if (!SupplierLedgers.data.length) return { cr: 0, dr: 0, qty: 0 };

    return SupplierLedgers.data.reduce(
      (acc, item) => ({
        cr: acc.cr + (item.cr || 0),
        dr: acc.dr + (item.dr || 0),
        qty: acc.qty + (item.qty || 0),
      }),
      { cr: 0, dr: 0, qty: 0 }
    );
  }, [SupplierLedgers.data]);

  let MountedCustomer = false;

  useEffect(() => {
    if (!MountedCustomer && SelectedCustomer._id) {
      dispatch(fetchCustomerLedger(SelectedCustomer._id));
      // dispatch(fetchCustomerItemSummary(SelectedCustomer._id));
    }
    MountedCustomer = true;
  }, [SelectedCustomer, dispatch]);

  let MountedSupplier = false;

  useEffect(() => {
    if (!MountedSupplier && SelectedSupplier._id) {
      dispatch(fetchSupplierLedger(SelectedSupplier._id));
      // dispatch(fetchCompanyItemSummary(SelectedSupplier._id));
    }
    MountedSupplier = true;
  }, [SelectedSupplier, dispatch]);

  const navigate = useNavigate();

  return (
    <BodyWrapper>
      <Header title="Ledgers" desc="Overview of your ledger management" />
      {/* <CustomTabs
        tabs={[{ label: "Customer" }, { label: "Supplier" }]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      /> */}
      <NewCustomTabs
        tabs={tabs}
        CurrentTab={NewCurrentTab}
        setCurrentTab={setNewCurrentTab}
      />
      <div className="w-full mt-5 flex justify-center items-start h-[72vh] scrollable">
        {NewCurrentTab === 0 && (
          <div className="flex flex-col w-full gap-y-5">
            <CustomerSelector
              SelectedCustomer={SelectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
            />
            {SelectedCustomer && (
              <div className="flex w-full mt-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {["All", "Item", "Cash", "Return"].map((tb) => {
                  return (
                    <div
                      key={tb}
                      className={`w-full cursor-pointer py-3 text-center text-sm font-semibold transition ${
                        CurrentTab === tb
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-200/70"
                      } `}
                      onClick={() => {
                        setCurrentTab(tb);
                      }}
                    >
                      {tb === "SH" ? "Customer" : tb}
                    </div>
                  );
                })}
              </div>
            )}
            {SelectedCustomer && (
              <div className="flex justify-end gap-x-2">
                <PrintButton
                  onClick={() => {
                    navigate(
                      basePath + "/customer-ledger-report/" + SelectedCustomer._id
                    );
                  }}
                  title="Customers Report"
                />
                <ExportToExcelButton
                  data={
                    CurrentTab === "SH"
                      ? CustomerLedgers?.data?.ShAll || []
                      : CurrentTab === "All"
                      ? (CustomerLedgers?.data?.All || []).filter((dt) =>
                          SearchText === ""
                            ? true
                            : dt.invoice
                                .toLowerCase()
                                .startsWith(SearchText.toLowerCase())
                        )
                      : CurrentTab === "Item"
                      ? CustomerLedgers?.data?.Item || []
                      : CurrentTab === "Cash"
                      ? CustomerLedgers?.data?.Cash || []
                      : CustomerLedgers?.data?.Return || []
                  }
                  fileName={"Customer Ledger"}
                />
              </div>
            )}
            {CustomerLedgers.loading ? (
              <div className="flex flex-1 justify-center items-center">
                <FetchingLoading />
              </div>
            ) : (
              CustomerLedgers.data.length !== 0 &&
              SelectedCustomer && (
                <>
                  <SearchableTable
                    SearchText={SearchText}
                    setSearchText={setSearchText}
                    SearchPlaceholder={"Search Invoice"}
                    isLedger={true}
                    CurrentData={
                      CurrentTab === "SH"
                        ? CustomerLedgers?.data?.ShAll || []
                        : CurrentTab === "All"
                        ? (CustomerLedgers?.data?.All || []).filter((dt) =>
                            SearchText === ""
                              ? true
                              : dt.invoice
                                  .toLowerCase()
                                  .startsWith(SearchText.toLowerCase())
                          )
                        : CurrentTab === "Item"
                        ? CustomerLedgers?.data?.Item || []
                        : CurrentTab === "Cash"
                        ? CustomerLedgers?.data?.Cash || []
                        : CustomerLedgers?.data?.Return || []
                    }
                    Columns={
                      CurrentTab === "All" || CurrentTab === "SH"
                        ? CustomerCompleteLedgerColumns
                        : CurrentTab === "Item"
                        ? CustomerCompleteLedgerColumns.filter(
                            (cl) => cl.id !== "dr"
                          )
                        : CurrentTab === "Return"
                        ? CustomerCompleteLedgerColumns.filter(
                            (cl) =>
                              cl.id !== "cr" &&
                              // cl.id !== "price" &&
                              cl.id !== "desc"
                          )
                        : CustomerCompleteLedgerColumns.filter(
                            (cl) =>
                              cl.id !== "cr" &&
                              cl.id !== "qty" &&
                              cl.id !== "article_name" &&
                              cl.id !== "article_size" &&
                              cl.id !== "price" &&
                              cl.id !== "name"
                          )
                    }
                  />
                  <div className="grid grid-cols-3 gap-4 my-4">
                    <FigureCard
                      title={"Total"}
                      value={`Rs ${Number(
                        SelectedCustomer.total
                      ).toLocaleString("en-PK")}`}
                    />
                    <FigureCard
                      title={"Return"}
                      value={`Rs ${Number(
                        SelectedCustomer.return_amount
                      ).toLocaleString("en-PK")}`}
                      textColor={"text-[red]"}
                    />
                    <FigureCard
                      title={"Discount"}
                      value={`Rs ${Number(
                        SelectedCustomer.discount
                      ).toLocaleString("en-PK")}`}
                      textColor={"text-[red]"}
                    />
                    <FigureCard
                      title={"Opening Balance"}
                      value={`Rs ${Number(
                        SelectedCustomer.opening_balance
                      ).toLocaleString("en-PK")}`}
                      textColor={"text-[green]"}
                    />
                    <FigureCard
                      title={"Paid"}
                      value={`Rs ${Number(SelectedCustomer.paid).toLocaleString(
                        "en-PK"
                      )}`}
                      textColor={"text-[green]"}
                    />
                    <FigureCard
                      title={"Remaining"}
                      value={`Rs ${Number(
                        SelectedCustomer.remaining
                      ).toLocaleString("en-PK")}`}
                      textColor={"text-[red]"}
                    />
                  </div>
                  {/* <PrintButton
                    onClick={() => {
                      navigate(
                        "/admin/customer-item-summary/" + SelectedCustomer._id
                      );
                    }}
                    title="Customers Report"
                  />
                  <ExportToExcelButton
                    data={CustomerItemSummaryState.data.data}
                    fileName={"Item Summary"}
                  />
                  <div className="w-full mb-10">
                    <div className="flex w-full mt-3 rounded-xl overflow-hidden bg-gray-200 border-2 border-main">
                      {["All", "SH"].map((tb) => {
                        return (
                          <div
                            className={`text-center py-3 font-bold transition-all ease-in-out duration-700 cursor-pointer w-full font-quicksand  ${
                              CurrentSummaryTab === tb
                                ? "bg-main text-white"
                                : "text-black"
                            } `}
                            onClick={() => {
                              setCurrentSummaryTab(tb);
                            }}
                          >
                            {tb}
                          </div>
                        );
                      })}
                    </div>
                    <div className="bg-main text-white text-center font-bold py-4 border-2 rounded-t-lg border-sec2 border-b-0 text-xl uppercase">
                      Item Summary
                    </div>
                    <ItemSummaryTable
                      AllRows={
                        CustomerItemSummaryState?.data?.data &&
                        CurrentSummaryTab === "All"
                          ? CustomerItemSummaryState?.data?.data
                          : CustomerItemSummaryState?.data?.data &&
                            CurrentSummaryTab === "SH"
                          ? CustomerItemSummaryState?.data?.shdata
                          : [{}]
                      }
                      Columns={CustomerItemSummaryColumns}
                    />
                    <div className="grid grid-cols-2 gap-4 my-4">
                      <FigureCard
                        title={"Box Qty"}
                        value={
                          CustomerItemSummaryState?.data?.data
                            ? `${Number(
                                CustomerItemSummaryState?.data?.data
                                  .filter((dt) => dt.type === "Box")
                                  .reduce((acc, dt) => {
                                    console.log(dt.name);
                                    if (dt.name !== "SHOPPING IRSHAD")
                                      return acc + dt.qty;
                                    else return acc + 1;
                                  }, 0)
                              ).toLocaleString("en-PK")}`
                            : 0
                        }
                      />
                      <FigureCard
                        title={"SHOPPING Qty"}
                        value={
                          CustomerItemSummaryState?.data?.data
                            ? `${Number(
                                CustomerItemSummaryState?.data?.data
                                  .filter((dt) => dt.type === "SH")
                                  .reduce((acc, dt) => {
                                    console.log(dt.name);
                                    if (dt.name !== "SHOPPING IRSHAD")
                                      return acc + dt.qty;
                                    else return acc + 1;
                                  }, 0)
                              ).toLocaleString("en-PK")}`
                            : 0
                        }
                        textColor={"text-[red]"}
                      />
                    </div>
                  </div> */}
                </>
              )
            )}
          </div>
        )}
        {NewCurrentTab === 1 && (
          <div className="flex flex-col w-full gap-y-5">
            <SupplierSelector
              SelectedSupplier={SelectedSupplier}
              setSelectedSupplier={setSelectedSupplier}
            />
            {SelectedSupplier && (
              <div className="flex justify-end gap-x-2">
                <PrintButton
                  onClick={() => {
                    navigate(
                      basePath + "/company-ledger-report/" + SelectedSupplier._id
                    );
                  }}
                  title="Supplier Report"
                />
                <ExportToExcelButton
                  data={
                    CurrentTab === "All"
                      ? SupplierLedgers?.data?.all
                      : CurrentTab === "Item"
                      ? SupplierLedgers.data.item
                      : SupplierLedgers.data.cash
                  }
                  fileName={"Supplier Ledger"}
                />
              </div>
            )}
            {SupplierLedgers.loading ? (
              <div className="flex flex-1 justify-center items-center">
                <FetchingLoading />
              </div>
            ) : (
              SupplierLedgers.data.length !== 0 &&
              SelectedSupplier && (
                <>
                  <div className="mt-3 flex w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    {["All", "Item", "Cash"].map((tb) => {
                      return (
                        <div
                          key={tb}
                          className={`w-full cursor-pointer py-3 text-center text-sm font-semibold transition ${
                            CurrentTab === tb
                              ? "bg-slate-900 text-white"
                              : "text-slate-700 hover:bg-slate-200/70"
                          } `}
                          onClick={() => {
                            setCurrentTab(tb);
                          }}
                        >
                          {tb}
                        </div>
                      );
                    })}
                  </div>

                  <SearchableTable
                    isLedger={true}
                    SearchPlaceholder={""}
                    CurrentData={
                      CurrentTab === "All"
                        ? SupplierLedgers?.data?.all
                        : CurrentTab === "Item"
                        ? SupplierLedgers.data.item
                        : SupplierLedgers.data.cash
                    }
                    Columns={
                      CurrentTab === "All"
                        ? CompanyCompleteLedgerColumns
                        : CurrentTab === "Item"
                        ? CompanyCompleteLedgerColumns.filter(
                            (dt) => dt.id !== "desc" && dt.id !== "dr"
                          )
                        : CompanyCompleteLedgerColumns.filter(
                            (dt) =>
                              dt.id !== "name" &&
                              dt.id !== "qty" &&
                              dt.id !== "price" &&
                              dt.id !== "cr"
                          )
                    }
                  />
                  <div className="grid grid-cols-3 gap-4 my-4">
                    <FigureCard
                      title={"Total"}
                      value={`Rs ${Number(
                        SelectedSupplier.total
                      ).toLocaleString("en-PK")}`}
                    />
                    <FigureCard
                      title={"Opening Balance"}
                      value={`Rs ${Number(
                        SelectedSupplier.opening_balance
                      ).toLocaleString("en-PK")}`}
                    />
                    <FigureCard
                      title={"Paid"}
                      value={`Rs ${Number(SelectedSupplier.paid).toLocaleString(
                        "en-PK"
                      )}`}
                      textColor={"text-[green]"}
                    />
                    <FigureCard
                      title={"Remaining"}
                      value={`Rs ${Number(
                        SelectedSupplier.remaining
                      ).toLocaleString("en-PK")}`}
                      textColor={"text-[red]"}
                    />
                  </div>

                  <PrintButton
                    onClick={() => {
                      navigate(
                        basePath + "/company-item-summary/" + SelectedSupplier._id
                      );
                    }}
                    title="Item Summary"
                  />
                  <ExportToExcelButton
                    data={SupplierLedgers.data.all}
                    fileName={"Item Summary"}
                  />

                  {/* <div className="w-full mb-10">
                    <div className="bg-main text-white text-center font-bold py-4 border-2 rounded-t-lg border-sec2 border-b-0 text-xl uppercase">
                      Item Summary
                    </div>
                    <ItemS ummaryTable
                      AllRows={CompanyItemSummaryState.data}
                      Columns={CustomerItemSummaryColumns}
                    />
                  </div> */}
                </>
              )
            )}
          </div>
        )}
      </div>
    </BodyWrapper>
  );
};

export default Ledger;
