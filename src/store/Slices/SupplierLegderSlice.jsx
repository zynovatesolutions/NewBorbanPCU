import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetBranchSupplierLedgerApi } from "../../ApiRequests";

export const fetchSupplierLedger = createAsyncThunk(
  "fetch/Supplier/ledger",
  async (CurrentCustomerId) => {
    try {
      const response = await GetBranchSupplierLedgerApi(CurrentCustomerId);
      console.log(response.data);
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const SupplierLegderSlice = createSlice({
  name: "Supplier-Ledger",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSupplierLedger.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchSupplierLedger.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchSupplierLedger.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default SupplierLegderSlice.reducer;
