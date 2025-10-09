import axios from './axios_instance';

export const loginUser = (data) => axios.post('/users/login_user', data);
export const changePasswordRecovery = (data) => axios.put('/users/update_user_password_recovery', data);
export const verifyOTP = (data) => axios.post('/otp/verify_otp', data);
export const createOTP = (data) => axios.post('/otp/add_otp', data);











