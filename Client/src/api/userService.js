import axios from "axios";

const API_URL = "http://localhost:3000/api/users";

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data; // { message: "...", user_id, user_email }
  } catch (err) {
    // throw original axios error so frontend can read response.data
    throw err;
  }
};
