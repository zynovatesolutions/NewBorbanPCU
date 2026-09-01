import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { GetReportApi } from "../../ApiRequests";

export const fetchReport = createAsyncThunk(
  "fetch/Daily-Report",
  async (data) => {
    try {
      let response = await GetReportApi(data);
      return response?.data?.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const ReportSlice = createSlice({
  name: "Daily-Report",
  initialState: {
    loading: false,
    data: [],
    isError: false,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchReport.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchReport.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchReport.rejected, (state, action) => {
      state.loading = false;
      state.isError = true;
    });
  },
});

export default ReportSlice.reducer;
