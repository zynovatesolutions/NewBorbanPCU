import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetAccountsStatsApi } from "../../ApiRequests";

export const fetchAccounts = createAsyncThunk("fetch/Accounts", async () => {
  try {
    const response = await GetAccountsStatsApi();
    console.log("-------------------");
    console.log(response.data);
    console.log("-------------------");
    return response.data.data.payload;
  } catch (error) {
    console.log(error);
  }
  return [];
});

const AccountsStatSlice = createSlice({
  name: "Accounts-Stats",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAccounts.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchAccounts.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchAccounts.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default AccountsStatSlice.reducer;
