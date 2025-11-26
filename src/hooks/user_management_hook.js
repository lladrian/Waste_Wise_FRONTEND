import * as API from '../services/api_service'; // or axios if used directly


export const createUserGarbageCollector = async (data) => {
  try {
    const res = await API.createUserGarbageCollector(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const updateUserSelectedRole = async (id, data) => {
  try {
    const res = await API.updateUserSelectedRole(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const createUser = async (data) => {
  try {
    const res = await API.createUser(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const createUserByAdmin = async (data) => {
  try {
    const res = await API.createUserByAdmin(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const getSpecificUser = async (id) => {
  try {
    const res = await API.getSpecificUser(id);


    return { data: res.data, success: true };
    // return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const getAllUserSpecificBarangay = async (barangay_id) => {
  try {
    const res = await API.getAllUserSpecificBarangay(barangay_id);

    return { data: res.data, success: true };
    // return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const getAllUser = async () => {
  try {
    const res = await API.getAllUser();

    return { data: res.data, success: true };
    // return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const getAllUserResident = async () => {
  try {
    const res = await API.getAllUser();


    
    const filteredData = res.data.data.filter(user => user.role === 'resident');
        
    return { data:{ data: filteredData }, success: true };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};


export const getAllUserNoResident = async () => {
  try {
    const res = await API.getAllUser();
    const res2 = await API.getAllRoleAction();
    const res3 = await API.getAllBarangay();

    
    const filteredData = res.data.data.filter(user => user.role !== 'resident');
        
    return { data: filteredData, data2: res2.data.data, data3: res3.data.data, success: true };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const res = await API.deleteUser(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const res = await API.updateUser(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const updateUserProfile = async (id, data) => {
  try {
    const res = await API.updateUserProfile(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const updateUserResident = async (id, data) => {
  try {
    const res = await API.updateUserResident(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const updateUserGarbageCollector = async (id, data) => {
  try {
    const res = await API.updateUserGarbageCollector(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};




export const updateUserPassword = async (id, data) => {
  try {
    const res = await API.updateUserPassword(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};




export const updateUserPasswordAdmin = async (id, data) => {
  try {
    const res = await API.updateUserPasswordAdmin(id, data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};
