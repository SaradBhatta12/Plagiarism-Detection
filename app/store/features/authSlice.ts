import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      { payload: { user, token } }: PayloadAction<{ user: any; token: string }>
    ) => {
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isInitialized = true;

      // Set cookies with 7-day expiration
      Cookies.set("user", JSON.stringify(user), { expires: 7, path: "/" });
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Clear all authentication cookies
      Cookies.remove("user", { path: "/" });
      Cookies.remove("token", { path: "/" });
    },
    initializeAuth: (state) => {
      const userStr = Cookies.get("user");
      const token = Cookies.get("token");

      if (userStr && token) {
        try {
          state.user = JSON.parse(userStr);
          state.token = token;
          state.isAuthenticated = true;
        } catch (error) {
          console.error("Failed to parse user from cookies", error);
        }
      }
      state.isInitialized = true;
    },
  },
});

export const { setCredentials, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
