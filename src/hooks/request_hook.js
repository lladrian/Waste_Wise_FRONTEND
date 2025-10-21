import * as API from '../services/api_service'; // or axios if used directly


export const createUser = async (data) => {
  try {
    const res = await API.createUser(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const getAllBarangay = async () => {
  try {
    const res = await API.getAllBarangay();

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const getAllRequest = async () => {
  try {
    const res = await API.getAllRequest();
    const res2 = await API.getAllRoleAction();
    const res3 = await API.getAllBarangay();
    

    return { data: {requests: res.data, role_actions: res2.data, barangays: res3.data}, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const createRequest = async (data) => {
  try {
    const res = await API.createRequest(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const getSpecificRequest = async (id) => {
  try {
    const res = await API.getSpecificRequest(id);
    

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const deleteRequest = async (id) => {
  try {
    const res = await API.deleteRequest(id);
    

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const updateRequest = async (id, data) => {
  try {
    const res = await API.updateRequest(id, data);
    

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const updateRequestApproval = async (id, data) => {
  try {
    const res = await API.updateRequestApproval(id, data);
    

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


