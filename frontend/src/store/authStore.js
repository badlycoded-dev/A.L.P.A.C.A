import { create } from "zustand";

const API = "/api";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  loading: true,

  init: async () => {
    const token = localStorage.getItem("token");
    if (!token) return set({ loading: false });
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const { user } = await res.json();
        set({ user, token, loading: false });
      } else {
        localStorage.removeItem("token");
        set({ user: null, token: null, loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  login: async (username, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    localStorage.setItem("token", data.token);
    set({ user: data.user, token: data.token });
    return data.user;
  },

  register: async (username, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    localStorage.setItem("token", data.token);
    set({ user: data.user, token: data.token });
    return data.user;
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  authFetch: async (url, opts = {}) => {
    const token = get().token;
    return fetch(url, {
      ...opts,
      headers: {
        ...(opts.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  },
}));
