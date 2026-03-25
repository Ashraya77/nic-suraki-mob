import axios from "axios";
// import { API_BASE_URL } from "@env";
const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
    // 'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  },
});

axiosInstance.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);
