import * as API from '../services/api_service'; // or axios if used directly


export const getAllTruck = async (barangay_id, date) => {
  try {
    const res = await API.getAllSchedule();
    const res2 = await API.getAllScheduleSpecificBarangay(barangay_id);

  
    const trucksOnRoute = res?.data?.data .filter(
      (record) => (record.truck?.status || "").toLowerCase() === "on route" && record.scheduled_collection == date
    );

    const trucksOnRouteSpecificBarangay = res2?.data?.data .filter(
      (record) => (record.truck?.status || "").toLowerCase() === "on route" && record.scheduled_collection == date
    );

    return { data: {trucks: trucksOnRoute, trucks2: trucksOnRouteSpecificBarangay} , success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const updateTruck = async (id, data) => {
  try {
    const res = await API.updateTruck(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};
