import axios from "axios";
import { getItem, KEY_ACCESS_TOKEN, removeItem, setItem } from "./localStorage";

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:4000/api/v1/",
  withCredentials: true,
});

//request for ....this interceptor
axiosClient.interceptors.request.use((request) => {
  const accessToken = getItem(KEY_ACCESS_TOKEN);
  // console.log("request access token is ", accessToken);
  request.headers["Authorization"] = `Bearer ${accessToken}`;
  return request;
});

//request for ....this interceptor
axiosClient.interceptors.response.use(async (response) => {
  const data = response.data;
  // console.log("data from axios response", data);
  console.log(data);
  if (data.status === "ok") {
    return response;
  }
  if (data.status === "error") {
    console.error("Error response:", Promise.reject(data));
    return Promise.reject(data);
  }
  const error = data.error;
  const originalRequest = response.config;
  const statusCode = data.statusCode;

  // // when refresh toekn expire sedn user to login page
  // if(statusCode === 401 && originalRequest.url ===`${process.env.REACT_APP_SERVER_BASE_URL}/auth/refresh`)
  // {

  //     removeItem(key_Access_Token);

  //     window.location.replace('/login','_self');
  //     return Promise.reject(error);
  // }

  if (statusCode === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    const response = await axios
      .create({
        withCredentials: true,
      })
      .get("http://localhost:4000/api/v1/auth/refresh");

    console.log("response is .....", response.data); // Log the correct structure

    if (response.data.status === "ok") {
      console.log("access token is = ", response.data.result.accessToken); // Now this should work without throwing an error
      setItem(KEY_ACCESS_TOKEN, response.data.result.accessToken);
      originalRequest.headers[
        "Authorization"
      ] = `Bearer ${response.data.result.accessToken}`;

      return axios(originalRequest);
    } else {
      removeItem(KEY_ACCESS_TOKEN);

      window.location.replace("/login", "_self");
      return Promise.reject(error);
    }
  }
  return Promise.reject();
});
