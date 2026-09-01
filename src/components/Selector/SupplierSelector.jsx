import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSuppliers } from "../../store/Slices/SupplierSlice";
import SelectPopover, { SelectOption } from "./SelectPopover";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const SupplierSelector = ({ SelectedSupplier, setSelectedSupplier }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [SearchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const SupplierState = useSelector((state) => state.SupplierState);
  const open = Boolean(anchorEl);

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const selectedSupplierName =
    SelectedSupplier &&
    typeof SelectedSupplier === "object" &&
    SelectedSupplier?.name
      ? SelectedSupplier.name
      : "";
  const selectedSupplierId =
    SelectedSupplier && typeof SelectedSupplier === "object"
      ? SelectedSupplier?._id
      : "";

  const filteredSuppliers = useMemo(() => {
    const list = SupplierState?.data ?? [];
    const q = SearchText.trim().toLowerCase();
    if (!q) return list;
    return list.filter((s) => (s?.name ?? "").toLowerCase().includes(q));
  }, [SearchText, SupplierState?.data]);

  return (
    <SelectPopover
      label="Supplier"
      placeholder="Select supplier"
      valueLabel={selectedSupplierName}
      open={open}
      anchorEl={anchorEl}
      onOpen={(e) => setAnchorEl(e.currentTarget)}
      onClose={() => setAnchorEl(null)}
      popoverId="supplier-selector"
    >
      <input
        type="text"
        placeholder="Search suppliers..."
        value={SearchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
        autoFocus
      />
      <div className="max-h-[40vh] space-y-1 overflow-y-auto">
        {SupplierState?.loading ? (
          <div className="px-3 py-4 text-center text-sm text-slate-500">
            Loading suppliers...
          </div>
        ) : SupplierState?.isError ? (
          <div className="px-3 py-4 text-center text-sm text-red-600">
            Failed to load suppliers.
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-slate-500">
            No suppliers found
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <SelectOption
              key={supplier?._id ?? supplier?.name}
              selected={selectedSupplierId === supplier?._id}
              onClick={() => {
                setSelectedSupplier(supplier);
                setAnchorEl(null);
              }}
            >
              {supplier?.name ?? ""}
            </SelectOption>
          ))
        )}
      </div>
    </SelectPopover>
  );
};

export default SupplierSelector;
