import * as API from '../services/api_service'; // or axios if used directly

export const getSpecificUser = async (id) => {
  try {
    const res = await API.getSpecificUser(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};