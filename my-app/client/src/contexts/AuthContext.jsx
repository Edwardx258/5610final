// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api, { loginUser, registerUser, logoutUser } from "../api/api";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const isLoggedIn = !!user;

  const normalizeUser = (data) => {
    // 后端 me 返回 { id: "...", username: "..." }
    // 我们统一把它展开，并且同时保留 _id 和 id
    return {
      _id: data.id,
      id: data.id,
      username: data.username,
      // 如果以后还返回 wins/losses, 也可以 ...data
    };
  };

  const login = async ({ username, password }) => {
    await loginUser({ username, password });    // 发 /auth/login，设置 cookie
    const meRes = await api.get("/auth/me");    // { id, username }
    setUser(normalizeUser(meRes.data));
    return true;
  };

  const register = async ({ username, password }) => {
    await registerUser({ username, password }); // 发 /auth/register
    // 注册成功后直接登录
    await login({ username, password });
    return true;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  };

  // App 初始化时，尝试恢复登录状态
  useEffect(() => {
    (async () => {
      try {
        const meRes = await api.get("/auth/me"); // { id, username }
        setUser(normalizeUser(meRes.data));
      } catch {
        setUser(null);
      }
    })();
  }, []);

  return (
      <AuthContext.Provider value={{ user, isLoggedIn, login, register, logout }}>
        {children}
      </AuthContext.Provider>
  );
};
