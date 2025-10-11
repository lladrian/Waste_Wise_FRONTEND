import React, { useState, useEffect } from 'react';
import Select from 'react-select';
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

import { updateRoleAction, deleteRoleAction, getAllRoleAction, createRoleAction, getSpecificRoleAction } from "../../hooks/permission_management_hook";

import { toast } from "react-toastify";

const UserManagementLayout = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [editingUsers, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        action_name: '',
        permission: []
    });

    useEffect(() => {
        fetchData();
    }, []);


    const fetchData = async () => {
        try {
            const { data, success } = await getAllRoleAction();
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
                user.action_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredUsers(filtered);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        const permissionValues = formData.permission ? formData.permission.map(option =>
            typeof option === 'string' ? option : option.value
        ) : [];

        const input_data = {
            action_name: formData.action_name,
            permission: permissionValues
        };

        if (editingUsers) {
            try {
                const { data, success } = await updateRoleAction(editingUsers._id, input_data);

                if (data && success === false) {
                    toast.error(data.message || "Failed to update role action");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to update role action");
                } else {
                    toast.error("Failed to update role action");
                }
            }
        } else {
            try {
                const { data, success } = await createRoleAction(input_data);

                if (data && success === false) {
                    toast.error(data.message || "Failed to create role action");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to create role action");
                } else {
                    toast.error("Failed to create role action");
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
            action_name: user.action_name,
            permission: user.permission || []
        });

        setShowModal(true);
    };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const { data, success } = await deleteRoleAction(id);

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
            action_name: '',
            permission: []
        });

        setEditingUser(null);
    };


    const permissionOptions = [
        { value: 'create_user', label: 'Create User' },
        { value: 'read_user', label: 'Read User' },
        { value: 'update_user', label: 'Update User' },
        { value: 'delete_user', label: 'Delete User' },
        { value: 'create_post', label: 'Create Post' },
        { value: 'read_post', label: 'Read Post' },
        { value: 'update_post', label: 'Update Post' },
        { value: 'delete_post', label: 'Delete Post' },
        { value: 'manage_roles', label: 'Manage Roles' },
        { value: 'view_analytics', label: 'View Analytics' },
        { value: 'system_config', label: 'System Configuration' },
        { value: 'backup_manage', label: 'Manage Backups' },
        // Add more permissions as needed
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle select change - convert option objects back to values
    const handleSelectChange = (selectedOptions) => {
        // Extract just the values from the selected option objects
        const permissionValues = selectedOptions ? selectedOptions.map(option => option.value) : [];

        setFormData(prev => ({
            ...prev,
            permission: permissionValues
        }));
    };

    const getSelectedOptions = (permissionValues) => {
        return permissionValues.map(value => {
            // Find the option object for this value
            const option = permissionOptions.find(opt => opt.value === value);
            // If found, return the option object, otherwise create a fallback
            return option || { value: value, label: value };
        });
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
                                        Role Action Name
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
                                            <span className="text-sm text-gray-900">{user.action_name}</span>
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
                                    {editingUsers ? 'Edit Role Action' : 'Add New Role Action'}
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
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role Action Name
                                        </label>
                                        <input
                                            type="text"
                                            name="action_name"
                                            value={formData.action_name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            placeholder="Enter Role Action Name"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Permission
                                        </label>
                                        <Select
                                            id="permission-select"
                                            name="permission"
                                            isMulti
                                            options={permissionOptions}
                                            value={getSelectedOptions(formData.permission)} // Convert values to option objects
                                            onChange={handleSelectChange}
                                            placeholder="Choose permissions..."
                                            isSearchable
                                            closeMenuOnSelect={false}
                                            styles={{
                                                menu: (base) => ({
                                                    ...base,
                                                    zIndex: 9999
                                                }),
                                                menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999
                                                })
                                            }}
                                            menuPortalTarget={document.body}
                                        />
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
                                        {editingUsers ? 'Update Role Action' : 'Add Role Action'}
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
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Role Action Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Role Action Name:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {formData?.action_name}
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

export default UserManagementLayout;