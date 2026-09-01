import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  Get_RM_InvoicesByAdminApi,
  Get_RM_InvoicesByBranchApi,
} from "../../ApiRequests";

export const fetchSupplierInvoice = createAsyncThunk(
  "fetch/SupplierInvoice",
  async (id) => {
    try {
      let response;
      if (id) {
        response = await Get_RM_InvoicesByBranchApi(id);
      } else {
        response = await Get_RM_InvoicesByAdminApi();
      }
      return response?.data?.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const SupplierInvoiceSlice = createSlice({
  name: "SupplierInvoice",
  initialState: {
    loading: false,
    data: [],
    isError: false,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchSupplierInvoice.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchSupplierInvoice.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchSupplierInvoice.rejected, (state, action) => {
      state.loading = false;
      state.isError = true;
    });
  },
});

export default SupplierInvoiceSlice.reducer;
