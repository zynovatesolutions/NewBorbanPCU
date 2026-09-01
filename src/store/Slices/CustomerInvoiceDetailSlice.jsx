import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  GetCompanyItemLedgerApi,
  GetTransactionByIdApi,
  GetTransactionsApi,
} from "../../ApiRequests";

export const fetchTransactionDetail = createAsyncThunk(
  "fetch/invoice-detail",
  async (id) => {
    try {
      const response = await GetTransactionByIdApi(id);
      console.log(response.data);
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const CustomerInvoiceDetailSlice = createSlice({
  name: "invoice-detail",
  initialState: {
    loading: true,
    data: {},
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTransactionDetail.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchTransactionDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchTransactionDetail.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default CustomerInvoiceDetailSlice.reducer;
