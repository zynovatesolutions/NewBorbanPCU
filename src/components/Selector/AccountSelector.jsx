import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAccountsAmount } from "../../store/Slices/AccountSlice";
import SelectPopover, { SelectOption } from "./SelectPopover";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

const AccountSelector = ({ activeTab, setActiveTab }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [SearchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const AccountState = useSelector((state) => state.AccountState);
  const open = Boolean(anchorEl);

  useEffect(() => {
    dispatch(fetchAccountsAmount());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const list = AccountState?.data ?? [];
    const q = SearchText.trim().toLowerCase();
    if (!q) return list;
    return list.filter((a) =>
      (a?.account_name ?? "").toLowerCase().includes(q)
    );
  }, [AccountState?.data, SearchText]);

  return (
    <SelectPopover
      label="Account"
      placeholder="Select Account"
      valueLabel={activeTab?.account_name}
      open={open}
      anchorEl={anchorEl}
      onOpen={(e) => setAnchorEl(e.currentTarget)}
      onClose={() => setAnchorEl(null)}
      popoverId="account-selector"
    >
      <input
        type="text"
        placeholder="Search accounts..."
        value={SearchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
      />
      <div className="max-h-[40vh] space-y-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-center text-sm text-slate-500">
            No accounts found
          </div>
        ) : (
          filtered.map((tab) => (
            <SelectOption
              key={tab._id}
              selected={activeTab?._id === tab._id}
              onClick={() => {
                setActiveTab(tab);
                setAnchorEl(null);
              }}
            >
              {tab.account_name}
            </SelectOption>
          ))
        )}
      </div>
    </SelectPopover>
  );
};

export default AccountSelector;
