import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Placeholder API functions, replace with real ones
import {
  GetFixedAssetsByBranchIdApi,
  GetFixedAssetsByAdminApi,
  GetDeletedFixedAssetsByBranchIdApi,
  GetDeletedFixedAssetsByAdminApi,
} from "../../ApiRequests";

export const fetchFixedAssets = createAsyncThunk(
  "fetch/FixedAssets",
  async (id) => {
    try {
      const response = id
        ? await GetFixedAssetsByBranchIdApi(id)
        : await GetFixedAssetsByAdminApi();
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

export const fetchDeletedFixedAssets = createAsyncThunk(
  "fetch/DeletedFixedAssets",
  async (id) => {
    try {
      const response = id
        ? await GetDeletedFixedAssetsByBranchIdApi(id)
        : await GetDeletedFixedAssetsByAdminApi();
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const FixedAssetSlice = createSlice({
  name: "fixedAssets",
  initialState: {
    loading: true,
    data: [],
    deleted: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFixedAssets.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchFixedAssets.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchFixedAssets.rejected, (state) => {
      state.loading = false;
      state.isError = true;
    });
    builder.addCase(fetchDeletedFixedAssets.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchDeletedFixedAssets.fulfilled, (state, action) => {
      state.loading = false;
      state.deleted = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchDeletedFixedAssets.rejected, (state) => {
      state.loading = false;
      state.isError = true;
    });
  },
});

export default FixedAssetSlice.reducer;
