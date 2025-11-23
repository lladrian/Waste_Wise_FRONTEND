import * as API from '../services/api_service'; // or axios if used directly

export const getSpecificSchedule = async (id) => {
  try {
    const res = await API.getSpecificSchedule(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};




export const createSchedule = async (data) => {
  try {
    const res = await API.createSchedule(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const getAllSchedule = async (barangay_id) => {
  try {
    const res = await API.getAllSchedule();
    const res2 = await API.getAllRoute();
    const res3 = await API.getAllTruck();
    const res4 = await API.getAllBarangay();
    const res5 = await API.getAllScheduleSpecificBarangay(barangay_id);



    return { data: { schedules: res.data, routes: res2.data, trucks: res3.data, barangays: res4.data, schedules2: res5.data, }, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const deleteSchedule = async (id) => {
  try {
    const res = await API.deleteSchedule(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const updateSchedule = async (id, data) => {
  try {
    const res = await API.updateSchedule(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const updateScheduleApproval = async (id, data) => {
  try {
    const res = await API.updateScheduleApproval(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


