import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  GetCompanyItemLedgerApi,
  GetRMStockStatsApi,
  GetStockStatsApi,
} from "../../ApiRequests";

export const fetchCompanyItemLedger = createAsyncThunk(
  "fetch/Supplier/item-ledger",
  async (Payload) => {
    try {
      const response = await GetRMStockStatsApi(Payload);
      console.log(response.data);
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const CompanyItemLegderSlice = createSlice({
  name: "Supplier-Item-Ledger",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCompanyItemLedger.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchCompanyItemLedger.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchCompanyItemLedger.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default CompanyItemLegderSlice.reducer;
