"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";
import { initializeAuth } from "./features/authSlice";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
