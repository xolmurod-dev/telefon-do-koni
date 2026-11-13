import { useEffect, useState } from "react";
import { getCurrentUser, updateUserProfile, useAuth } from "./auth";

const TOKEN_KEY = "ph_token";
const PROFILE_KEY = "ph_profile";

export function getToken(): string {
  if (typeof window === "undefined") return "anon_token";
  const user = getCurrentUser();
  if (user?.token) return user.token;

  let t = localStorage.getItem(TOKEN_KEY);
  if (!t) {
    t = crypto.randomUUID() + crypto.randomUUID().slice(0, 8);
    localStorage.setItem(TOKEN_KEY, t);
  }
  return t;
}

export type Profile = { name: string; phone: string };

export function getProfile(): Profile {
  if (typeof window === "undefined") return { name: "", phone: "" };
  const user = getCurrentUser();
  if (user) {
    return { name: user.name, phone: user.phone };
  }
  try {
    return { name: "", phone: "", ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") };
  } catch {
    return { name: "", phone: "" };
  }
}

export function setProfile(p: Profile) {
  if (typeof window === "undefined") return;
  const user = getCurrentUser();
  if (user) {
    updateUserProfile({ name: p.name, phone: p.phone });
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function useCustomer() {
  const { user } = useAuth();
  const [state, setState] = useState<{ token: string; profile: Profile } | null>(() => {
    return { token: getToken(), profile: getProfile() };
  });

  useEffect(() => {
    setState({ token: getToken(), profile: getProfile() });
  }, [user]);

  return state;
}

export const formatPrice = (n: number) => `${n.toLocaleString("ru-RU")} so'm`;
