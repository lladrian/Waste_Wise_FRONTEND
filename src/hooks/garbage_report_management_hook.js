import * as API from '../services/api_service'; // or axios if used directly


export const getAllGarbageReport = async () => {
  try {
    const res = await API.getAllGarbageReport();

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const getAllGarbageReportSpecificBarangay = async (id) => {
  try {
    const res = await API.getAllGarbageReportSpecificBarangay(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const updateGarbageReportStatus = async (id, data) => {
  try {
    const res = await API.updateGarbageReportStatus(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

