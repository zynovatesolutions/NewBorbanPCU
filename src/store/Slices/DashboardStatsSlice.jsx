import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetDashboardStats, GetBranchDashboardStats } from "../../ApiRequests";

export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchDashboardStats",
  async (id) => {
    const apiCall = id ? GetBranchDashboardStats(id) : GetDashboardStats();
    const response = await apiCall;
    return response.data.data.payload;
  }
);

const DashboardStatsSlice = createSlice({
  name: "dashboardStats",
  initialState: {
    loading: true,
    data: null,
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.isError = false;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isError = false;
      })
      .addCase(fetchDashboardStats.rejected, (state) => {
        state.loading = false;
        state.isError = true;
      });
  },
});

export default DashboardStatsSlice.reducer;
