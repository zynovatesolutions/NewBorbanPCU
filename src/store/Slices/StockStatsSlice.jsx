import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetStockStatsAdminApi, GetStockStatsApi } from "../../ApiRequests";
import { ErrorToast } from "../../utils/ShowToast";

export const fetchStockStats = createAsyncThunk(
  "fetch/Stock-Stats",
  async (id) => {
    const apiCall = id ? GetStockStatsApi(id) : GetStockStatsAdminApi();
    try {
      const response = await apiCall;
      console.log(response.data);
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
      ErrorToast(
        error.message === "Network Error"
          ? error.message
          : error.response.data.error.msg
      );
    }
    return [];
  }
);

const StockStatsSlice = createSlice({
  name: "stock-stats",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchStockStats.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchStockStats.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchStockStats.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default StockStatsSlice.reducer;
