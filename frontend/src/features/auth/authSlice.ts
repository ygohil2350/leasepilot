import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, getErrorMessage } from '../../api/client';
import type { ApiResponse, User } from '../../types';

interface State {
  user: User | null;
  token: string | null;
  loading: boolean;
  error?: string;
}
const initialState: State = {
  user: null,
  token: localStorage.getItem('leasepilot-token'),
  loading: false,
};
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return (
        await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials)
      ).data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);
export const loadMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    return (await api.get<ApiResponse<User>>('/auth/me')).data.data;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});
const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('leasepilot-token');
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('leasepilot-token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload);
      })
      .addCase(loadMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(loadMe.rejected, (state) => {
        state.user = null;
        state.token = null;
        localStorage.removeItem('leasepilot-token');
      }),
});
export const { logout } = slice.actions;
export default slice.reducer;
