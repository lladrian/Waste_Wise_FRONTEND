import * as API from '../services/api_service'; // or axios if used directly

export const getSpecificBarangay = async (id) => {
  try {
    const res = await API.getSpecificBarangay(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const createBarangay = async (data) => {
  try {
    const res = await API.createBarangay(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const getAllGarbageSiteSpecifcBarangay = async (barangay_id) => {
  try {
    const res = await API.getAllGarbageSiteSpecifcBarangay(barangay_id);
    

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

export const getAllBarangayList = async () => {
  try {
    const res = await API.getAllBarangayList();
    

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const deleteBarangay = async (id) => {
  try {
    const res = await API.deleteBarangay(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const updateBarangay = async (id, data) => {
  try {
    const res = await API.updateBarangay(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};
