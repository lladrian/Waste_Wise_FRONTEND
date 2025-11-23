import * as API from '../services/api_service'; // or axios if used directly


export const getAllDataDashboard = async (barangay_id) => {
  try {
    const res = await API.getAllBarangay();
    const res2 = await API.getAllTruck();
    const res3 = await API.getAllComplain();
    const res4 = await API.getAllUser();
    const res5 = await API.getAllRoute();
    const res6 = await API.getAllSchedule();
    const res7 = await API.getAllScheduleSpecificBarangay(barangay_id);

    return { data: {barangays: res.data, trucks: res2.data, 
      complains: res3.data, users: res4.data,
      routes: res5.data, schedules: res6.data, schedules2: res7.data}, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};
