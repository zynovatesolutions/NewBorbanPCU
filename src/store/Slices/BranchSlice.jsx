import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetAllBranchApi, GetCompanyApi } from "../../ApiRequests";

export const fetchBranches = createAsyncThunk(
  "fetch/BranchsDetail",
  async () => {
    try {
      const response = await GetAllBranchApi();
      console.log(response.data);
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const BranchSlice = createSlice({
  name: "branch",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBranches.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchBranches.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchBranches.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default BranchSlice.reducer;
