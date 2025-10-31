import * as API from '../services/api_service'; // or axios if used directly


export const getAllCollectorReport = async () => {
  try {
    const res = await API.getAllCollectorReport();
    const res2 = await API.getAllTruck();

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


