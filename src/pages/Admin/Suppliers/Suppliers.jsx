import React, { useState, useEffect, useMemo } from "react";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";
import Header from "../../../components/Header/Header";
import SearchableTable from "../../../components/Tables/SearchableTable";
import CustomBtn from "../../../components/Buttons/CustomBtn";
import { useDispatch, useSelector } from "react-redux";
import { fetchSuppliers } from "../../../store/Slices/SupplierSlice";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../../components/Modals/DeleteModal";
import { DeleteCompanyApi } from "../../../ApiRequests";
import { ErrorToast, SuccessToast } from "../../../utils/ShowToast";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import ExportToExcelButton from "../../../utils/ExportToExcel";
import PrintButton from "../../../components/Buttons/PrintButton";
import { SupplierColumns } from "../../../assets/Columns";
import EditCompany from "../../../components/Modals/EditCompany";
import CreateCompany from "../../../components/Modals/CreateCompany";

const Suppliers = () => {
  const [SearchText, setSearchText] = useState("");
  const [OpenModal, setOpenModal] = useState(false);
  const [OpenInvoiceModal, setOpenInvoiceModal] = useState(false);
  const [OpenEditModal, setOpenEditModal] = useState(false);
  const [OpenDeleteModal, setOpenDeleteModal] = useState(false);
  const [Selected, setSelected] = useState("");
  const [Loading, setLoading] = useState(false);

  const [OpenOpeningBalance, setOpenOpeningBalance] = useState(false);

  const navigate = useNavigate();

  const dispatch = useDispatch();
  const SupplierState = useSelector((state) => state.SupplierState);

  let Mounted = false;

  useEffect(() => {
    if (!Mounted) {
      dispatch(fetchSuppliers());
    }
    Mounted = true;
  }, [dispatch]);

  const summary = useMemo(() => {
    if (!SupplierState.data || SupplierState.data.length === 0) {
      return {
        total: 0,
        receivable: 0,
        received: 0,
      };
    }

    return SupplierState.data.reduce(
      (acc, supplier) => ({
        total: acc.total + (supplier.total || 0),
        paid: acc.paid + (supplier.paid || 0),
        remaining: acc.remaining + (supplier.remaining || 0),
      }),
      {
        total: 0,
        paid: 0,
        remaining: 0,
      }
    );
  }, [SupplierState.data]);

  return (
    <BodyWrapper>
      <Header title="Suppliers" desc="Overview of your supplier management">
        <PrintButton
          onClick={() => {
            navigate("/admin/suppliers-report");
          }}
          title="Suppliers Report"
        />
        <ExportToExcelButton
          data={SupplierState.data
            .filter((dt) =>
              SearchText === ""
                ? true
                : dt.name.toLowerCase().startsWith(SearchText.toLowerCase())
            )
            .map((dt) => {
              return {
                name: dt.name,
                opening_balance: dt.opening_balance,
                total: dt.total,
                paid: dt.paid,
                remaining: dt.remaining,
              };
            })}
          fileName={"SupplierState"}
        />
        <CustomBtn
          title={"Add New Supplier"}
          onClick={() => {
            setOpenModal(true);
          }}
        />
      </Header>
      <div className="flex w-full flex-col items-center">
        {SupplierState.loading ? (
          <div className="flex flex-1 justify-center items-center">
            <FetchingLoading />
          </div>
        ) : (
          SupplierState.data.length !== 0 && (
            <div className="w-full max-w-7xl">
              <SearchableTable
                setOpenEditModal={setOpenEditModal}
                setOpenDeleteModal={setOpenDeleteModal}
                setSelected={setSelected}
                SearchPlaceholder={"Search Supplier Name..."}
                SearchText={SearchText}
                setSearchText={setSearchText}
                CurrentData={SupplierState.data.filter((dt) =>
                  SearchText === ""
                    ? true
                    : dt.name.toLowerCase().startsWith(SearchText.toLowerCase())
                )}
                Columns={SupplierColumns.filter((dt) => dt.id !== "branchId")}
              />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-slate-500">
                    Total Amount
                  </h3>
                  <p className="text-2xl font-bold text-slate-800">
                    Rs {summary.total.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-slate-500">
                    Total Paid
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    Rs {summary.paid.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-medium text-slate-500">
                    Total Payable
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
      {OpenModal && <CreateCompany Open={OpenModal} setOpen={setOpenModal} />}

      {OpenEditModal && (
        <EditCompany
          open={OpenEditModal}
          setOpen={setOpenEditModal}
          currentSupplier={Selected}
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
              const response = await DeleteCompanyApi(Selected._id);
              if (response.data.success) {
                setOpenDeleteModal(false);
                SuccessToast("Supplier delete successfully");
                dispatch(fetchSuppliers());
              } else {
                ErrorToast(response.data.error?.msg);
              }
            } catch (err) {
              ErrorToast(
                err.response.data.error.msg || "Failed to delete supplier!"
              );
            }
            setLoading(false);
          }}
        />
      )}
    </BodyWrapper>
  );
};

export default Suppliers;
