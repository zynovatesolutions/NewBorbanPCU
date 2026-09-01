import React, { useEffect, useMemo, useState } from "react";
import { fetchItems } from "../../../store/Slices/ItemSlice";
import { useDispatch, useSelector } from "react-redux";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";
import Header from "../../../components/Header/Header";
import CustomBtn from "../../../components/Buttons/CustomBtn";
import PrintButton from "../../../components/Buttons/PrintButton";
import ExportToExcelButton from "../../../utils/ExportToExcel";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import SearchableTable from "../../../components/Tables/SearchableTable";
import { ArticleColumns, ItemColumns, RawMaterialColumns } from "../../../assets/Columns";
import CreateItemModal from "../../../components/Modals/CreateItemModal";
import EditItemModal from "../../../components/Modals/EditItemModal";
import { useNavigate } from "react-router-dom";
import CustomTabs from "../../../components/Tabs/CustomTabs";
import { fetchArticles } from "../../../store/Slices/ArticleSlice";
import { fetchRawMaterials } from "../../../store/Slices/RawMaterialSlice";
import CreateArticleModal from "../../../components/Modals/CreateArticleModal";
import EditArticleModal from "../../../components/Modals/EditArticleModal";
import CreateRawMaterialModal from "../../../components/Modals/CreateRawMaterialModal";
import EditRawMaterialModal from "../../../components/Modals/EditRawMaterialModal";
import DeleteModal from "../../../components/Modals/DeleteModal";
import {
  DeleteArticleApi,
  DeleteItemApi,
  DeleteRawMaterialApi,
} from "../../../ApiRequests";
import { ErrorToast, SuccessToast } from "../../../utils/ShowToast";
import { Popover } from "@mui/material";
import { FiFilter } from "react-icons/fi";

