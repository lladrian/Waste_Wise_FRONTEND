import * as API from '../services/api_service'; // or axios if used directly

export const getSpecificComplain = async (id) => {
  try {
    const res = await API.getSpecificComplain(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const createComplain = async (data) => {
  try {
    const res = await API.createComplain(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const getAllComplain = async () => {
  try {
    const res = await API.getAllComplain();
    const res2 = await API.getAllUser();
    const res3 = await API.getAllRoute();

    return { data: {complains: res.data, users: res2.data, routes: res3.data}, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const deleteComplain = async (id) => {
  try {
    const res = await API.deleteComplain(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const updateComplain = async (id, data) => {
  try {
    const res = await API.updateComplain(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};
