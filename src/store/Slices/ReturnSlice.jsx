import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetReturnsByIdApi } from "../../ApiRequests";

export const fetchReturnLedger = createAsyncThunk(
  "fetch/ReturnSlice",
  async (payload) => {
    try {
      const response = await GetReturnsByIdApi(payload);
      console.log(response.data);
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const ReturnSlice = createSlice({
  name: "Return",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchReturnLedger.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchReturnLedger.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchReturnLedger.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default ReturnSlice.reducer;
