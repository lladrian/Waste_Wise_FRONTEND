import * as API from '../services/api_service'; // or axios if used directly


export const getAllTruck = async (barangay_id, day) => {
  try {
    const res = await API.getAllSchedule();
    const res2 = await API.getAllScheduleSpecificBarangay(barangay_id);


    const trucksOnRoute = res?.data?.data?.filter(
      (record) => Array.isArray(record.recurring_day) && record.recurring_day.includes(day)
    );


    const trucksOnRouteSpecificBarangay = res2?.data?.data.filter(
      (record) => Array.isArray(record.recurring_day) && record.recurring_day.includes(day)
    );

    return { data: { trucks: trucksOnRoute, trucks2: trucksOnRouteSpecificBarangay }, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};
