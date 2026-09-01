import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetRawMaterialsApi } from "../../ApiRequests";

export const fetchRawMaterials = createAsyncThunk(
  "fetch/RawMaterials",
  async () => {
    try {
      const response = await GetRawMaterialsApi();
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const RawMaterialSlice = createSlice({
  name: "rawMaterials",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchRawMaterials.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchRawMaterials.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload || [];
      state.isError = false;
    });
    builder.addCase(fetchRawMaterials.rejected, (state) => {
      state.loading = false;
      state.isError = true;
    });
  },
});

export default RawMaterialSlice.reducer;
