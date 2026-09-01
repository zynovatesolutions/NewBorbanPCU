import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetCompanyItemLedgerApi, GetTransactionsApi } from "../../ApiRequests";

export const fetchCustomerItemLedger = createAsyncThunk(
  "fetch/customer/item-ledger",
  async (Payload) => {
    try {
      const response = await GetTransactionsApi(Payload);
      console.log(response.data);
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const CustomerItemLegderSlice = createSlice({
  name: "customer-item-ledger",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCustomerItemLedger.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchCustomerItemLedger.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchCustomerItemLedger.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default CustomerItemLegderSlice.reducer;
