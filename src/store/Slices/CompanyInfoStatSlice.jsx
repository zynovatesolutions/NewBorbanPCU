import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetCompanyInfoStatsApi } from "../../ApiRequests";

export const fetchBranchStats = createAsyncThunk(
  "fetch/CompanyDetails",
  async () => {
    try {
      const response = await GetCompanyInfoStatsApi();
      console.log(response.data);
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const CompanyInfoStatSlice = createSlice({
  name: "company-stats",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBranchStats.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchBranchStats.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchBranchStats.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default CompanyInfoStatSlice.reducer;
