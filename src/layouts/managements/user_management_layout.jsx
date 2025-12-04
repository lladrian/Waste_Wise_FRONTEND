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
    FiInfo,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle
} from 'react-icons/fi';
import Select from 'react-select';
import { AuthContext } from '../../context/AuthContext';
import { getAllUserNoResident, deleteUser, updateUser, createUserByAdmin, updateUserPasswordAdmin } from "../../hooks/user_management_hook";
import { toast } from "react-toastify";

const UserManagementLayout = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [roleActions, setRoleActions] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [editingUsers, setEditingUser] = useState(null);
    const [editingUserPassword, setEditingUserPassword] = useState(null);
    const [roleActionsMap, setRoleActionsMap] = useState({});
    const [viewingComplains, setViewingComplain] = useState(null);
    const [showModalData, setShowModalData] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        update_password: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        gender: '',
        contact_number: '',
        is_disabled: '',
        role: '',
        multiple_role: [],
        barangay: '',
        barangay_name: '',
        role_action: '',
        role_action_name: '',
    });

    const roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'enro_staff_monitoring', label: 'ENRO Staff Monitoring' },
        { value: 'enro_staff_scheduler', label: 'ENRO Staff Scheduler' },
        { value: 'enro_staff_head', label: 'ENRO Staff Head' },
        { value: 'enro_staff_eswm_section_head', label: 'ENRO ESWM Section Head' },
        { value: 'barangay_official', label: 'Barangay Official' },
        { value: 'garbage_collector', label: 'Garbage Collector' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    // Check if ALL role actions are selected
    const areAllRoleActionsSelected = () => {
        if (!formData.multiple_role || formData.multiple_role.length === 0) {
            return false;
        }

        return formData.multiple_role.every(roleValue => {
            const roleAction = roleActionsMap[roleValue];
            return roleAction && roleAction !== '';
        });
    };

    // Get roles that are missing actions
    const getRolesMissingActions = () => {
        if (!formData.multiple_role || formData.multiple_role.length === 0) {
            return [];
        }

        return formData.multiple_role.filter(roleValue => {
            const roleAction = roleActionsMap[roleValue];
            return !roleAction || roleAction === '';
        }).map(roleValue => {
            const option = roleOptions.find(opt => opt.value === roleValue);
            return option?.label || roleValue;
        });
    };

    // Check if form is valid
    const isFormValid = () => {
        const hasRoles = formData.multiple_role && formData.multiple_role.length > 0;
        const allRoleActionsFilled = areAllRoleActionsSelected();

        return hasRoles && allRoleActionsFilled;
    };

    // Get available roles for display
    const getAvailableRoles = () => {
        if (!formData.multiple_role || !Array.isArray(formData.multiple_role)) {
            return [];
        }

        return formData.multiple_role.map(roleValue => {
            const option = roleOptions.find(opt => opt.value === roleValue);
            return {
                value: roleValue,
                label: option?.label || roleValue,
                role_action: roleActionsMap[roleValue] || ''
            };
        });
    };

    const getSelectedOptions = (roleValues) => {
        if (!roleValues || !Array.isArray(roleValues)) {
            return [];
        }

        return roleValues.map(roleValue => {
            const option = roleOptions.find(opt => opt.value === roleValue);
            return option || { value: roleValue, label: roleValue };
        });
    };

    const handleMultipleRoleChange = (selectedOptions) => {
        const roleValues = selectedOptions ? selectedOptions.map(option => option.value) : [];

        // Initialize role actions map for new roles
        const newRoleActionsMap = {};
        roleValues.forEach(role => {
            if (!roleActionsMap[role]) {
                newRoleActionsMap[role] = '';
            } else {
                newRoleActionsMap[role] = roleActionsMap[role];
            }
        });

        setRoleActionsMap(newRoleActionsMap);

        setFormData(prev => ({
            ...prev,
            multiple_role: roleValues
        }));

        // Check if barangay official is selected
        const hasBarangayOfficial = roleValues.includes('barangay_official');
        if (!hasBarangayOfficial) {
            setFormData(prev => ({
                ...prev,
                barangay: ''
            }));
        }
    };

    // Handle role action changes for individual roles
    const handleRoleActionChange = (role, actionId) => {
        setRoleActionsMap(prev => ({
            ...prev,
            [role]: actionId
        }));
    };

    const fetchData = async () => {
        try {
            const { data, data2, data3, success } = await getAllUserNoResident();
            if (success === true) {
                setBarangays(data3);
                setRoleActions(data2)
                setUsers(data)
                setFilteredUsers(data)
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

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.middle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.contact_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${user.first_name} ${user.middle_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                formatRole(user.role).toLowerCase().includes(searchTerm.toLowerCase()) ||
                user?.role_action?.action_name.toLowerCase().includes(searchTerm.toLowerCase())
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

        // Validate ALL role actions before submission
        if (!areAllRoleActionsSelected()) {
            const missingRoles = getRolesMissingActions();
            toast.error(`Please select role actions for: ${missingRoles.join(', ')}`);
            return;
        }

        // Build the multiple_role array with role actions for each role
        const multipleRoleWithActions = formData.multiple_role.map(roleValue => {
            const roleAction = roleActionsMap[roleValue] || '';

            return {
                role: roleValue,
                role_action: roleAction || null
            };
        });

        const input_data = {
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
            middle_name: formData.middle_name,
            last_name: formData.last_name,
            gender: formData.gender,
            contact_number: formData.contact_number,
            multiple_role: multipleRoleWithActions,
            barangay: formData.barangay,
            is_disabled: formData.is_disabled
        };


        if (editingUserPassword) {
            try {
                const input_data2 = {
                    password: formData.update_password,
                };

                const { data, success } = await updateUserPasswordAdmin(editingUserPassword._id, input_data2);

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
                    toast.error(data.message || "Failed to update user");
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
                const { data, success } = await createUserByAdmin(input_data);

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

    const handleView = (user) => {
        setViewingComplain(user);
        setShowModalData(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);

        // Convert user's multiple_role to array of role values
        const multipleRoleValues = user.multiple_role ?
            user.multiple_role.map(roleObj => typeof roleObj === 'object' ? roleObj.role : roleObj) :
            [user.role];

        // Initialize role actions map from existing data
        const initialRoleActionsMap = {};
        if (user.multiple_role && Array.isArray(user.multiple_role)) {
            user.multiple_role.forEach(roleObj => {
                if (typeof roleObj === 'object') {
                    const roleValue = roleObj.role;
                    // Handle different possible structures for role_action
                    let roleAction = '';

                    if (roleObj.role_action) {
                        if (typeof roleObj.role_action === 'object') {
                            // role_action is an object with _id property
                            roleAction = roleObj.role_action._id || '';
                        } else if (typeof roleObj.role_action === 'string') {
                            // role_action is a string ID
                            roleAction = roleObj.role_action;
                        }
                    }

                    initialRoleActionsMap[roleValue] = roleAction;
                }
            });
        } else {
            // For backward compatibility with single role users
            let roleAction = '';
            if (user.role_action) {
                if (typeof user.role_action === 'object') {
                    roleAction = user.role_action._id || '';
                } else if (typeof user.role_action === 'string') {
                    roleAction = user.role_action;
                }
            }
            initialRoleActionsMap[user.role] = roleAction;
        }

        setRoleActionsMap(initialRoleActionsMap);

        setFormData({
            email: user.email,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            gender: user.gender,
            barangay_name: user?.barangay?.barangay_name,
            barangay: user?.barangay?._id,
            contact_number: user.contact_number,
            role: user.role, // Keep for backward compatibility
            multiple_role: multipleRoleValues,
            is_disabled: String(user.is_disabled)
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
            role: user.role,
            barangay_name: user?.barangay?.barangay_name,
            barangay: user?.barangay?._id,
            role_action: user.role_action || '',
            role_action_name: user?.role_action?.action_name || "None",
            is_disabled: String(user.is_disabled)
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
            role: '',
            multiple_role: [],
            barangay: '',
            barangay_name: '',
            is_disabled: '',
            role_action: ''
        });
        setRoleActionsMap({});
        setEditingUser(null);
        setEditingUserPassword(null);
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

    const availableRoles = getAvailableRoles();
    const isSubmitDisabled = !isFormValid();
    const rolesMissingActions = getRolesMissingActions();
    const allActionsFilled = areAllRoleActionsSelected();
    const hasBarangayOfficial = formData.multiple_role.includes('barangay_official');

    return (
        <>
            <div className="space-y-6">
                {/* Header Section */}
                {['admin'].includes(user.role) && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowModal(true)}
                            disabled={!user?.role_action?.permission?.includes('user_management_create')}
                            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiPlus className="w-4 h-4" />
                            <span>Add New User</span>
                        </button>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
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
                                        Role Action
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
                                {filteredUsers.map((user_orig) => (
                                    <tr key={user_orig._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user_orig.first_name} {user_orig.middle_name} {user_orig.last_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                <span className="text-sm text-gray-900">{formatRole(user_orig.role)}</span>
                                                {user_orig.multiple_role && user_orig.multiple_role.length > 1 && (
                                                    <span className="text-xs text-gray-500">(+{user_orig.multiple_role.length - 1})</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user_orig?.role_action?.action_name || "None"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user_orig.gender ? user_orig.gender.charAt(0).toUpperCase() + user_orig.gender.slice(1).toLowerCase() : ''}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user_orig.contact_number}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user_orig.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {['admin'].includes(user.role) && (
                                                    <button
                                                        onClick={() => handleEdit(user_orig)}
                                                        disabled={!user?.role_action?.permission?.includes('user_management_edit')}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Edit"
                                                    >
                                                        <FiEdit className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {/* <button
                                                    onClick={() => handleEditPassword(user)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Change Password"
                                                >
                                                    <FiLock className="w-4 h-4" />
                                                </button> */}
                                                {['admin'].includes(user.role) && (
                                                    <button
                                                        disabled={!user?.role_action?.permission?.includes('user_management_delete')}
                                                        onClick={() => handleDelete(user_orig._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleView(user_orig)}
                                                    disabled={!user?.role_action?.permission?.includes('user_management_full_view')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors  disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="View Data"
                                                >
                                                    <FiInfo className="w-4 h-4" />
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
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                                +63
                                            </span>
                                            <input
                                                type="tel"
                                                name="contact_number"
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
                                                minLength={10}
                                                maxLength={10}
                                                className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                placeholder="9123456789"
                                                pattern="\d{10}"
                                                title="Please enter 10-digit PH mobile number"
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
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            placeholder="Enter Email Address"
                                        />
                                    </div>

                                    {/* Password */}
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
                                                required={!editingUsers}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                placeholder="Enter Password"
                                            />
                                        </div>
                                    )}

                                    {/* Gender */}
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

                                    {/* Multiple Role Selection */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Roles *
                                        </label>
                                        <Select
                                            id="multiple_role-select"
                                            name="multiple_role"
                                            isMulti
                                            options={roleOptions}
                                            value={getSelectedOptions(formData.multiple_role)}
                                            onChange={handleMultipleRoleChange}
                                            placeholder="Choose roles..."
                                            isSearchable
                                            closeMenuOnSelect={false}
                                            styles={{
                                                menu: (base) => ({ ...base, zIndex: 9999 }),
                                                menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                            }}
                                            menuPortalTarget={document.body}
                                        />
                                    </div>

                                    {/* Barangay */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Barangay
                                        </label>
                                        <select
                                            name="barangay"
                                            value={formData.barangay || ""}
                                            onChange={handleInputChange}
                                            required={hasBarangayOfficial}
                                            disabled={!hasBarangayOfficial}
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
                                        {hasBarangayOfficial && (
                                            <p className="text-xs text-gray-500 mt-1">Barangay selection is required for Barangay Official role</p>
                                        )}
                                    </div>

                                    {/* Role Actions for Multiple Roles */}
                                    {availableRoles.length > 0 && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-800 mb-3">
                                                Set Role Actions for Each Role
                                                {!allActionsFilled && (
                                                    <span className="ml-2 text-red-500 text-xs font-normal flex items-center">
                                                        <FiAlertCircle className="inline w-3 h-3 mr-1" />
                                                        ALL role actions are required
                                                    </span>
                                                )}
                                            </label>

                                            <div className="space-y-4">
                                                {availableRoles.map((role) => {
                                                    const hasAction = roleActionsMap[role.value] && roleActionsMap[role.value] !== '';
                                                    const isMissingAction = !hasAction;

                                                    // Get available actions for this role
                                                    const availableActionsForRole = roleActions?.filter((action) => action?.role === role.value) || [];

                                                    return (
                                                        <div
                                                            key={role.value}
                                                            className={`flex flex-col sm:flex-row sm:items-center justify-between 
                           p-4 rounded-xl border transition-all duration-300
                           ${hasAction
                                                                    ? 'border-green-200 bg-green-50'
                                                                    : isMissingAction
                                                                        ? 'border-red-200 bg-red-50'
                                                                        : 'border-gray-100 bg-white'
                                                                }
                           shadow-sm hover:shadow-md gap-4`}
                                                        >
                                                            {/* Left Section */}
                                                            <div className="flex items-center space-x-3">
                                                                <FiUser className={`w-6 h-6 ${hasAction ? 'text-green-500' : isMissingAction ? 'text-red-500' : 'text-indigo-400'}`} />
                                                                <span className="font-medium text-gray-800 text-sm sm:text-base">
                                                                    {role.label}
                                                                </span>
                                                                {hasAction && (
                                                                    <FiCheckCircle className="w-4 h-4 text-green-500" />
                                                                )}
                                                                {isMissingAction && (
                                                                    <FiAlertCircle className="w-4 h-4 text-red-500" />
                                                                )}
                                                            </div>

                                                            {/* Select Menu */}
                                                            <select
                                                                value={roleActionsMap[role.value] || ''}
                                                                onChange={(e) => handleRoleActionChange(role.value, e.target.value)}
                                                                className={`border rounded-lg px-3 py-2 
                               shadow-sm hover:shadow transition-all
                               focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                               w-full sm:w-60
                               ${hasAction
                                                                        ? 'border-green-300 bg-white'
                                                                        : isMissingAction
                                                                            ? 'border-red-300 bg-white'
                                                                            : 'border-gray-300 bg-gradient-to-r from-gray-50 to-white'
                                                                    }`}
                                                            >
                                                                <option value="">No Action</option>
                                                                {availableActionsForRole.map((action) => (
                                                                    <option key={action._id} value={action._id}>
                                                                        {action.action_name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className={`mt-3 p-3 rounded-lg ${allActionsFilled
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-red-50 border border-red-200'
                                                }`}>
                                                <p className={`text-xs ${allActionsFilled
                                                    ? 'text-green-700'
                                                    : 'text-red-700'
                                                    }`}>
                                                    {allActionsFilled
                                                        ? `✓ All ${availableRoles.length} role actions configured`
                                                        : `⚠ ${rolesMissingActions.length} role(s) missing actions: ${rolesMissingActions.join(', ')}`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Account State */}
                                    {editingUsers && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Account State
                                            </label>
                                            <select
                                                name="is_disabled"
                                                value={formData.is_disabled}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            >
                                                <option value="" disabled>Select Status</option>
                                                <option value="false">Enabled</option>
                                                <option value="true">Disabled</option>
                                            </select>
                                        </div>
                                    )}
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
                                        disabled={isSubmitDisabled}
                                        className={`px-6 py-2 rounded-lg transition-colors duration-200 font-medium shadow-sm hover:shadow-md ${isSubmitDisabled
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                    >
                                        {editingUsers ? 'Update User' : 'Add User'}
                                    </button>
                                </div>

                                {/* Validation Summary */}
                                {isSubmitDisabled && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 text-red-700">
                                            <FiAlertCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Cannot submit form because:</span>
                                        </div>
                                        <ul className="text-xs text-red-600 mt-2 space-y-1">
                                            {!formData.multiple_role || formData.multiple_role.length === 0 && (
                                                <li>• No roles selected</li>
                                            )}
                                            {(!allActionsFilled) && (
                                                <li>• Not all role actions are configured</li>
                                            )}
                                            {rolesMissingActions.length > 0 && (
                                                <li>• Missing actions for: {rolesMissingActions.join(', ')}</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
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
                                        <span className="text-gray-500">Gender:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {formData?.gender}
                                        </p>
                                    </div>

                                    {formData?.barangay && (
                                        <div>
                                            <span className="text-gray-500">Barangay:</span>
                                            <p className="font-medium text-gray-800 capitalize">
                                                {formData.barangay_name}
                                            </p>
                                        </div>
                                    )}

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
                                        <span className="text-gray-500">Account State:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {formData?.is_disabled === 'true' ? 'Disabled' : 'Enabled'}
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


            {showModalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[800px] max-w-[800px] max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-end items-center mb-6">
                                {/* <h2 className="text-xl font-bold text-gray-800">Complain Details</h2> */}
                                <button
                                    onClick={() => {
                                        setShowModalData(false);
                                        setViewingComplain(null);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <FiXCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">User Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Complete Name:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {viewingComplains?.first_name} {viewingComplains?.middle_name} {viewingComplains?.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Gender:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {viewingComplains?.gender}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Role:</span>
                                        <p className="font-medium text-gray-800">
                                            {formatRole(viewingComplains?.role)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Contact Number:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingComplains?.contact_number}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Email Address:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingComplains?.email}
                                        </p>
                                    </div>
                                    {/* <div>
                                                    <span className="text-gray-500">Verification Status:</span>
                                                    <p className={`font-medium ${viewingComplains?.user?.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                                                        {viewingComplains?.user?.is_verified ? 'Verified' : 'Unverified'}
                                                    </p>
                                                </div> */}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                                <button
                                    onClick={() => {
                                        setShowModalData(false);
                                        setViewingComplain(null);
                                        resetForm();
                                    }}
                                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserManagementLayout;