import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetAdminExpensesApi, GetBranchExpensesApi } from "../../ApiRequests";

export const fetchExpenses = createAsyncThunk("fetch/Expenses", async (id) => {
  const apiCall = id ? GetBranchExpensesApi(id) : GetAdminExpensesApi();
  try {
    const response = await apiCall;
    console.log(response.data);
    return response.data.data.payload;
  } catch (error) {
    console.log(error);
  }
  return { expenses: [], deleted: [] };
});

const ExpenseSlice = createSlice({
  name: "expenses",
  initialState: {
    loading: true,
    data: { expenses: [], deleted: [] },
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchExpenses.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchExpenses.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchExpenses.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default ExpenseSlice.reducer;
