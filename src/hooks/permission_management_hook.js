import * as API from '../services/api_service'; // or axios if used directly

export const getSpecificRoleAction = async (id) => {
  try {
    const res = await API.getSpecificRoleAction(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const createRoleAction = async (data) => {
  try {
    const res = await API.createRoleAction(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const getAllRoleAction = async () => {
  try {
    const res = await API.getAllRoleAction();

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const deleteRoleAction = async (id) => {
  try {
    const res = await API.deleteRoleAction(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const updateRoleAction = async (id, data) => {
  try {
    const res = await API.updateRoleAction(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};
