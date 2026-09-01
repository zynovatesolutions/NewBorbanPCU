import React, { useEffect, useState } from "react";
import AddFixedAssetModal from "../../../components/Modals/AddFixedAssetModal";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";
import Header from "../../../components/Header/Header";
import CustomBtn from "../../../components/Buttons/CustomBtn";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDeletedFixedAssets,
  fetchFixedAssets,
} from "../../../store/Slices/FixedAssetSlice";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import SearchableTable from "../../../components/Tables/SearchableTable";
import { FixedAssetsColumns } from "../../../assets/Columns";
import EditFixedAssetModal from "../../../components/Modals/EditFixedAssetModal";
import DeleteModal from "../../../components/Modals/DeleteModal";
import { DeleteFixedAssetsApi } from "../../../ApiRequests";
import { ErrorToast, SuccessToast } from "../../../utils/ShowToast";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const FixedAssets = () => {
  const [assets, setAssets] = useState([]); // Placeholder for assets data
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [deleteAsset, setDeleteAsset] = useState(null);
  const [SearchText, setSearchText] = useState("");
  const [OpenEditModal, setOpenEditModal] = useState(false);
  const [OpenDeleteModal, setOpenDeleteModal] = useState(false);
  const [Selected, setSelected] = useState("");
  const [Loading, setLoading] = useState(false);
  const [CurrentTab, setCurrentTab] = useState("Available");

  const dispatch = useDispatch();
  const FixedAssetState = useSelector((state) => state.FixedAssetState);

  let Mounted = false;

  useEffect(() => {
    dispatch(fetchFixedAssets());
    dispatch(fetchDeletedFixedAssets());
  }, [dispatch]);

  return (
    <BodyWrapper>
      <Header title="Fixed Assets" desc="Overview of your fixed assets">
        <CustomBtn
          title={"Add Fixed Asset"}
          onClick={() => {
            setShowAddModal(true);
          }}
        />
      </Header>

      <div className="w-full mt-10 flex flex-col items-center">
        {FixedAssetState.loading ? (
          <div className="flex flex-1 justify-center items-center">
            <FetchingLoading />
          </div>
        ) : (
          (FixedAssetState.data.length !== 0 ||
            FixedAssetState.deleted.length !== 0) && (
            <div className="w-full max-w-7xl">
              <div className="">
                <div className="mb-6 flex w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  {["Available", "Deleted"].map((tb) => {
                    return (
                      <button
                        key={tb}
                        type="button"
                        className={`w-full py-3 text-center text-sm font-semibold transition ${
                          CurrentTab === tb
                            ? "bg-slate-900 text-white"
                            : "text-slate-700 hover:bg-white"
                        } `}
                        onClick={() => {
                          setCurrentTab(tb);
                        }}
                      >
                        {tb}
                      </button>
                    );
                  })}
                </div>
              </div>
              <SearchableTable
                setOpenEditModal={setOpenEditModal}
                setOpenDeleteModal={setOpenDeleteModal}
                setSelected={setSelected}
                SearchPlaceholder={"Search Customer Name..."}
                SearchText={SearchText}
                setSearchText={setSearchText}
                CurrentData={
                  CurrentTab === "Available"
                    ? FixedAssetState.data.filter((dt) => {
                        const searchMatch =
                          SearchText === "" ||
                          dt.name
                            .toLowerCase()
                            .startsWith(SearchText.toLowerCase());
                        return searchMatch;
                      })
                    : CurrentTab === "Deleted" &&
                      FixedAssetState.deleted.filter((dt) => {
                        const searchMatch =
                          SearchText === "" ||
                          dt.name
                            .toLowerCase()
                            .startsWith(SearchText.toLowerCase());
                        return searchMatch;
                      })
                }
                Columns={
                  CurrentTab === "Available"
                    ? FixedAssetsColumns
                    : CurrentTab === "Deleted" &&
                      FixedAssetsColumns.filter((col) => col.id !== "actions")
                }
              />
            </div>
          )
        )}
      </div>

      {showAddModal && (
        <AddFixedAssetModal
          openModal={showAddModal}
          setOpenModal={setShowAddModal}
        />
      )}
      {OpenEditModal && (
        <EditFixedAssetModal
          openModal={OpenEditModal}
          setOpenModal={setOpenEditModal}
          currentFixedAsset={Selected}
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
              const response = await DeleteFixedAssetsApi(Selected._id);
              if (response.data.success) {
                setOpenDeleteModal(false);
                SuccessToast("Fixed Asset deleted successfully");
                dispatch(fetchFixedAssets());
      dispatch(fetchDeletedFixedAssets());
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

export default FixedAssets;
