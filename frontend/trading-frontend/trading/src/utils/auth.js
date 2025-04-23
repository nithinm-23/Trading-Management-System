import axios from "axios";

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("authToken", token);
  } else {
    delete axios.defaults.headers.common["Authorization"];
    localStorage.removeItem("authToken");
  }
};

export const refreshAuthToken = async () => {
  try {
    const response = await axios.post(
      "/api/auth/refresh",
      {},
      {
        withCredentials: true,
      }
    );
    setAuthToken(response.data.token);
    return true;
  } catch (error) {
    return false;
  }
};
