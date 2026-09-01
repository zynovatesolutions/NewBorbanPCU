import React, { useEffect, useState } from "react";
import ArticleSelector from "../../../components/Selector/ArticleSelector";
import Header from "../../../components/Header/Header";
import SearchableTable from "../../../components/Tables/SearchableTable";
import { useDispatch, useSelector } from "react-redux";
import { fetchArticleStats } from "../../../store/Slices/ArticleStatsSlice";
import {
  ItemStatsColumns,
  ItemStockStatsColumns,
} from "../../../assets/Columns";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import FigureCard from "../../../components/Cards/FigureCard";
import PrintButton from "../../../components/Buttons/PrintButton";
import ExportToExcelButton from "../../../utils/ExportToExcel";
import { fetchItems } from "../../../store/Slices/ItemSlice";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";

const ALL_ARTICLE = { _id: "all", name: "All" };

/**
 * Calculate total stock from stats data
 * @param {Object} stats - Article stats data
 * @returns {number} Total stock quantity
 */
const calculateTotalStock = (stats) => {
  if (!stats?.StockStats || !stats?.trans) return 0;

  const stockQty = stats.StockStats.reduce((acc, curr) => acc + curr.qty, 0);
  const transQty = stats.trans.reduce((acc, curr) => acc + curr.qty, 0);
  return stockQty + transQty;
};

const calculateTotalSoldStock = (stats) => {
  if (!stats?.trans) return 0;
  return stats.trans.reduce((acc, curr) => acc + curr.qty, 0);
};

const StatsSummary = ({ stats, SelectedArticle }) => (
  <div className="flex flex-wrap gap-3">
    <FigureCard
      title="Total Stock"
      value={stats
        .filter((dt) => {
          return SelectedArticle.name === "All"
            ? true
            : dt.articleId?._id
                ?.toLowerCase()
                ?.startsWith(SelectedArticle._id.toLowerCase());
        })
        .reduce((acc, item) => acc + item.in_qty, 0)
        .toLocaleString()}
    />
    <FigureCard
      title="Total Sold Stock"
      value={stats
        .filter((dt) => {
          return SelectedArticle.name === "All"
            ? true
            : dt.articleId?._id
                ?.toLowerCase()
                ?.startsWith(SelectedArticle._id.toLowerCase());
        })
        .reduce((acc, item) => acc + item.out_qty, 0)
        .toLocaleString()}
    />
    <FigureCard
      title="Total Avl. Stock"
      value={stats
        .filter((dt) => {
          return SelectedArticle.name === "All"
            ? true
            : dt.articleId?._id
                ?.toLowerCase()
                ?.startsWith(SelectedArticle._id.toLowerCase());
        })
        .reduce((acc, item) => acc + item.qty, 0)
        .toLocaleString()}
    />
  </div>
);

/**
 * Article summary page component
 * @returns {JSX.Element} ArticleSummary component
 */
const ArticleSummary = () => {
  const [selectedArticle, setSelectedArticle] = useState(ALL_ARTICLE);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selected, setSelected] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchTextTrans, setSearchTextTrans] = useState("");

  const dispatch = useDispatch();
  const articleStatsState = useSelector((state) => state.ArticleStatsState);

  let MountedStats = false;

  useEffect(() => {
    if (!MountedStats) {
      dispatch(fetchArticleStats(selectedArticle._id));
    }
    MountedStats = true;
  }, [selectedArticle, dispatch]);

  const ItemState = useSelector((state) => state.ItemState);

  let Mounted = false;

  useEffect(() => {
    if (!Mounted) {
      dispatch(fetchItems());
    }
    Mounted = true;
  }, [dispatch]);

  const renderTables = () => {
    if (articleStatsState.loading) {
      return <FetchingLoading />;
    }

    return (
      <>
        {articleStatsState?.data?.StockStats && (
          <>
            <div className="flex justify-end gap-x-2 mb-10">
              <PrintButton
                onClick={() => {
                  // navigate("/admin/items-report");
                }}
                title="Article Production Report"
              />

              <ExportToExcelButton
                data={articleStatsState.data.StockStats.filter((dt) =>
                  searchTextTrans === ""
                    ? true
                    : dt.article_name
                        .toLowerCase()
                        .startsWith(searchTextTrans.toLowerCase())
                )}
                fileName={"Article Production Report"}
              />
            </div>
            <SearchableTable
              setOpenEditModal={setOpenEditModal}
              setOpenDeleteModal={setOpenDeleteModal}
              setSelected={setSelected}
              SearchPlaceholder="Search Article..."
              SearchText={searchText}
              setSearchText={setSearchText}
              CurrentData={articleStatsState.data.StockStats.filter((dt) =>
                searchText === ""
                  ? true
                  : dt.article_name
                      .toLowerCase()
                      .startsWith(searchText.toLowerCase())
              )}
              Columns={ItemStockStatsColumns}
            />
          </>
        )}
        {articleStatsState?.data?.trans && (
          <>
            <div className="flex justify-end gap-x-2 mb-10">
              <PrintButton
                onClick={() => {
                  // navigate("/admin/items-report");
                }}
                title="Article Sale Report"
              />

              <ExportToExcelButton
                data={articleStatsState.data.trans.filter((dt) =>
                  searchTextTrans === ""
                    ? true
                    : dt.article_name
                        .toLowerCase()
                        .startsWith(searchTextTrans.toLowerCase())
                )}
                fileName={"Article Sale Report"}
              />
            </div>
            <SearchableTable
              setOpenEditModal={setOpenEditModal}
              setOpenDeleteModal={setOpenDeleteModal}
              setSelected={setSelected}
              SearchPlaceholder="Search Article..."
              SearchText={searchTextTrans}
              setSearchText={setSearchTextTrans}
              CurrentData={articleStatsState.data.trans.filter((dt) =>
                searchTextTrans === ""
                  ? true
                  : dt.article_name
                      .toLowerCase()
                      .startsWith(searchTextTrans.toLowerCase())
              )}
              Columns={ItemStatsColumns}
            />
          </>
        )}
      </>
    );
  };

  return (
    <BodyWrapper>
      <Header
        title="Article Summary"
        desc="Manage your articles summary efficiently"
      />
      <div className="mb-8 flex w-full flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <StatsSummary
          stats={ItemState?.data}
          SelectedArticle={selectedArticle}
        />
        <div className="w-full max-w-[320px]">
          <ArticleSelector
            SelectedArticle={selectedArticle}
            setSelectedArticle={setSelectedArticle}
            Stats={true}
          />
        </div>
      </div>
      {renderTables()}
    </BodyWrapper>
  );
};

export default ArticleSummary;
