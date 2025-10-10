import React, { useState, useEffect } from 'react';
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
    FiXCircle
} from 'react-icons/fi';

import { getAllUser, deleteUser, updateUser, createUser, updateUserPassword } from "../../hooks/user_management_hook";

import { toast } from "react-toastify";

const UserManagementLayout = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [editingUsers, setEditingUser] = useState(null);
    const [editingUserPassword, setEditingUserPassword] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        update_password: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        gender: '',
        contact_number: '',
        role: ''
    });


    useEffect(() => {
        fetchData();
    }, []);


    const fetchData = async () => {
        try {
            const { data, success } = await getAllUser();

            if (success === true) {
                setUsers(data.data)
                setFilteredUsers(data.data)
            }

        } catch (err) {
            console.error("Error fetching reg data:", err);
            toast.error("Failed to load registration data");
        }
    };

    useEffect(() => {
        filterUsers();
    }, [searchTerm, users]);

    const filterUsers = () => {
        let filtered = users;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.middle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.contact_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.role.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredUsers(filtered);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
            role: formData.role
        };

        if (editingUserPassword) {
            try {
                const input_data2 = {
                    password: formData.update_password,
                };

                const { data, success } = await updateUserPassword(editingUserPassword._id, input_data2);

                if (data && success === false) {
                    toast.error(data.message || "Failed to update user password");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to update user password");
                } else {
                    toast.error("Failed to update user password");
                }
            }
        } else if (editingUsers) {
            try {
                const { data, success } = await updateUser(editingUsers._id, input_data);

                if (data && success === false) {
                    toast.error(data.message || "Failed to create user");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to update user");
                } else {
                    toast.error("Failed to update user");
                }
            }
        } else {
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
            gender: user.gender,
            contact_number: user.contact_number,
            role: user.role
        });

        setShowModal(true);
    };

    const handleEditPassword = (user) => {
        setEditingUserPassword(user)
        setFormData({
            email: user.email,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            gender: user.gender,
            contact_number: user.contact_number,
            role: user.role
        });

        setShowModalPassword(true);
    };



    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const { data, success } = await deleteUser(id);

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete user');
            }
        }
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
            role: ''
        });

        setEditingUser(null);
        setEditingUserPassword(null);
    };


    const formatRole = (role) => {
        const roleMap = {
            'admin': 'Admin',
            'resident': 'Resident',
            'enro_staff': 'ENRO Staff',
            'barangay_official': 'Barangay Official',
            'garbage_collector': 'Garbage Collector'
        };

        return roleMap[role] || role; // Return formatted role or original if not found
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex justify-end">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <FiPlus className="w-4 h-4" />
                        <span>Add New User</span>
                    </button>
                </div>


                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="search user"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
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
                                            <span className="text-sm text-gray-900">{user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase() : ''}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user.contact_number}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditPassword(user)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Change Password"
                                                >
                                                    <FiLock className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
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
                            <p className="text-gray-500 text-lg">No user found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {searchTerm
                                    ? 'Try adjusting your search or filters'
                                    : 'Get started by adding your first user'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[700px] max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingUsers ? 'Edit User' : 'Add New User'}
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
                                {/* 2-Column Grid for Form Fields */}
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
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            placeholder="Enter Last Name"
                                        />
                                    </div>

                                    {/* Contact Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Number
                                        </label>
                                        <input
                                            type="text"
                                            name="contact_number"
                                            value={formData.contact_number}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            placeholder="Enter Contact Number"
                                        />
                                    </div>

                                    {/* Email Address - Full Width */}
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
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            placeholder="Enter Email Address"
                                        />
                                    </div>


                                    {/* Only show password field when NOT editing (creating new user) */}
                                    {!editingUsers && (
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required={!editingUsers} // Only required for new users
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
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        >
                                            <option value="" disabled>Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
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
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        >
                                            <option value="" disabled>Select Role</option>
                                            <option value="admin">Admin</option>
                                            <option value="enro_staff">ENRO Staff</option>
                                            <option value="barangay_official">Barangay Official</option>
                                            <option value="garbage_collector">Garbage Collector</option>
                                            {editingUsers && <option value="resident">Resident</option>}
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
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                                    >
                                        {editingUsers ? 'Update User' : 'Add User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}


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
                                        <span className="text-gray-500">Role:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                           {formatRole(formData?.role)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Gender:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {formData?.gender}
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

                                {/* Password Requirements */}
                                {/* <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                    <h4 className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</h4>
                                    <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• At least 6 characters long</li>
                                        <li>• Include uppercase and lowercase letters</li>
                                        <li>• Include numbers and special characters</li>
                                    </ul>
                                </div> */}

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

export default UserManagementLayout;