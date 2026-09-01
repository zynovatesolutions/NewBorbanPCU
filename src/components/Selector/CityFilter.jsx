import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomers } from "../../store/Slices/CustomerSlice";
import SelectPopover, { SelectOption } from "./SelectPopover";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branchId = "";

/**
 * City filter with multiple selection.
 * Empty selection = "All cities".
 */
const CityFilter = ({
  selectedCities = [],
  onSelectionChange,
  SelectedCity,
  setSelectedCity,
}) => {
  const isMultiSelect =
    typeof onSelectionChange === "function" && Array.isArray(selectedCities);
  const [anchorEl, setAnchorEl] = useState(null);
  const [SearchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const CustomerState = useSelector((state) => state.CustomerState);
  const open = Boolean(anchorEl);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const cities = useMemo(() => {
    if (!CustomerState.data?.length) return [];
    return [
      ...new Set(
        CustomerState.data.map((dt) => dt.address).filter(Boolean)
      ),
    ];
  }, [CustomerState.data]);

  const handleSelectAll = () => {
    if (isMultiSelect) onSelectionChange([]);
    else if (setSelectedCity) setSelectedCity("All");
    setAnchorEl(null);
  };

  const handleToggleCity = (city) => {
    if (isMultiSelect) {
      const set = new Set(selectedCities);
      if (set.has(city)) set.delete(city);
      else set.add(city);
      onSelectionChange([...set]);
    } else if (setSelectedCity) {
      setSelectedCity(city);
      setAnchorEl(null);
    }
  };

  const isAllSelected = isMultiSelect
    ? selectedCities.length === 0
    : !SelectedCity || SelectedCity === "All";
  const isCitySelected = (city) =>
    isMultiSelect ? selectedCities.includes(city) : SelectedCity === city;

  const displayLabel = () => {
    if (isMultiSelect) {
      if (selectedCities.length === 0) return "All cities";
      if (selectedCities.length === 1) return selectedCities[0];
      return `${selectedCities.length} cities`;
    }
    return !SelectedCity || SelectedCity === "All"
      ? "Select City"
      : SelectedCity;
  };

  const filteredCities = cities.filter((dt) => {
    if (!SearchText) return true;
    return (dt || "").toLowerCase().includes(SearchText.toLowerCase());
  });

  return (
    <SelectPopover
      label="City"
      placeholder="Select city"
      valueLabel={displayLabel()}
      open={open}
      anchorEl={anchorEl}
      onOpen={(e) => setAnchorEl(e.currentTarget)}
      onClose={() => setAnchorEl(null)}
      popoverId="city-filter"
    >
      <input
        type="text"
        placeholder="Search city..."
        value={SearchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
        autoFocus
      />
      <div className="max-h-[40vh] space-y-1 overflow-y-auto">
        <SelectOption selected={isAllSelected} onClick={handleSelectAll}>
          All
        </SelectOption>
        {filteredCities.map((city) => (
          <SelectOption
            key={city}
            selected={isCitySelected(city)}
            onClick={() => handleToggleCity(city)}
          >
            {city}
          </SelectOption>
        ))}
        {filteredCities.length === 0 && (
          <div className="px-3 py-4 text-center text-sm text-slate-500">
            No cities found
          </div>
        )}
      </div>
    </SelectPopover>
  );
};

export default CityFilter;
