import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { DeletedPaymentAPI } from "../../ApiRequests";

export const fetchDeletedPayment = createAsyncThunk(
  "fetch/DeletedPayments",
  async () => {
    try {
      const response = await DeletedPaymentAPI();
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const DeletedPaymentSlice = createSlice({
  name: "DeletedPayments",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchDeletedPayment.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchDeletedPayment.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchDeletedPayment.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default DeletedPaymentSlice.reducer;
