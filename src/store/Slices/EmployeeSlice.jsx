import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  GetCompanyApi,
  GetCustomerApi,
  GetEmployeeApi,
} from "../../ApiRequests";

export const fetchEmployees = createAsyncThunk(
  "fetch/EmployeeDetails",
  async () => {
    try {
      const response = await GetEmployeeApi();
      console.log(response.data);
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const EmployeeSlice = createSlice({
  name: "employee",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchEmployees.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchEmployees.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchEmployees.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default EmployeeSlice.reducer;
