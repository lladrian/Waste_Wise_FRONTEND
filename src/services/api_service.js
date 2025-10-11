import axios from './axios_instance';

export const loginUser = (data) => axios.post('/users/login_user', data);
export const changePasswordRecovery = (data) => axios.put('/users/update_user_password_recovery', data);
export const verifyOTP = (data) => axios.post('/otp/verify_otp', data);
export const createOTP = (data) => axios.post('/otp/add_otp', data);
export const getSpecificUser = (id) => axios.get(`/users/get_specific_user/${id}`);
export const getAllUser = () => axios.get(`/users/get_all_user`);
export const deleteUser = (id) => axios.delete(`/users/delete_user/${id}`);
export const updateUser = (id, data) => axios.put(`/users/update_user/${id}`,data);
export const updateUserPassword = (id, data) => axios.put(`/users/update_user_password/${id}`,data);
export const createUser = (data) => axios.post(`/users/add_user`,data);
export const verifyUser = (id, data) => axios.put(`/users/update_user_verified/${id}`, data);
export const createRoleAction = (data) => axios.post(`/actions/add_role_action`,data);
export const getAllRoleAction = () => axios.get(`/actions/get_all_role_action`);
export const getSpecificRoleAction = (id) => axios.get(`/actions/get_specific_role_action/${id}`);
export const deleteRoleAction = (id) => axios.delete(`/actions/delete_role_action/${id}`);
export const updateRoleAction = (id, data) => axios.put(`/actions/update_role_action/${id}`, data);