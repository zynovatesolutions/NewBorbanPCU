import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchItems } from "../../store/Slices/ItemSlice";
import SelectPopover, { SelectOption } from "./SelectPopover";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const SizeSelector = ({ SelectedSize, setSelectedSize, SelectedArticle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [SearchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const ItemState = useSelector((state) => state.ItemState);
  const open = Boolean(anchorEl);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const list = ItemState?.data ?? [];
    return list.filter((dt) => {
      const matchesArticleId = dt?.articleId?._id === SelectedArticle?._id;
      const matchesSearchSize =
        SearchText === "" ||
        (dt.size ?? "").toLowerCase().includes(SearchText.toLowerCase());
      return matchesArticleId && matchesSearchSize;
    });
  }, [ItemState?.data, SelectedArticle?._id, SearchText]);

  return (
    <SelectPopover
      label="Size"
      placeholder="Select Size"
      valueLabel={SelectedSize?.size}
      open={open}
      anchorEl={anchorEl}
      onOpen={(e) => setAnchorEl(e.currentTarget)}
      onClose={() => setAnchorEl(null)}
      popoverId="size-selector"
    >
      <input
        type="text"
        placeholder="Search sizes..."
        value={SearchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
      />
      <div className="max-h-[40vh] space-y-1 overflow-y-auto">
        {!SelectedArticle?._id ? (
          <div className="px-3 py-4 text-center text-sm text-slate-500">
            Select an article first
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-slate-500">
            No sizes found
          </div>
        ) : (
          filtered.map((dt) => (
            <SelectOption
              key={dt._id}
              selected={SelectedSize?._id === dt._id}
              onClick={() => {
                setSelectedSize(dt);
                setAnchorEl(null);
              }}
            >
              {dt.size}
            </SelectOption>
          ))
        )}
      </div>
    </SelectPopover>
  );
};

export default SizeSelector;
