"use client";
import { create } from "zustand";
import { User } from "@/types/api";
import { authApi } from "@/lib/api/auth";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(username, password);
      set({ user: res.data.user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await authApi.logout().catch(() => {});
    set({ user: null });
  },

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const res = await authApi.me();
      set({ user: res.data, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
