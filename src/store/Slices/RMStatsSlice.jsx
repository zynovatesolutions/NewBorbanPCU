import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetRM_StatsApi, GetRM_StatsByAdminApi } from "../../ApiRequests";
import { ErrorToast } from "../../utils/ShowToast";

export const fetchRMStats = createAsyncThunk("fetch/rm-stats", async (id) => {
  console.log(id);

  const apiCall = id ? GetRM_StatsApi(id) : GetRM_StatsByAdminApi();
  try {
    const response = await apiCall;
    console.log(response.data.data.payload);
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
});

const RMStatsSlice = createSlice({
  name: "articles",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchRMStats.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchRMStats.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchRMStats.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default RMStatsSlice.reducer;
