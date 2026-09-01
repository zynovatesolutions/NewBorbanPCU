import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GetSupplierLedgerApi } from "../../ApiRequests";

export const fetchSupplierLedger = createAsyncThunk(
  "fetch/SupplierLedger",
  async (id) => {
    try {
      let response = await GetSupplierLedgerApi(id);
      return response?.data?.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const SupplierLedgerSlice = createSlice({
  name: "SupplierLedger",
  initialState: {
    loading: false,
    data: [],
    isError: false,
  },
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
      state.loading = false;
      state.isError = true;
    });
  },
});

export default SupplierLedgerSlice.reducer;
