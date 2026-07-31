import axios from "axios";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_LAN_URL}/api`,

  withCredentials: true
});

export default api;