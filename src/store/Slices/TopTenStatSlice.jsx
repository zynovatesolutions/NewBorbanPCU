import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetTopTenStatsApi } from "../../ApiRequests";

export const fetchTopTen = createAsyncThunk("fetch/TopTen", async () => {
  try {
    const response = await GetTopTenStatsApi();
    console.log("-------------------");
    console.log(response.data);
    console.log("-------------------");
    return response.data.data.payload;
  } catch (error) {
    console.log(error);
  }
  return [];
});

const TopTenStatSlice = createSlice({
  name: "top-ten",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTopTen.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchTopTen.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchTopTen.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default TopTenStatSlice.reducer;
