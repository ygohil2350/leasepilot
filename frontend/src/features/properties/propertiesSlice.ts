import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, getErrorMessage } from '../../api/client';
import type { ApiResponse, Property } from '../../types';

interface State {
  items: Property[];
  total: number;
  pages: number;
  loading: boolean;
  error?: string;
  selectedId?: string;
  favorites: string[];
}
const storedFavorites = localStorage.getItem('leasepilot-favorites');
const initialState: State = {
  items: [],
  total: 0,
  pages: 0,
  loading: false,
  favorites: storedFavorites ? (JSON.parse(storedFavorites) as string[]) : [],
};
export const fetchProperties = createAsyncThunk(
  'properties/fetch',
  async (search: string, { rejectWithValue }) => {
    try {
      return (
        await api.get<ApiResponse<{ items: Property[]; meta: { total: number; pages: number } }>>(
          `/properties?${search}`,
        )
      ).data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
const slice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    selectProperty(state, action: { payload: string }) {
      state.selectedId = action.payload;
    },
    toggleFavorite(state, action: { payload: string }) {
      state.favorites = state.favorites.includes(action.payload)
        ? state.favorites.filter((id) => id !== action.payload)
        : [...state.favorites, action.payload];
      localStorage.setItem('leasepilot-favorites', JSON.stringify(state.favorites));
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.meta.total;
        state.pages = action.payload.meta.pages;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload);
      }),
});
export const { selectProperty, toggleFavorite } = slice.actions;
export default slice.reducer;
