import * as API from '../services/api_service'; // or axios if used directly


export const createBarangayRequest = async (data) => {
  try {
    const res = await API.createBarangayRequest(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};
export const getAllBarangayRequest = async () => {
  try {
    const res = await API.getAllBarangayRequest();

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const getAllBarangayRequestSpecificBarangay = async (id) => {
  try {
    const res = await API.getAllBarangayRequestSpecificBarangay(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const updateBarangayRequestStatus = async (id, data) => {
  try {
    const res = await API.updateBarangayRequestStatus(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

