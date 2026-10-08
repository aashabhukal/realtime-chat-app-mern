// src/utils/validators.js
export const validateEmail = (email) =>
  /^\S+@\S+\.\S+$/.test(email);

export const validateUsername = (username) =>
  /^[a-z0-9_.]{3,30}$/.test(username);

export const validatePassword = (password) =>
  password && password.length >= 6;