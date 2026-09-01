import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetAccountSummaryApi } from "../../ApiRequests";

export const fetchCashSummary = createAsyncThunk(
  "fetch/Cash-Summary",
  async (data) => {
    try {
      const response = await GetAccountSummaryApi(data.id, data.payload);
      console.log(response.data);
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const CashSummarySlice = createSlice({
  name: "Cash-Summary",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCashSummary.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchCashSummary.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchCashSummary.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default CashSummarySlice.reducer;
