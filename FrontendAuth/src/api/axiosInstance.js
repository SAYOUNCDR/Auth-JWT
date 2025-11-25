import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true, // allows sending cookie automatically
});
export default api;
