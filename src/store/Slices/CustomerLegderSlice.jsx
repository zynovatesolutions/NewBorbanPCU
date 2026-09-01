import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetBranchCustomerLedgerApi } from "../../ApiRequests";

export const fetchCustomerLedger = createAsyncThunk(
  "fetch/Customer/ledger",
  async (CurrentCustomerId) => {
    try {
      const response = await GetBranchCustomerLedgerApi(CurrentCustomerId);
      console.log(response.data);
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const CustomerLegderSlice = createSlice({
  name: "Customer-Ledger",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
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
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default CustomerLegderSlice.reducer;
