import React, { useState } from "react";
import "../styles/PageLayout.css";

const AuthForm = ({ mode, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const isLogin = mode === "login";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const payload = {
      username: formData.username,
      password: formData.password,
    };

    onSubmit(payload);
  };

  return (
    <div className="authFormWrapper">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? "Login" : "Register"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="formField">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            required
            value={formData.username}
            onChange={handleChange}
            placeholder="Enter your username"
          />
        </div>

        <div className="formField">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
        </div>

        {!isLogin && (
          <div className="formField">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
            />
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {isLogin ? "Log In" : "Register"}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;