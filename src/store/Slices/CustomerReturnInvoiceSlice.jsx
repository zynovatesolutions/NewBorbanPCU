import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  GetCustomerReturnsByAdminIdApi,
  GetCustomerReturnsByBranchIdApi,
  GetCustomerReturnsByCustomerId,
} from "../../ApiRequests";

export const fetchCustomerReturnInvoice = createAsyncThunk(
  "fetch/CustomerReturnInvoice",
  async (data) => {
    // role = 1: Admin, 2: Branch, 3: Customer
    try {
      let response;
      if (data.role === 1) response = await GetCustomerReturnsByAdminIdApi();
      else if (data.role === 2)
        response = await GetCustomerReturnsByBranchIdApi(data.id);
      else if (data.role === 3)
        response = await GetCustomerReturnsByCustomerId(data.id);
      return response?.data?.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const CustomerReturnInvoiceSlice = createSlice({
  name: "CustomerReturnInvoice",
  initialState: {
    loading: false,
    data: [],
    isError: false,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCustomerReturnInvoice.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchCustomerReturnInvoice.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchCustomerReturnInvoice.rejected, (state, action) => {
      state.loading = false;
      state.isError = true;
    });
  },
});

export default CustomerReturnInvoiceSlice.reducer;
