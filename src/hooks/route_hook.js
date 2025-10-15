import * as API from '../services/api_service'; // or axios if used directly

export const getSpecificRoute = async (id) => {
  try {
    const res = await API.getSpecificRoute(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const createRoute = async (data) => {
  try {
    const res = await API.createRoute(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const getAllRoute = async () => {
  try {
    const res = await API.getAllRoute();

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const deleteRoute = async (id) => {
  try {
    const res = await API.deleteRoute(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const updateRoute = async (id, data) => {
  try {
    const res = await API.updateRoute(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};
