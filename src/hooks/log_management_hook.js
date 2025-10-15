import * as API from '../services/api_service'; // or axios if used directly




export const getAllLoginLogSpecificUser = async (id) => {
  try {
    const res = await API.getAllLoginLog();
    const data = res.data.data.filter(user => user?.user?._id === id || user?.resident_user?._id === id);
    
    return { data: data, success: true };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};


export const getAllLoginLog = async () => {
  try {
    const res = await API.getAllLoginLog();

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};




export const generateReportLoginLogSpecificUser = async (id, data) => {
  try {
    const res = await API.generateReportLoginLogSpecificUser(id, data);

    return { data: res.data, success: true }; // ✅ return only the data (the Blob)
  } catch (error) {
    throw error;
  }
};


export const generateReportLoginLog = async (data) => {
  try {
    const res = await API.generateReportLoginLog(data);

    return { data: res.data, success: true }; // ✅ return only the data (the Blob)
  } catch (error) {
    throw error;
  }
};


