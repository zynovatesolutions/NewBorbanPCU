import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GetCustomerLedgerApi } from "../../ApiRequests";

export const fetchCustomerLedger = createAsyncThunk(
  "fetch/CustomerLedger",
  async (id) => {
    try {
      let response = await GetCustomerLedgerApi(id);
      console.log(response?.data?.data.payload.ShAll);

      return response?.data?.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const CustomerLedgerSlice = createSlice({
  name: "CustomerLedger",
  initialState: {
    loading: false,
    data: [],
    isError: false,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCustomerLedger.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchCustomerLedger.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchCustomerLedger.rejected, (state, action) => {
      state.loading = false;
      state.isError = true;
    });
  },
});

export default CustomerLedgerSlice.reducer;
