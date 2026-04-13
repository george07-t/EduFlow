import client from "./client";
import { User } from "@/types/api";

export const authApi = {
  login: (username: string, password: string) =>
    client.post<{ user: User }>("/auth/login", { username, password }),

  logout: () => client.post("/auth/logout"),

  me: () => client.get<User>("/auth/me"),

  refresh: () => client.post("/auth/refresh"),
};
