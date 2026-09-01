import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { GetArticlesStatsApi } from "../../ApiRequests";

export const fetchArticleStats = createAsyncThunk(
  "fetch/ArticleStatsDetails",
  async (article_id) => {
    try {
      const response = await GetArticlesStatsApi(article_id);
      console.log(response.data);
      return response.data.data.payload;
    } catch (error) {
      console.log(error);
    }
    return [];
  }
);

const ArticleStatsSlice = createSlice({
  name: "article-stats",
  initialState: {
    loading: true,
    data: [],
    isError: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchArticleStats.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchArticleStats.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.isError = false;
    });
    builder.addCase(fetchArticleStats.rejected, (state, action) => {
      console.log("Error", action);
      // console.log("Error", action.payload);
      state.loading = false;
      state.isError = true;
    });
  },
});

export default ArticleStatsSlice.reducer;
