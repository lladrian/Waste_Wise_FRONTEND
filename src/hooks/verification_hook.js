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

export const createOTP = async (data) => {
  try {
    const res = await API.createOTP(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const verifyOTP = async (data) => {
  try {
    const res = await API.verifyOTP(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const verifyUser = async (id, data) => {
  try {
    const res = await API.verifyUser(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

