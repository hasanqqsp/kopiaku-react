import { create } from "zustand";
import { login as apiLogin, getCurrentUser } from "../utils/api";

const useAuthStore = create((set, get) => ({
  isAuthenticated: !!localStorage.getItem("authToken"),
  user: null,
  token: localStorage.getItem("authToken"),
  isLoading: false,

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      const data = await apiLogin(username, password);
      localStorage.setItem("authToken", data.token);
      set({
        isAuthenticated: true,
        user: data,
        token: data.token,
        isLoading: false,
      });
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("needsPhotoVerification");
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
    });
  },

  setUser: (user) => set({ user }),

  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ isAuthenticated: false, user: null, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      // Token invalid, logout
      get().logout();
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));

export default useAuthStore;
