import axios from "axios";
// import { API_BASE_URL } from "@env";

export const axiosInstance = axios.create({
  baseURL: "https://api.suraki.nicnepal.org/api/v1/fon",
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
