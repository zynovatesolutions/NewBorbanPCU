import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchArticles } from "../../store/Slices/ArticleSlice";
import SelectPopover, { SelectOption } from "./SelectPopover";

const ArticleSelector = ({ SelectedArticle, setSelectedArticle, Stats }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [SearchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const ArticleState = useSelector((state) => state.ArticleState);
  const open = Boolean(anchorEl);

  useEffect(() => {
    dispatch(fetchArticles());
  }, [dispatch]);

  const options = useMemo(() => {
    const list = ArticleState?.data ?? [];
    if (Stats) {
      return [{ _id: "all", name: "All" }, ...list];
    }
    return list;
  }, [ArticleState?.data, Stats]);

  const filtered = useMemo(() => {
    const q = SearchText.trim().toLowerCase();
    if (!q) return options;
    return options.filter((a) => (a?.name ?? "").toLowerCase().includes(q));
  }, [options, SearchText]);

  return (
    <SelectPopover
      label="Article"
      placeholder="Select Article"
      valueLabel={SelectedArticle?.name}
      open={open}
      anchorEl={anchorEl}
      onOpen={(e) => setAnchorEl(e.currentTarget)}
      onClose={() => setAnchorEl(null)}
      popoverId="article-selector"
    >
      <input
        type="text"
        placeholder="Search articles..."
        value={SearchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
      />
      <div className="max-h-[40vh] space-y-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-slate-500">
            No articles found
          </div>
        ) : (
          filtered.map((dt) => (
            <SelectOption
              key={dt._id}
              selected={SelectedArticle?._id === dt._id}
              onClick={() => {
                setSelectedArticle(dt);
                setAnchorEl(null);
              }}
            >
              {dt.name}
            </SelectOption>
          ))
        )}
      </div>
    </SelectPopover>
  );
};

export default ArticleSelector;
