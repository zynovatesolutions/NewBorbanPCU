import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  GetCustomerInvoicesByAdminAPI,
  GetCustomerInvoicesByBranchIdAPI,
  GetCustomerInvoicesByIdAPI,
} from "../../ApiRequests";

export const fetchCustomerInvoice = createAsyncThunk(
  "fetch/CustomerInvoice",
  async (data) => {
    try {
      let response;
      if (data.role === 1) response = await GetCustomerInvoicesByAdminAPI();
      else if (data.role === 2)
        response = await GetCustomerInvoicesByBranchIdAPI(data.id);
      else if (data.role === 3)
        response = await GetCustomerInvoicesByIdAPI(data.id);
      return response?.data?.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const CustomerInvoiceSlice = createSlice({
  name: "CustomerInvoice",
  initialState: {
    loading: false,
    data: [],
    isError: false,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCustomerInvoice.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchCustomerInvoice.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchCustomerInvoice.rejected, (state, action) => {
      state.loading = false;
      state.isError = true;
    });
  },
});

export default CustomerInvoiceSlice.reducer;
