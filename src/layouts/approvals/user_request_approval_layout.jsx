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
    FiEye,
    FiShuffle,
    FiAlertCircle
} from 'react-icons/fi';
import Select from 'react-select';

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
    const [selectedRole, setSelectedRole] = useState('');
    const [roleActionsMap, setRoleActionsMap] = useState({});

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
        multiple_role: [],
        barangay: '',
        role_action: '',
        role_action_name: '',
        status: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'enro_staff_monitoring', label: 'ENRO Staff Monitoring' },
        { value: 'enro_staff_scheduler', label: 'ENRO Staff Scheduler' },
        { value: 'enro_staff_head', label: 'ENRO Staff Head' },
        { value: 'enro_staff_eswm_section_head', label: 'ENRO ESWM Section Head' },
        { value: 'barangay_official', label: 'Barangay Official' },
        { value: 'garbage_collector', label: 'Garbage Collector' },
    ];

    // Check if ALL role actions are selected
    const areAllRoleActionsSelected = () => {
        if (!formData.multiple_role || formData.multiple_role.length === 0) {
            return false;
        }
        
        // Check if every role has a non-empty role action
        return formData.multiple_role.every(roleObj => {
            const roleValue = typeof roleObj === 'object' ? roleObj.role : roleObj;
            const roleAction = roleActionsMap[roleValue];
            return roleAction && roleAction !== '';
        });
    };

    // Get roles that are missing actions
    const getRolesMissingActions = () => {
        if (!formData.multiple_role || formData.multiple_role.length === 0) {
            return [];
        }
        
        return formData.multiple_role.filter(roleObj => {
            const roleValue = typeof roleObj === 'object' ? roleObj.role : roleObj;
            const roleAction = roleActionsMap[roleValue];
            return !roleAction || roleAction === '';
        }).map(roleObj => {
            const roleValue = typeof roleObj === 'object' ? roleObj.role : roleObj;
            const option = roleOptions.find(opt => opt.value === roleValue);
            return option?.label || roleValue;
        });
    };

    // Check if all required fields are filled
    const isFormValid = () => {
        const hasRoles = formData.multiple_role && formData.multiple_role.length > 0;
        const allRoleActionsFilled = areAllRoleActionsSelected();
        const isApproved = formData.status === 'Approved';
        
        return hasRoles && allRoleActionsFilled && isApproved;
    };

    // Get available roles from multiple_role for switching
    const getAvailableRoles = () => {
        if (!formData.multiple_role || !Array.isArray(formData.multiple_role)) {
            return [];
        }

        return formData.multiple_role
            .filter(roleObj => {
                const roleValue = typeof roleObj === 'object' ? roleObj.role : roleObj;
                return roleOptions.some(opt => opt.value === roleValue);
            })
            .map(roleObj => {
                const roleValue = typeof roleObj === 'object' ? roleObj.role : roleObj;
                const option = roleOptions.find(opt => opt.value === roleValue);
                return {
                    value: roleValue,
                    label: option?.label || roleValue,
                    role_action: typeof roleObj === 'object' ? roleObj.role_action : null
                };
            });
    };

    const getSelectedOptions = (roleValues) => {
        if (!roleValues || !Array.isArray(roleValues)) {
            return [];
        }

        return roleValues.map(roleObj => {
            const roleValue = typeof roleObj === 'object' ? roleObj.role : roleObj;
            const option = roleOptions.find(opt => opt.value === roleValue);
            return option || { value: roleValue, label: roleValue };
        });
    };

    const handleSelectChange = (selectedOptions) => {
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

        // Reset selected role when multiple roles change
        setSelectedRole('');
    };

    // Handle role switching for role actions
    const handleRoleSwitch = (role) => {
        setSelectedRole(role);

        // Find the role action for the selected role
        const roleObj = formData.multiple_role?.find(r =>
            typeof r === 'object' ? r.role === role : r === role
        );

        const roleActionId = typeof roleObj === 'object' ? roleObj.role_action?.$oid || '' : '';

        setFormData(prev => ({
            ...prev,
            role_action: roleActionId
        }));
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
            const { data, success } = await getAllRequest();
            if (success === true) {
                setRoleActions(data.role_actions?.data || []);
                setUsers(data.requests?.data || []);
                setBarangays(data.barangays?.data || []);
                setFilteredUsers(data.requests?.data || []);
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

        if (statusFilter !== 'all') {
            filtered = filtered.filter(user =>
                user.status?.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.middle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.gender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.contact_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${user?.first_name} ${user?.middle_name} ${user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        const multipleRoleWithActions = formData.multiple_role.map(roleObj => {
            const roleValue = typeof roleObj === 'object' ? roleObj.role : roleObj;

            // Get role action from the map
            const roleAction = roleActionsMap[roleValue] || '';

            // If it's already an object with _id, update the role_action
            if (typeof roleObj === 'object' && roleObj._id) {
                return {
                    ...roleObj, // Keep existing properties like _id
                    role_action: roleAction || null
                };
            } else {
                // If it's just a string, create the full object structure
                return {
                    role: roleValue,
                    role_action: roleAction || null
                };
            }
        });

        const firstRoleAction = multipleRoleWithActions.length > 0
            ? multipleRoleWithActions[0].role_action
            : null;

        const input_data = {
            email: formData.email,
            password: formData.password,
            first_name: formData.first_name,
            middle_name: formData.middle_name,
            last_name: formData.last_name,
            gender: formData.gender,
            contact_number: formData.contact_number,
            roles: multipleRoleWithActions, // Send complete array with role actions
            role_action: firstRoleAction, // Keep for backward compatibility
            barangay: formData.barangay,
        };

        try {
            const { data, success } = await createUser(input_data);

            if (data && success === false) {
                toast.error(data.message || "Failed to create user");
            }

            if (success === true) {
                toast.success("User created successfully");
                fetchData();
                setShowModal(false);
                resetForm();
            }
        } catch (error) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.message || error.message || "Failed to create user");
            } else {
                toast.error("Failed to create user");
            }
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        const initialData = {
            email: user.email,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            password: user.password,
            gender: user.gender,
            contact_number: user.contact_number,
            role: user.role,
            multiple_role: user.multiple_role,
            barangay: user.barangay,
            status: user.status,
            role_action: user?.role_action?._id || "",
        };

        setFormData(initialData);

        // Initialize role actions map from existing data
        const initialRoleActionsMap = {};
        if (user.multiple_role && Array.isArray(user.multiple_role)) {
            user.multiple_role.forEach(roleObj => {
                const roleValue = typeof roleObj === 'object' ? roleObj.role : roleObj;
                const roleAction = typeof roleObj === 'object' ? roleObj.role_action?.$oid || '' : '';
                initialRoleActionsMap[roleValue] = roleAction;
            });
        }
        setRoleActionsMap(initialRoleActionsMap);

        // Set the first role as selected by default
        const availableRoles = getAvailableRolesFromData(initialData.multiple_role);
        if (availableRoles.length > 0) {
            setSelectedRole(availableRoles[0].value);
        }

        setShowModal(true);
    };

    // Helper function to get available roles from data
    const getAvailableRolesFromData = (multipleRole) => {
        if (!multipleRole || !Array.isArray(multipleRole)) {
            return [];
        }

        return multipleRole
            .filter(roleObj => {
                const roleValue = typeof roleObj === 'object' ? roleObj.role : roleObj;
                return roleOptions.some(opt => opt.value === roleValue);
            })
            .map(roleObj => {
                const roleValue = typeof roleObj === 'object' ? roleObj.role : roleObj;
                const option = roleOptions.find(opt => opt.value === roleValue);
                return {
                    value: roleValue,
                    label: option?.label || roleValue,
                    role_action: typeof roleObj === 'object' ? roleObj.role_action : null
                };
            });
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
        setSelectedRole('');
        setRoleActionsMap({});
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

    const availableRoles = getAvailableRoles();
    const isSubmitDisabled = !isFormValid();
    const rolesMissingActions = getRolesMissingActions();
    const allActionsFilled = areAllRoleActionsSelected();

    return (
        <>
            <div className="space-y-6">
                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
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

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                                            <span className="text-sm text-gray-900 capitalize">{user.gender}</span>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Middle Name</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                                        <div className="flex">
                                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+63</span>
                                            <input
                                                type="tel"
                                                name="contact_number"
                                                disabled
                                                value={formData.contact_number}
                                                onChange={(e) => {
                                                    let value = e.target.value.replace(/\D/g, '');
                                                    if (value.length > 10) value = value.slice(0, 10);
                                                    handleInputChange({ target: { name: 'contact_number', value: value } });
                                                }}
                                                required
                                                className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                placeholder="9123456789"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Enter 10-digit number (e.g., 9123456789)</p>
                                    </div>

                                    {/* Email Address */}
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
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

                                    {/* Password */}
                                    {!editingUsers && (
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
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

                                    {/* Gender */}
                                    <div className={editingUsers ? "md:col-span-1" : "md:col-span-2"}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
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

                                    {/* Barangay */}
                                    {formData.barangay && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Barangay</label>
                                            <select
                                                name="barangay"
                                                value={formData.barangay || ''}
                                                onChange={handleInputChange}
                                                required
                                                disabled
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            >
                                                <option value="" disabled>Select Barangay</option>
                                                {barangays?.filter(barangay => barangay?._id && barangay?.barangay_name)
                                                    .map((barangay) => (
                                                        <option key={barangay._id} value={barangay._id}>{barangay.barangay_name}</option>
                                                    ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Multiple Role Selection */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Requested Roles *</label>
                                        <Select
                                            id="multiple_role-select"
                                            name="multiple_role"
                                            isMulti
                                            options={roleOptions}
                                            value={getSelectedOptions(formData.multiple_role)}
                                            onChange={handleSelectChange}
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
                                                                {roleActions
                                                                    ?.filter((action) => action?.role === role.value)
                                                                    .map((action) => (
                                                                        <option key={action._id} value={action._id}>
                                                                            {action.action_name}
                                                                        </option>
                                                                    ))}
                                                            </select>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className={`mt-3 p-3 rounded-lg ${
                                                allActionsFilled 
                                                    ? 'bg-green-50 border border-green-200' 
                                                    : 'bg-red-50 border border-red-200'
                                            }`}>
                                                <p className={`text-xs ${
                                                    allActionsFilled 
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
                                        className={`px-6 py-2 rounded-lg transition-colors duration-200 font-medium shadow-sm hover:shadow-md ${
                                            isSubmitDisabled
                                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                    >
                                        {editingUsers ? 'Create User' : 'Add User'}
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
                                            {formData.status !== 'Approved' && (
                                                <li>• Request status is not "Approved"</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserRequestApprovalLayout;