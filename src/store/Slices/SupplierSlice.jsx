import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetAdminCompanyApi, GetCompanyApi } from "../../ApiRequests";

export const fetchSuppliers = createAsyncThunk(
  "fetch/suppliers",
  async (id) => {
    console.log(id);
    try {
      let response;
      if (id) response = await GetCompanyApi(id);
      else response = await GetAdminCompanyApi();
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const SupplierSlice = createSlice({
  name: "suppliers",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSuppliers.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchSuppliers.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchSuppliers.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default SupplierSlice.reducer;
