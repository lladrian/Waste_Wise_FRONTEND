import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiBook,
    FiInfo,
    FiLock,
    FiUser,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiArchive
} from 'react-icons/fi';

import { getSpecificComplain, createComplain, getAllComplain, deleteComplain, updateComplain } from "../../hooks/complain_hook";

import { toast } from "react-toastify";

const ComplainManagementLayout = () => {
    const [complains, setComplains] = useState([]);
    const [users, setUsers] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [filteredComplains, setFilteredComplains] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [complainTypeFilter, setComplainTypeFilter] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('');
    const [archiveFilter, setArchiveFilter] = useState(''); // Archive filter state
    const [showModal, setShowModal] = useState(false);
    const [showModalData, setShowModalData] = useState(false);
    const [editingComplains, setEditingComplain] = useState(null);
    const [viewingComplains, setViewingComplain] = useState(null);

    const [formData, setFormData] = useState({
        route: '',
        user: '',
        complain_content: '',
        complain_type: '',
        archived: '',
        resolution_status: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data, success } = await getAllComplain();
            if (success === true) {
                setUsers(data.users.data)
                setRoutes(data.routes.data)
                setComplains(data.complains.data)
                setFilteredComplains(data.complains.data)
            }
        } catch (err) {
            console.error("Error fetching reg data:", err);
            toast.error("Failed to load registration data");
        }
    };

    useEffect(() => {
        filterComplains();
    }, [searchTerm, complainTypeFilter, userRoleFilter, archiveFilter, complains]); // Added archiveFilter dependency

    const filterComplains = () => {
        let filtered = complains;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(complain =>
                complain.complain_content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                complain.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                complain.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                complain.route.route_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Complain type filter
        if (complainTypeFilter) {
            filtered = filtered.filter(complain =>
                complain.complain_type === complainTypeFilter
            );
        }

        // User role filter
        if (userRoleFilter) {
            filtered = filtered.filter(complain =>
                complain.user.role === userRoleFilter
            );
        }

        // Archive filter
        if (archiveFilter) {
            if (archiveFilter === 'archived') {
                filtered = filtered.filter(complain => complain.archived === true);
            } else if (archiveFilter === 'active') {
                filtered = filtered.filter(complain => complain.archived === false);
            }
        }

        setFilteredComplains(filtered);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const input_data = {
            route: formData.route,
            user: formData.user,
            complain_content: formData.complain_content,
            complain_type: formData.complain_type,
            resolution_status: formData.resolution_status,
            archived: formData.archived
        };

        if (editingComplains) {
            try {
                const { data, success } = await updateComplain(editingComplains._id, input_data);

                if (data && success === false) {
                    toast.error(data.message || "Failed to update complain");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to update complain");
                } else {
                    toast.error("Failed to update complain");
                }
            }
        } else {
            try {
                const { data, success } = await createComplain(input_data);

                if (data && success === false) {
                    toast.error(data.message || "Failed to create complain");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to create complain");
                } else {
                    toast.error("Failed to create complain");
                }
            }
        }

        resetForm();
        setShowModal(false);
        setShowModalData(false);
    };

    const handleEdit = (complain) => {
        setEditingComplain(complain);
        setFormData({
            route: complain.route._id,
            archived: String(complain.archived),
            user: complain.user._id,
            complain_content: complain.complain_content,
            complain_type: complain.complain_type,
            resolution_status: complain.resolution_status || 'false'
        });

        setShowModal(true);
    };

    const handleView = (complain) => {
        setViewingComplain(complain);
        setShowModalData(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this complain?')) {
            try {
                const { data, success } = await deleteComplain(id);

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete complain');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            route: '',
            user: '',
            complain_content: '',
            complain_type: '',
            resolution_status: '',
            archived: '',
        });

        setEditingComplain(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Function to get unique complain types from data
    const getComplainTypes = () => {
        const types = [...new Set(complains.map(complain => complain.complain_type))];
        return types.filter(type => type); // Remove empty/null values
    };

    // Function to get available user roles from data
    const getUserRoles = () => {
        const roles = [...new Set(complains.map(complain => complain?.user?.role))];
        return roles.filter(role => role); // Remove empty/null values
    };

    const formatRoleForDisplay = (role) => {
        const roleMap = {
            'admin': 'Admin',
            'resident': 'Resident',
            'enro_staff': 'ENRO Staff',
            'enro_staff_head': 'ENRO Staff Head',
            'barangay_official': 'Barangay Official',
            'garbage_collector': 'Garbage Collector'
        };
        return roleMap[role] || role;
    };

    const formatArchiveStatus = (archived) => {
        return archived ? 'Archived' : 'Active';
    };

    function formatDate(datetimeString) {
        const date = new Date(datetimeString.replace(' ', 'T')); // Ensure proper parsing
        return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }

    const formatRole = (role) => {
        const roleMap = {
            'admin': 'Admin',
            'resident': 'Resident',
            'enro_staff': 'ENRO Staff',
            'enro_staff_head': 'ENRO Staff Head',
            'barangay_official': 'Barangay Official',
            'garbage_collector': 'Garbage Collector'
        };

        return roleMap[role] || role; // Return formatted role or original if not found
    };

    // Check if any filters are active
    const isAnyFilterActive = searchTerm || complainTypeFilter || userRoleFilter || archiveFilter;

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
                        <span>Add New Complain</span>
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
                                placeholder="Search complain by content, name, or route"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Complain Type Filter */}
                        <div className="sm:w-48">
                            <select
                                value={complainTypeFilter}
                                onChange={(e) => setComplainTypeFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Types</option>
                                {getComplainTypes().map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* User Role Filter */}
                        <div className="sm:w-48">
                            <select
                                value={userRoleFilter}
                                onChange={(e) => setUserRoleFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Roles</option>
                                {getUserRoles()
                                    .filter(role => role === 'resident' || role === 'garbage_collector')
                                    .map((role) => (
                                        <option key={role} value={role}>
                                            {formatRoleForDisplay(role)}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* Archive Filter */}
                        <div className="sm:w-48">
                            <select
                                value={archiveFilter}
                                onChange={(e) => setArchiveFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Clear Filters Button */}
                        {isAnyFilterActive && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setComplainTypeFilter('');
                                    setUserRoleFilter('');
                                    setArchiveFilter('');
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Active Filters Display */}
                    {isAnyFilterActive && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {searchTerm && (
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    Search: "{searchTerm}"
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {complainTypeFilter && (
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Type: {complainTypeFilter}
                                    <button
                                        onClick={() => setComplainTypeFilter('')}
                                        className="ml-1 text-green-600 hover:text-green-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {userRoleFilter && (
                                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                    Role: {formatRoleForDisplay(userRoleFilter)}
                                    <button
                                        onClick={() => setUserRoleFilter('')}
                                        className="ml-1 text-purple-600 hover:text-purple-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {archiveFilter && (
                                <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                    <FiArchive className="w-3 h-3 mr-1" />
                                    Status: {archiveFilter === 'archived' ? 'Archived' : 'Active'}
                                    <button
                                        onClick={() => setArchiveFilter('')}
                                        className="ml-1 text-orange-600 hover:text-orange-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Complete Name
                                    </th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User Role
                                    </th> */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Route Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Complain Content
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Complain Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Archive
                                    </th> */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredComplains.map((complain) => (
                                    <tr key={complain._id} className={`hover:bg-gray-50 transition-colors ${complain.archived ? 'bg-gray-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{complain.user.first_name} {complain.user.middle_name} {complain.user.last_name}</span>
                                        </td>
                                        {/* <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{formatRole(complain.user.role)}</span>
                                        </td> */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{complain.route.route_name}</span>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <span className="text-sm text-gray-900 truncate block">
                                                {complain.complain_content}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{complain.complain_type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{complain.resolution_status}</span>
                                        </td>
                                        {/* <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${complain.archived
                                                    ? 'bg-gray-100 text-gray-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                <FiArchive className={`w-3 h-3 mr-1 ${complain.archived ? '' : 'opacity-50'}`} />
                                                {formatArchiveStatus(complain.archived)}
                                            </span>
                                        </td> */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{formatDate(complain.created_at)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(complain)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleView(complain)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="View Data"
                                                >
                                                    <FiInfo className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(complain._id)}
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
                    {filteredComplains.length === 0 && (
                        <div className="text-center py-12">
                            <FiBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No complains found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {isAnyFilterActive
                                    ? 'Try adjusting your search or filters'
                                    : 'Get started by adding your first complain'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Rest of your modal code remains the same */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[700px] max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingComplains ? 'Edit Complain' : 'Add New Complain'}
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
                                            User
                                        </label>
                                        <select
                                            name="user"
                                            value={formData.user}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        >
                                            <option value="" disabled>Select User</option>
                                            {users?.filter(user => user?._id)
                                                .map((user) => (
                                                    <option key={user?._id} value={user?._id}>
                                                        {user?.first_name} {user?.middle_name} {user?.last_name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Route
                                        </label>
                                        <select
                                            name="route"
                                            value={formData.route}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        >
                                            <option value="" disabled>Select Route</option>
                                            {routes?.filter(route => route?._id && route?.route_name)
                                                .map((route) => (
                                                    <option key={route?._id} value={route?._id}>
                                                        {route?.route_name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Resolution Status
                                        </label>
                                        <select
                                            name="resolution_status"
                                            value={formData.resolution_status}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        >
                                            <option value="" disabled>Select Resolution Status</option>
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Cancelled">Cancelled</option>
                                            <option value="" disabled>Select Resolution Status Resident</option>
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Under Review">Under Review</option>
                                            <option value="Cancelled">Resolved</option> 
                                            <option value="Invalid">Invalid</option> 
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Complain Type
                                        </label>
                                        <select
                                            name="complain_type"
                                            value={formData.complain_type}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        >
                                            <option value="" disabled>Select Complain Type</option>
                                            <option value="Breakdown">Breakdown</option>
                                            <option value="Roadblock">Roadblock</option>
                                            <option value="Delay">Delay</option>
                                            <option value="Other">Other</option>
                                            <option value="" disabled>Select Complain Type Resident</option>
                                            <option value="Missed Pickup">Missed Pickup</option>
                                            <option value="Delayed Collection">Delayed Collection</option>
                                            <option value="Uncollected Area">Uncollected Area</option>
                                            <option value="Illegal Dumping">Illegal Dumping</option> 
                                        </select>
                                    </div>

                                    {editingComplains && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Archive Status
                                            </label>
                                            <select
                                                name="archived"
                                                value={formData.archived}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            >
                                                <option value="" disabled>Select Archive Status</option>
                                                <option value="true">Archived</option>
                                                <option value="false">Active</option>
                                            </select>
                                        </div>
                                    )}

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Complain Content
                                        </label>
                                        <textarea
                                            name="complain_content"
                                            value={formData.complain_content}
                                            onChange={(e) => {
                                                handleInputChange(e);
                                                // Auto-resize logic
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 30 + 'px';
                                            }}
                                            onFocus={(e) => {
                                                // Trigger resize on focus as well
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 30 + 'px';
                                            }}
                                            required
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none overflow-hidden"
                                            placeholder="Enter Complain Content"
                                            style={{ minHeight: '80px' }}
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
                                        {editingComplains ? 'Update Complain' : 'Add Complain'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal - remains the same */}
            {showModalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[800px] max-w-[800px] max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-end items-center mb-6">
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
                                            {viewingComplains.user.first_name} {viewingComplains.user.middle_name} {viewingComplains.user.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Gender:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {viewingComplains.user.gender}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Role:</span>
                                        <p className="font-medium text-gray-800">
                                            {formatRole(viewingComplains.user.role)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Contact Number:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingComplains.user.contact_number}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Email Address:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingComplains.user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Complain Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Complain Type:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingComplains?.complain_type}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Route:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingComplains?.route.route_name}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Status:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingComplains?.resolution_status}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Archive Status:</span>
                                        <p className="font-medium text-gray-800">
                                            {formatArchiveStatus(viewingComplains?.archived)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Date:</span>
                                        <p className="font-medium text-gray-800">
                                            {formatDate(viewingComplains?.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 text-sm">
                                    <span className="text-gray-500">Complain Content:</span>
                                    <p className="font-medium text-gray-800 mt-1 break-words whitespace-pre-wrap overflow-hidden">
                                        {viewingComplains?.complain_content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ComplainManagementLayout;