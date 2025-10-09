import * as API from '../services/api_service'; // or axios if used directly

export const loginUser = async (data) => {
  try {
    const res = await API.loginUser(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


