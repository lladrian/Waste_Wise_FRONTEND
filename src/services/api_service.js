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



// userRoutes.post('/add_user', UserController.create_user);
// userRoutes.post('/login_user', UserController.login_user);
// userRoutes.put('/update_user_disabled/:id', UserController.update_user_disabled);
// userRoutes.put('/update_user_verified/:id', UserController.update_user_verified);
// userRoutes.put('/update_user/:id', UserController.update_user);
// userRoutes.put('/update_user_password/:id', UserController.update_user_password);
// userRoutes.put('/update_user_password_recovery', UserController.update_user_password_recovery);
// userRoutes.get('/get_all_user', UserController.get_all_user);
// userRoutes.get('/get_specific_user/:id', UserController.get_specific_user);
// userRoutes.delete('/delete_user/:id', UserController.delete_user);






