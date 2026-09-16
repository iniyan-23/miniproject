import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('userInfo');

  if (storedUser) {
    const userInfo = JSON.parse(storedUser);

    if (userInfo?.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
  }

  return config;
});

export default API;
