import React, { useState, useEffect, useContext } from 'react';
import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiBook,
    FiLock,
    FiUser,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiCheck,
    FiX,
    FiEye
} from 'react-icons/fi';


import { getAllRequest, updateRequestApproval, createUser } from "../../hooks/request_hook";
import { toast } from "react-toastify";

import { AuthContext } from '../../context/AuthContext';

const UserRequestApprovalLayout = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [roleActions, setRoleActions] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [editingUsers, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        update_password: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        gender: '',
        contact_number: '',
        role: '',
        barangay: '',
        role_action: '',
        role_action_name: '',
        status: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data, success } = await getAllRequest();
            if (success === true) {
                setRoleActions(data.role_actions?.data || [])
                setUsers(data.requests?.data || [])
                setBarangays(data.barangays?.data || [])
                setFilteredUsers(data.requests?.data || [])
            }
        } catch (err) {
            console.error("Error fetching reg data:", err);
            toast.error("Failed to load registration data");
        }
    };

    useEffect(() => {
        filterUsers();
    }, [searchTerm, statusFilter, users]);

    const filterUsers = () => {
        let filtered = users;

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(user =>
                user.status?.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.middle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.gender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.contact_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.role?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredUsers(filtered);
    };

    const handleApprove = async (userId) => {
        if (window.confirm('Are you sure you want to approve this user request?')) {
            try {
                const input_data = {
                    status: 'Approved',
                    user: user._id
                };

                const { data, success } = await updateRequestApproval(userId, input_data);
                if (success === true) {
                    toast.success("User request approved successfully");
                    fetchData();
                } else {
                    toast.error(data?.message || "Failed to approve request");
                }
            } catch (error) {
                console.error('Approve failed:', error);
                toast.error('Failed to approve user request');
            }
        }
    };

    const handleCancel = async (userId) => {
        if (window.confirm('Are you sure you want to cancel this user request?')) {
            try {
                const input_data = {
                    status: 'Cancelled',
                    user: user._id
                };

                const { data, success } = await updateRequestApproval(userId, input_data);
                if (success === true) {
                    toast.success("User request cancelled successfully");
                    fetchData();
                } else {
                    toast.error(data?.message || "Failed to cancel request");
                }
            } catch (error) {
                console.error('Cancel failed:', error);
                toast.error('Failed to cancel user request');
            }
        }
    };



    const getStatusBadge = (user) => {
        const status = user.status?.toLowerCase();
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";

        switch (status) {
            case 'approved':
                return (
                    <span className={`${baseClasses} bg-green-100 text-green-800 border border-green-200`}>
                        <FiCheck className="inline w-3 h-3 mr-1" />
                        Approved
                    </span>
                );
            case 'cancelled':
                return (
                    <span className={`${baseClasses} bg-red-100 text-red-800 border border-red-200`}>
                        <FiX className="inline w-3 h-3 mr-1" />
                        Cancelled
                    </span>
                );
            case 'pending':
            default:
                return (
                    <span className={`${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`}>
                        <FiClock className="inline w-3 h-3 mr-1" />
                        Pending
                    </span>
                );
        }
    };

    const getActionButtons = (user) => {
        const status = user.status?.toLowerCase();

        switch (status) {
            case 'pending':
            case 'approved':
            case 'cancelled':
                return (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleApprove(user._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve Request"
                        >
                            <FiCheck className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleCancel(user._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Request"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                        {/* <button
                            onClick={() => handleCancel(user._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Request"
                        >
                            <FiClock className="w-4 h-4"  />
                        </button> */}
                        <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                        >
                            <FiEye className="w-4 h-4" />
                        </button>
                    </div>
                );
            default:
                return (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                        >
                            <FiEye className="w-4 h-4" />
                        </button>
                    </div>
                );
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'role') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                role_action: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const input_data = {
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
            middle_name: formData.middle_name,
            last_name: formData.last_name,
            gender: formData.gender,
            contact_number: formData.contact_number,
            role: formData.role,
            role_action: formData.role_action,
            barangay: formData.barangay,
            status: formData.status,
        };


        try {
            const { data, success } = await createUser(input_data);

            if (data && success === false) {
                toast.error(data.message || "Failed to create user");
            }

            if (success === true) {
                toast.success(data.data);
                fetchData();
            }
        } catch (error) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.message || error.message || "Failed to create user");
            } else {
                toast.error("Failed to create user");
            }
        }

        resetForm();
        setShowModal(false);
        setShowModalPassword(false);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            password: user.password,
            gender: user.gender,
            contact_number: user.contact_number,
            role: user.role,
            barangay: user.barangay,
            status: user.status,
            role_action: user?.role_action?._id || "",
        });
        setShowModal(true);
    };



    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            first_name: '',
            middle_name: '',
            last_name: '',
            gender: '',
            contact_number: '',
            role: '',
            barangay: '',
            status: '',
            role_action: ''
        });
        setEditingUser(null);
    };

    const formatRole = (role) => {
        const roleMap = {
            'admin': 'Admin',
            'resident': 'Resident',
            'enro_staff': 'ENRO Staff',
            'enro_staff_monitoring': 'ENRO Staff Monitoring',
            'enro_staff_scheduler': 'ENRO Staff Scheduler',
            'enro_staff_head': 'ENRO Staff Head',
            'enro_staff_eswm_section_head': 'ENRO Staff ESWM Section Head',
            'barangay_official': 'Barangay Official',
            'garbage_collector': 'Garbage Collector'
        };
        return roleMap[role] || role;
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header Section */}
                {/* <div className="flex justify-end items-center">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <FiPlus className="w-4 h-4" />
                        <span>Add New User</span>
                    </button>
                </div> */}

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="all">All Status ({users.length})</option>
                                <option value="pending">Pending ({users.filter(user => user.status === 'Pending').length})</option>
                                <option value="approved">Approved ({users.filter(user => user.status === 'Approved').length})</option>
                                <option value="cancelled">Cancelled ({users.filter(user => user.status === 'Cancelled').length})</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Gender
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email Address
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user.first_name} {user.middle_name} {user.last_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{formatRole(user.role)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(user)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900 capitalize">
                                                {user.gender}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user.contact_number}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getActionButtons(user)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <FiBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No user requests found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'No user requests pending approval'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit/Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[700px] max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingUsers ? 'User Request Information' : 'Add New User'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <FiXCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* First Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            required
                                            disabled
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            placeholder="Enter First Name"
                                        />
                                    </div>

                                    {/* Middle Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Middle Name
                                        </label>
                                        <input
                                            type="text"
                                            name="middle_name"
                                            value={formData.middle_name}
                                            onChange={handleInputChange}
                                            required
                                            disabled
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            placeholder="Enter Middle Name"
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            required
                                            disabled
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            placeholder="Enter Last Name"
                                        />
                                    </div>

                                    {/* Contact Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Number
                                        </label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                +63
                                            </span>
                                            <input
                                                type="tel"
                                                name="contact_number"
                                                disabled
                                                value={formData.contact_number}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, '');
                                                    if (value.length > 10) {
                                                        value = value.slice(0, 10);
                                                    }
                                                    handleInputChange({
                                                        target: {
                                                            name: 'contact_number',
                                                            value: value
                                                        }
                                                    });
                                                }}
                                                required
                                                className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                placeholder="9123456789"
                                                pattern="\d{10}"
                                                title="Please enter 10-digit Philippine mobile number"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Enter 10-digit number (e.g., 9123456789)</p>
                                    </div>

                                    {/* Email Address */}
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            disabled
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            placeholder="Enter Email Address"
                                        />
                                    </div>

                                    {/* Only show password field when NOT editing */}
                                    {!editingUsers && (
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                disabled
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required={!editingUsers}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                placeholder="Enter Password"
                                            />
                                        </div>
                                    )}

                                    <div className={editingUsers ? "md:col-span-1" : "md:col-span-2"}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Gender
                                        </label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleInputChange}
                                            required
                                            disabled
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        >
                                            <option value="" disabled>Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>

                                     <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Barangay
                                        </label>
                                        <select
                                            name="barangay"
                                            value={formData.barangay}
                                            onChange={handleInputChange}
                                            required
                                            disabled
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        >
                                            <option value="" disabled>Select Barangay</option>
                                            {barangays?.filter(barangay => barangay?._id && barangay?.barangay_name)
                                                .map((barangay) => (
                                                    <option key={barangay._id} value={barangay._id}>
                                                        {barangay.barangay_name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            required
                                            disabled
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        >
                                            <option value="" disabled>Select Role</option>
                                            <option value="admin">Admin</option>
                                            <option value="enro_staff_monitoring">ENRO Staff Monitoring</option>
                                            <option value="enro_staff_scheduler">ENRO Staff Scheduler</option>
                                            <option value="enro_staff_head">ENRO Staff Head</option>
                                            <option value="enro_staff_eswm_section_head">ENRO Staff ESWM Section Head</option>
                                            <option value="barangay_official">Barangay Official</option>
                                            <option value="garbage_collector">Garbage Collector</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role Action
                                        </label>
                                        <select
                                            name="role_action"
                                            value={formData.role_action || ""}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        >
                                            <option value="" disabled>Select Role Action</option>
                                            {roleActions?.filter(role => role?._id && role?.action_name && role?.role == formData.role)
                                                .map((role) => (
                                                    <option key={role._id} value={role._id}>
                                                        {role.action_name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formData.status !== 'Approved'}
                                        className={`px-6 py-2 rounded-lg transition-colors duration-200 font-medium shadow-sm hover:shadow-md ${formData.status !== 'Approved'
                                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                    >
                                        {editingUsers ? 'Create User' : 'Add User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showModalPassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[500px] max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Change Password
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowModalPassword(false);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <FiXCircle className="w-6 h-6" />
                                </button>
                            </div>

                            {/* User Information Section */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">User Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Name:</span>
                                        <p className="font-medium text-gray-800">
                                            {formData?.first_name} {formData?.middle_name} {formData?.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Gender:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {formData?.gender}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Role:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {formatRole(formData?.role)}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-gray-500">Role Action:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {formData?.role_action_name}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-gray-500">Contact:</span>
                                        <p className="font-medium text-gray-800">
                                            {formData?.contact_number || 'Not provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Email Address:</span>
                                        <p className="font-medium text-gray-800">
                                            {formData?.email || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Password Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="update_password"
                                            value={formData.update_password || ''}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                            placeholder="Enter New Password"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModalPassword(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserRequestApprovalLayout;