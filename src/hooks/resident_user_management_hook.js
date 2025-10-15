import * as API from '../services/api_service'; // or axios if used directly




export const getAllResidentUser = async () => {
  try {
    const res = await API.getAllResidentUser();
    //const filteredData = res.data.data.filter(user => user.role === 'resident');
    //return { data: filteredData, success: true };

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const createResidentUser = async (data) => {
  try {
    const res = await API.createResidentUser(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const deleteResidentUser = async (id) => {
  try {
    const res = await API.deleteResidentUser(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const updateResidentUser = async (id, data) => {
  try {
    const res = await API.updateResidentUser(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};




export const updateResidentUserPasswordAdmin = async (id, data) => {
  try {
    const res = await API.updateResidentUserPasswordAdmin(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};
