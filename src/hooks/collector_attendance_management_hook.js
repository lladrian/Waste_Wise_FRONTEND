import * as API from '../services/api_service'; // or axios if used directly


export const getAllCollectorAttendance = async () => {
  try {
    const res = await API.getAllCollectorAttendance();

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


