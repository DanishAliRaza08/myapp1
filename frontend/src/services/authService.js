import axios from 'axios';

// The base URL for our backend API
const API_URL = 'http://localhost:5000/api/auth/';

// Register user
const register = (displayName, email, password) => {
  return axios.post(API_URL + 'register', {
    displayName,
    email,
    password,
  });
};

// Login user
const login = (email, password) => {
  return axios.post(API_URL + 'login', {
    email,
    password,
  });
};

const authService = {
  register,
  login,
};

export default authService;