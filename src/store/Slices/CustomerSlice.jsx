import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetCustomerBranchApi, GetCustomerAdminApi } from "../../ApiRequests";

export const fetchCustomers = createAsyncThunk(
  "fetch/CustomerDetails",
  async (id) => {
    try {
      let response;
      if (id) {
        response = await GetCustomerBranchApi(id);
      } else {
        response = await GetCustomerAdminApi();
      }
      return response.data.data.payload;
    } catch (error) {
      console.error(
        "Error fetching customers:",
        error.response?.data || error.message
      );
      throw error; // This will trigger the rejected case
    }
  }
);

const CustomerSlice = createSlice({
  name: "customer",
  initialState: {
    loading: true,
    data: [],
    isError: false,
    error: null,
  },
  reducers: {
    clearCustomerError: (state) => {
      state.isError = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isError = false;
        state.error = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.isError = true;
        state.error = action.error.message || "Failed to fetch customers";
      });
  },
});

export const { clearCustomerError } = CustomerSlice.actions;
export default CustomerSlice.reducer;
