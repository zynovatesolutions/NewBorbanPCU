import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRawMaterials } from "../../store/Slices/RawMaterialSlice";
import SelectPopover, { SelectOption } from "./SelectPopover";
import CreateRawMaterialModal from "../Modals/CreateRawMaterialModal";

const RawMaterialSelector = ({ SelectedRM, setSelectedRM }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [SearchText, setSearchText] = useState("");
  const [OpenCreate, setOpenCreate] = useState(false);
  const dispatch = useDispatch();
  const RMState = useSelector((state) => state.RawMaterialState);
  const open = Boolean(anchorEl);

  useEffect(() => {
    dispatch(fetchRawMaterials());
  }, [dispatch]);

  const options = useMemo(() => RMState?.data ?? [], [RMState?.data]);

  const filtered = useMemo(() => {
    const q = SearchText.trim().toLowerCase();
    if (!q) return options;
    return options.filter((a) => (a?.name ?? "").toLowerCase().includes(q));
  }, [options, SearchText]);

  return (
    <>
      <SelectPopover
        label="Raw Material"
        placeholder="Select Raw Material"
        valueLabel={SelectedRM?.name}
        open={open}
        anchorEl={anchorEl}
        onOpen={(e) => setAnchorEl(e.currentTarget)}
        onClose={() => setAnchorEl(null)}
        popoverId="rm-selector"
      >
        <input
          type="text"
          placeholder="Search raw materials..."
          value={SearchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
        />
        <button
          type="button"
          className="mb-2 w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-slate-900 hover:bg-slate-50"
          onClick={() => {
            setAnchorEl(null);
            setOpenCreate(true);
          }}
        >
          + Add Raw Material
        </button>
        <div className="max-h-[40vh] space-y-1 overflow-y-auto">
          {RMState?.loading ? (
            <div className="px-3 py-4 text-center text-sm text-slate-500">
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-slate-500">
              No raw materials yet. Use “+ Add Raw Material” above.
            </div>
          ) : (
            filtered.map((dt) => (
              <SelectOption
                key={dt._id}
                selected={SelectedRM?._id === dt._id}
                onClick={() => {
                  setSelectedRM(dt);
                  setAnchorEl(null);
                }}
              >
                {dt.name}
              </SelectOption>
            ))
          )}
        </div>
      </SelectPopover>

      {OpenCreate && (
        <CreateRawMaterialModal
          openModal={OpenCreate}
          setOpenModal={setOpenCreate}
          onCreated={(rm) => {
            if (rm) setSelectedRM(rm);
          }}
        />
      )}
    </>
  );
};

export default RawMaterialSelector;
