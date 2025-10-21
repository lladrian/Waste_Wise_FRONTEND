import axios from './axios_instance';

export const verifyOTP = (data) => axios.post('/otp/verify_otp', data);
export const createOTP = (data) => axios.post('/otp/add_otp', data);
export const updateUserGarbageCollector = (id, data) => axios.put(`/users/update_user_garbage_collector/${id}`,data);
export const createUserGarbageCollector = (data) => axios.post(`/users/add_user_garbage_collector`,data);
export const changePasswordRecovery = (data) => axios.put('/users/update_user_password_recovery', data);
export const loginUser = (data) => axios.post('/users/login_user', data);
export const getSpecificUser = (id) => axios.get(`/users/get_specific_user/${id}`);
export const getAllTruckDriverUser = () => axios.get(`/users/get_all_user_truck_driver`);
export const getAllUser = () => axios.get(`/users/get_all_user`);
export const deleteUser = (id) => axios.delete(`/users/delete_user/${id}`);
export const updateUser = (id, data) => axios.put(`/users/update_user/${id}`,data);
export const updateUserProfile = (id, data) => axios.put(`/users/update_user_profile/${id}`,data);
export const updateUserResident = (id, data) => axios.put(`/users/update_user_resident/${id}`,data);
export const updateUserPassword = (id, data) => axios.put(`/users/update_user_password/${id}`,data);
export const updateUserPasswordAdmin = (id, data) => axios.put(`/users/update_user_password_admin/${id}`,data);
export const createUser = (data) => axios.post(`/users/add_user`,data);
export const verifyUser = (id, data) => axios.put(`/users/update_user_verified/${id}`, data);
export const createRoleAction = (data) => axios.post(`/actions/add_role_action`,data);
export const getAllRoleAction = () => axios.get(`/actions/get_all_role_action`);
export const getSpecificRoleAction = (id) => axios.get(`/actions/get_specific_role_action/${id}`);
export const deleteRoleAction = (id) => axios.delete(`/actions/delete_role_action/${id}`);
export const updateRoleAction = (id, data) => axios.put(`/actions/update_role_action/${id}`, data);
export const getAllLoginLog = () => axios.get(`/logs/get_all_login_log`);
export const generateReportLoginLog = (data) => axios.post(`/generate_reports/generate_report_login_log`, data, { responseType: 'blob' });
export const generateReportLoginLogSpecificUser = (id, data) => axios.post(`/generate_reports/generate_report_login_log_specific_user/${id}`, data, { responseType: 'blob' });
export const createRoute = (data) => axios.post(`/routes/add_route`,data);
export const getAllRoute = () => axios.get(`/routes/get_all_route`);
export const getSpecificRoute = (id) => axios.get(`/routes/get_specific_route/${id}`);
export const deleteRoute = (id) => axios.delete(`/routes/delete_route/${id}`);
export const updateRoute = (id, data) => axios.put(`/routes/update_route/${id}`, data);
export const createSchedule = (data) => axios.post(`/schedules/add_schedule`,data);
export const getAllSchedule = () => axios.get(`/schedules/get_all_schedule`);
export const getSpecificSchedule = (id) => axios.get(`/schedules/get_specific_schedule/${id}`);
export const getAllScheduleSpecificBarangay = (id) => axios.get(`/schedules/get_all_schedule_specific_barangay/${id}`);
export const deleteSchedule= (id) => axios.delete(`/schedules/delete_schedule/${id}`);
export const updateSchedule = (id, data) => axios.put(`/schedules/update_schedule/${id}`,data);
export const updateScheduleApproval = (id, data) => axios.put(`/schedules/update_schedule_approval/${id}`,data);
export const createTruck = (data) => axios.post(`/trucks/add_truck`,data);
export const getAllTruck = () => axios.get(`/trucks/get_all_truck`);
export const getSpecificTruck = (id) => axios.get(`/trucks/get_specific_truck/${id}`);
export const deleteTruck = (id) => axios.delete(`/trucks/delete_truck/${id}`);
export const updateTruck = (id, data) => axios.put(`/trucks/update_truck/${id}`, data);
export const createComplain = (data) => axios.post(`/complains/add_complain`,data);
export const getAllComplain = () => axios.get(`/complains/get_all_complain`);
export const getSpecificComplain = (id) => axios.get(`/complains/get_specific_complain/${id}`);
export const getAllComplainSpecificBarangay = (id) => axios.get(`/complains/get_all_complain_specific_barangay/${id}`);
export const deleteComplain= (id) => axios.delete(`/complains/delete_complain/${id}`);
export const updateComplain = (id, data) => axios.put(`/complains/update_complain/${id}`, data);
export const updateComplainVerification = (id, data) => axios.put(`/complains/update_complain_verification/${id}`, data);
export const createBarangay = (data) => axios.post(`/barangays/add_barangay`,data);
export const getAllBarangay = () => axios.get(`/barangays/get_all_barangay`);
export const getSpecificBarangay = (id) => axios.get(`/barangays/get_specific_barangay/${id}`);
export const deleteBarangay = (id) => axios.delete(`/barangays/delete_barangay/${id}`);
export const updateBarangay = (id, data) => axios.put(`/barangays/update_barangay/${id}`, data);



export const getAllResidentUser = () => axios.get(`/residents/get_all_user`);
export const updateResidentUserPasswordAdmin = (id, data) => axios.put(`/residents/update_user_password_admin/${id}`,data);
export const updateResidentUserPassword = (id, data) => axios.put(`/residents/update_user_password/${id}`,data);
export const deleteResidentUser = (id) => axios.delete(`/residents/delete_user/${id}`);
export const updateResidentUser = (id, data) => axios.put(`/residents/update_user/${id}`,data);
export const createResidentUser = (data) => axios.post(`/residents/add_user`,data);
export const getSpecificResidentUser = (id) => axios.get(`/residents/get_specific_user/${id}`);
export const loginResidentUser = (data) => axios.post('/residents/login_user', data);



export const createRequest = (data) => axios.post(`/requests/add_request`,data);
export const getAllRequest = () => axios.get(`/requests/get_all_request`);
export const getSpecificRequest = (id) => axios.get(`/requests/get_specific_request/${id}`);
export const deleteRequest = (id) => axios.delete(`/requests/delete_request/${id}`);
export const updateRequest = (id, data) => axios.put(`/requests/update_request/${id}`, data);
export const updateRequestApproval = (id, data) => axios.put(`/requests/update_request_approval/${id}`, data);


