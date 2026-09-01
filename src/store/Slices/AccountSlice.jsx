import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  GetAccountsApi,
  GetCompanyApi,
  GetCustomerApi,
  GetEmployeeApi,
} from "../../ApiRequests";

export const fetchAccountsAmount = createAsyncThunk(
  "fetch/AccountDetails",
  async (payload) => {
    try {
      const response = await GetAccountsApi(payload);
      console.log(response.data);
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const AccountsSlice = createSlice({
  name: "accounts",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAccountsAmount.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchAccountsAmount.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchAccountsAmount.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default AccountsSlice.reducer;
