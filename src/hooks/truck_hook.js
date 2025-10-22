import * as API from '../services/api_service'; // or axios if used directly

export const getSpecificTruck = async (id) => {
  try {
    const res = await API.getSpecificTruck(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const createTruck = async (data) => {
  try {
    const res = await API.createTruck(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const getAllTruck = async () => {
  try {
    const res = await API.getAllTruck();
    const res2 = await API.getAllTruckDriverUser();
    const res3 = await API.getAllUser();
    const filteredData = res3.data.data.filter(user => user.role === 'garbage_collector');



    return { data: {trucks: res.data, users: res2.data, drivers: filteredData}, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const deleteTruck = async (id) => {
  try {
    const res = await API.deleteTruck(id);

    return { data: res.data, success: true };
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
