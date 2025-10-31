import * as API from '../services/api_service'; // or axios if used directly



export const createGarbageSite = async (data) => {
  try {
    const res = await API.createGarbageSite(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const getAllGarbageSite = async () => {
  try {
    const res = await API.getAllGarbageSite();

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const deleteGarbageSite = async (id) => {
  try {
    const res = await API.deleteGarbageSite(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const updateGarbageSite = async (id, data) => {
  try {
    const res = await API.updateGarbageSite(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};