const Items = () => {
  const [SearchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [OpenModal, setOpenModal] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [OpenEditModal, setOpenEditModal] = useState(false);
  const [OpenDeleteModal, setOpenDeleteModal] = useState(false);
  const [Selected, setSelected] = useState({});
  const [stockFilter, setStockFilter] = useState("all"); // all | in | out
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const ItemState = useSelector((state) => state.ItemState);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  let Mounted = false;

  useEffect(() => {
    if (!Mounted) {
      dispatch(fetchItems());
    }
    Mounted = true;
  }, [activeTab, dispatch]);

  const ArticleState = useSelector((state) => state.ArticleState);
  const RawMaterialState = useSelector((state) => state.RawMaterialState);

  let MountedArticles = false;

  useEffect(() => {
    if (!MountedArticles) {
      dispatch(fetchArticles());
      dispatch(fetchRawMaterials());
    }
    MountedArticles = true;
  }, [activeTab, dispatch]);

  const filteredItems = useMemo(() => {
    const rows = ItemState?.data ?? [];
    const q = SearchText.trim().toLowerCase();

    let next = rows.filter((dt) => {
      if (!q) return true;
      return (dt?.article_name ?? "").toLowerCase().startsWith(q);
    });

    if (stockFilter === "in") {
      next = next.filter((dt) => Number(dt?.qty ?? 0) > 0);
    } else if (stockFilter === "out") {
      next = next.filter((dt) => Number(dt?.qty ?? 0) <= 0);
    }

    return next;
  }, [ItemState?.data, SearchText, stockFilter]);

  const stockCounts = useMemo(() => {
    const rows = ItemState?.data ?? [];
    let inStock = 0;
    let outStock = 0;
    for (const r of rows) {
      if (Number(r?.qty ?? 0) > 0) inStock += 1;
      else outStock += 1;
    }
    return { total: rows.length, inStock, outStock };
  }, [ItemState?.data]);

  const filterPopoverOpen = Boolean(filterAnchorEl);
  const filterPopoverId = filterPopoverOpen ? "items-filter-popover" : undefined;

  return (
    <BodyWrapper>
      <Header title="Items" desc="Overview of your items management">
        <CustomBtn
          title={"Summary"}
          onClick={() => {
            navigate("/admin/article-summary");
          }}
        />
        {activeTab === 0 && (
          <CustomBtn
            title={"Add New Item"}
            onClick={() => {
              setOpenModal(true);
            }}
          />
        )}
        {activeTab === 1 && (
          <CustomBtn
            title={"Add New Article"}
            onClick={() => {
              setOpenModal(true);
            }}
          />
        )}
        {activeTab === 2 && (
          <CustomBtn
            title={"Add Raw Material"}
            onClick={() => {
              setOpenModal(true);
            }}
          />
        )}
      </Header>
      <CustomTabs
        tabs={[
          { label: "Items" },
          { label: "Articles" },
          { label: "Raw Materials" },
        ]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="flex justify-end gap-x-2">
        <PrintButton
          onClick={() => {
            navigate("/admin/items-report");
          }}
          title="Items Report"
        />

        {activeTab === 0 && (
          <>
            <button
              type="button"
              aria-describedby={filterPopoverId}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              className="h-[40px] px-4 rounded-full border border-black bg-white text-black font-bold flex items-center gap-2 hover:bg-black hover:text-white transition"
            >
              <FiFilter />
              {stockFilter === "all"
                ? "All items"
                : stockFilter === "in"
                  ? "In stock"
                  : "Out of stock"}
            </button>

            <Popover
              id={filterPopoverId}
              open={filterPopoverOpen}
              anchorEl={filterAnchorEl}
              onClose={() => setFilterAnchorEl(null)}
              PaperProps={{
                sx: {
                  borderRadius: "14px",
                  overflow: "hidden",
                  minWidth: 220,
                  boxShadow:
                    "0 18px 55px rgba(0,0,0,0.18), 0 8px 20px rgba(0,0,0,0.10)",
                },
              }}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <div className="bg-white p-3">
                <div className="text-[12px] font-bold text-black/60 uppercase tracking-wide px-1 pb-2">
                  Filter
                </div>

                <div className="flex flex-col gap-1">
                  {[
                    {
                      id: "all",
                      label: `All items (${stockCounts.total})`,
                    },
                    {
                      id: "in",
                      label: `In stock (${stockCounts.inStock})`,
                    },
                    {
                      id: "out",
                      label: `Out of stock (${stockCounts.outStock})`,
                    },
                  ].map((opt) => {
                    const selected = stockFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setStockFilter(opt.id);
                          setFilterAnchorEl(null);
                        }}
                        className={[
                          "w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition",
                          selected
                            ? "bg-black text-white"
                            : "text-black hover:bg-black/5",
                        ].join(" ")}
                      >
                        {opt.label}
                      </button>
                    );
                  })}

                  {stockFilter !== "all" && (
                    <button
                      type="button"
                      onClick={() => {
                        setStockFilter("all");
                        setFilterAnchorEl(null);
                      }}
                      className="mt-1 w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-black/60 hover:bg-black/5 transition"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </div>
            </Popover>
          </>
        )}

        <ExportToExcelButton
          data={filteredItems.map((dt) => {
            return {
              size: dt.size,
              article_name: dt.article_name,
              in_qty: dt.in_qty,
              out_qty: dt.out_qty,
              qty: dt.qty,
            };
          })}
          fileName={"Items"}
        />
      </div>

      <div className="w-full mt-10 flex flex-col items-center">
        {ItemState.loading && activeTab === 0 ? (
          <div className="flex flex-1 justify-center items-center border-none">
            <FetchingLoading />
          </div>
        ) : (
          ItemState.data.length !== 0 &&
          activeTab === 0 && (
            <div className="w-full max-w-7xl">
              <SearchableTable
                setOpenEditModal={setOpenEditModal}
                setOpenDeleteModal={setOpenDeleteModal}
                setSelected={setSelected}
                SearchPlaceholder={"Search Product Name..."}
                SearchText={SearchText}
                setSearchText={setSearchText}
                CurrentData={filteredItems}
                Columns={
                  ItemColumns.filter((dt) => dt.id !== "branchId")
                }
              />
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md border-[2px] border-black">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total In-Quantity
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {ItemState.data
                      .reduce((acc, item) => acc + item.in_qty, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md border-[2px] border-black">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Out-Quantity
                  </h3>
                  <p className="text-2xl font-bold text-red-600">
                    {ItemState.data
                      .reduce((acc, item) => acc + item.out_qty, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md border-[2px] border-black">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Quantity
                  </h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {ItemState.data
                      .reduce((acc, item) => acc + item.qty, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )
        )}

        {OpenModal && activeTab === 0 && (
          <CreateItemModal openModal={OpenModal} setOpenModal={setOpenModal} />
        )}
        {OpenEditModal && activeTab === 0 && (
          <EditItemModal
            openModal={OpenEditModal}
            setOpenModal={setOpenEditModal}
            itemData={Selected}
          />
        )}
        {OpenDeleteModal && activeTab === 0 && (
          <DeleteModal
            Open={OpenDeleteModal}
            setOpen={setOpenDeleteModal}
            Loading={Loading}
            onSubmit={async () => {
              setLoading(true);
              try {
                const response = await DeleteItemApi(Selected._id);
                if (response.data.success) {
                  setOpenDeleteModal(false);
                  SuccessToast("Item deleted successfully");
                  dispatch(fetchItems());
                } else {
                  ErrorToast(response.data.error?.msg);
                }
              } catch (err) {
                ErrorToast(
                  err.response?.data?.error?.msg || "Failed to delete item!"
                );
              }
              setLoading(false);
            }}
          />
        )}
      </div>
      <div className="w-full mt-10 flex flex-col items-center">
        {ArticleState.loading && activeTab === 1 ? (
          <div className="flex flex-1 justify-center items-center border-none">
            <FetchingLoading />
          </div>
        ) : (
          ArticleState.data.length !== 0 &&
          activeTab === 1 && (
            <div className="w-full max-w-7xl">
              <SearchableTable
                setOpenEditModal={setOpenEditModal}
                setOpenDeleteModal={setOpenDeleteModal}
                setSelected={setSelected}
                SearchPlaceholder={"Search Product Name..."}
                SearchText={SearchText}
                setSearchText={setSearchText}
                CurrentData={ArticleState.data.filter((dt) =>
                  SearchText === ""
                    ? true
                    : dt.name.toLowerCase().startsWith(SearchText.toLowerCase())
                )}
                Columns={ArticleColumns}
              />
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md border-[2px] border-black">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total In-Quantity
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {ItemState.data
                      .reduce((acc, item) => acc + item.in_qty, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md border-[2px] border-black">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Out-Quantity
                  </h3>
                  <p className="text-2xl font-bold text-red-600">
                    {ItemState.data
                      .reduce((acc, item) => acc + item.out_qty, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md border-[2px] border-black">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Quantity
                  </h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {ItemState.data
                      .reduce((acc, item) => acc + item.qty, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )
        )}

        {OpenModal && activeTab === 1 && (
          <CreateArticleModal
            openModal={OpenModal}
            setOpenModal={setOpenModal}
          />
        )}
        {OpenEditModal && activeTab === 1 && (
          <EditArticleModal
            openModal={OpenEditModal}
            setOpenModal={setOpenEditModal}
            selectedArticle={Selected}
          />
        )}

        {OpenDeleteModal && activeTab === 1 && (
          <DeleteModal
            Open={OpenDeleteModal}
            setOpen={setOpenDeleteModal}
            Loading={Loading}
            onSubmit={async () => {
              setLoading(true);
              try {
                const response = await DeleteArticleApi(Selected._id);
                if (response.data.success) {
                  setOpenDeleteModal(false);
                  SuccessToast("Artcle delete successfully");
                  dispatch(fetchArticles());
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
      </div>

      <div className="w-full mt-10 flex flex-col items-center">
        {RawMaterialState.loading && activeTab === 2 ? (
          <div className="flex flex-1 justify-center items-center border-none">
            <FetchingLoading />
          </div>
        ) : (
          activeTab === 2 && (
            <div className="w-full max-w-7xl">
              <SearchableTable
                setOpenEditModal={setOpenEditModal}
                setOpenDeleteModal={setOpenDeleteModal}
                setSelected={setSelected}
                SearchPlaceholder={"Search Raw Material Name..."}
                SearchText={SearchText}
                setSearchText={setSearchText}
                CurrentData={(RawMaterialState.data || []).filter((dt) =>
                  SearchText === ""
                    ? true
                    : (dt.name || "")
                        .toLowerCase()
                        .startsWith(SearchText.toLowerCase())
                )}
                Columns={RawMaterialColumns}
              />
            </div>
          )
        )}

        {OpenModal && activeTab === 2 && (
          <CreateRawMaterialModal
            openModal={OpenModal}
            setOpenModal={setOpenModal}
          />
        )}
        {OpenEditModal && activeTab === 2 && (
          <EditRawMaterialModal
            openModal={OpenEditModal}
            setOpenModal={setOpenEditModal}
            selected={Selected}
          />
        )}
        {OpenDeleteModal && activeTab === 2 && (
          <DeleteModal
            Open={OpenDeleteModal}
            setOpen={setOpenDeleteModal}
            Loading={Loading}
            onSubmit={async () => {
              setLoading(true);
              try {
                const response = await DeleteRawMaterialApi(Selected._id);
                if (response.data.success) {
                  setOpenDeleteModal(false);
                  SuccessToast("Raw material deleted successfully");
                  dispatch(fetchRawMaterials());
                } else {
                  ErrorToast(response.data.error?.msg);
                }
              } catch (err) {
                ErrorToast(
                  err.response?.data?.error?.msg ||
                    "Failed to delete raw material!"
                );
              }
              setLoading(false);
            }}
          />
        )}
      </div>
    </BodyWrapper>
  );
};

export default Items;
