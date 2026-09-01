import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetCompanyApi, GetPaymentsByIdApi } from "../../ApiRequests";

export const fetchPaymentById = createAsyncThunk(
  "fetch/Payments",
  async (id) => {
    const apiCall = id && GetPaymentsByIdApi(id);
    try {
      const response = await apiCall;
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const PaymentSlice = createSlice({
  name: "Payments",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPaymentById.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchPaymentById.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchPaymentById.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default PaymentSlice.reducer;
