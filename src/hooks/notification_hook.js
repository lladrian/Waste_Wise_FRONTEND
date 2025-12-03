import * as API from '../services/api_service'; // or axios if used directly

export const getAllNotificationSpecificUser = async (user_id, role) => {
  try {
    const res = await API.getAllNotificationSpecificUser(user_id, role);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const updateReadSpecificNotification = async (id) => {
  try {
    const res = await API.updateReadSpecificNotification(id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


export const updateReadMultipleNotification = async (data) => {
  try {
    const res = await API.updateReadMultipleNotification(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};

export const updateArchiveMultipleNotification = async (data) => {
  try {
    const res = await API.updateArchiveMultipleNotification(data);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};



export const updateReadAllNotificationSpecificUser = async (user_id) => {
  try {
    const res = await API.updateReadAllNotificationSpecificUser(user_id);

    return { data: res.data, success: true };
  } catch (error) {
    // console.error("Failed to register user:", error);
    throw error;
  }
};


