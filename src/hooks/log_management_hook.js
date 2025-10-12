import * as API from '../services/api_service'; // or axios if used directly

export const getAllLoginLog = async (id) => {
  try {
    const res = await API.getAllLoginLog(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
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


