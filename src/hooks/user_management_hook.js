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

export const getAllUserResident = async (id) => {
  try {
    const res = await API.getAllUser(id);
    const filteredData = res.data.data.filter(user => user.role === 'resident');

    return { data: filteredData, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const getAllUserNoResident = async (id) => {
  try {
    const res = await API.getAllUser(id);
    
    const filteredData = res.data.data.filter(user => user.role !== 'resident');
        
    return { data: filteredData, success: true };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await API.deleteUser(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const res = await API.updateUser(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const updateUserPassword = async (id, data) => {
  try {
    const res = await API.updateUserPassword(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};
