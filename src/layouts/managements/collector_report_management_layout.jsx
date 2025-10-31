import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiBook,
    FiCheck,
    FiInfo,
    FiLock,
    FiUser,
    FiMapPin,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiArchive
} from 'react-icons/fi';

import { getAllCollectorReport } from "../../hooks/collector_report_management_hook";

import { toast } from "react-toastify";
import { AuthContext } from '../../context/AuthContext';
import DateRangeFilter from '../../components/DateRangeFilter';


const ReportGarbageManagementLayout = () => {
    const { user } = useContext(AuthContext);
    const [collectorReports, setCollectorReports] = useState([]);
    const [filteredCollectorReports, setFilteredCollectorReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [collectorReportTypeFilter, setCollectorReportTypeFilter] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('');
    const [archiveFilter, setArchiveFilter] = useState(''); // Archive filter state
    const [showModal, setShowModal] = useState(false);
    const [showModalData, setShowModalData] = useState(false);
    const [editingCollectorReports, setEditingCollectorReport] = useState(null);
    const [viewingCollectorReports, setViewingCollectorReport] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showMapModal, setShowMapModal] = useState(false);


    const [formData, setFormData] = useState({
        user: '',
        latitude: '',
        longitude: '',
        garbage_type: '',
        notes: '',
        resolution_status: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            var { data, success } = await getAllCollectorReport();

            if (success === true) {
                setCollectorReports(data.data)
                setFilteredCollectorReports(data.data)
            }
        } catch (err) {
            console.error("Error fetching reg data:", err);
            toast.error("Failed to load registration data");
        }
    };

    useEffect(() => {
        filterCollectorReports();
    }, [searchTerm, collectorReportTypeFilter, userRoleFilter, archiveFilter, collectorReports, startDate, endDate]); // Added archiveFilter dependency


    const filterCollectorReports = () => {
        let filtered = collectorReports;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(report =>
                report.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.user.middle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${report.user.first_name} ${report.user.middle_name} ${report.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.truck.truck_id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Complain type filter
        if (collectorReportTypeFilter) {
            filtered = filtered.filter(report =>
                report.report_type === collectorReportTypeFilter
            );
        }

        // User role filter
        if (userRoleFilter) {
            filtered = filtered.filter(report =>
                report.user.role === userRoleFilter
            );
        }

        // Archive filter
        if (archiveFilter) {
            if (archiveFilter === 'archived') {
                filtered = filtered.filter(report => report.archived === true);
            } else if (archiveFilter === 'active') {
                filtered = filtered.filter(report => report.archived === false);
            }
        }

        if (startDate && endDate) {
            const startDateStr = `${startDate} 00:00:00`;
            const endDateStr = `${endDate} 23:59:59`;

            // filtered = filtered.filter(schedule => {
            //     const createdAt = schedule.created_at || ''; // try both places
            //     return createdAt >= startDateStr && createdAt <= endDateStr;
            // });

            // const startDateStr = `${startDate}`;
            // const endDateStr = `${endDate}`;

            filtered = filtered.filter(report => {
                const createdAt = report.created_at || ''; // try both places
                return createdAt >= startDateStr && createdAt <= endDateStr;
            });
        }

        setFilteredCollectorReports(filtered);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const input_data = {
            resolution_status: formData.resolution_status
        };

        if (editingCollectorReports) {
            try {
                const { data, success } = await updateComplain(editingCollectorReports._id, input_data);

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
        }

        resetForm();
        setShowModal(false);
        setShowModalData(false);
    };

    const handleEdit = (report) => {
        setEditingCollectorReport(report);
        setFormData({
            resolution_status: report?.resolution_status
        });

        setShowModal(true);
    };

    const handleView = (report) => {
        setViewingCollectorReport(report);
        setShowModalData(true);
    };

    const handleViewMap = (report) => {
        setViewingCollectorReport(report);
        setShowMapModal(true)
    };

    const handleComplainVerification = async (id, status) => {
        const input_data = {
            status: status,
            user: user,
        };

        try {
            const { data, success } = await updateComplainVerification(id, input_data);

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
        resetForm();
        setShowModal(false);
        setShowModalData(false);
        setViewingCollectorReport(null);
    };


    const resetForm = () => {
        setFormData({
            resolution_status: ''
        });

        setEditingCollectorReport(null);
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
        const types = [...new Set(collectorReports.map(complain => complain.complain_type))];
        return types.filter(type => type); // Remove empty/null values
    };

    // Function to get available user roles from data
    const getUserRoles = () => {
        const roles = [...new Set(collectorReports.map(complain => complain?.user?.role))];
        return roles.filter(role => role); // Remove empty/null values
    };

    const formatRoleForDisplay = (role) => {
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
            'enro_staff_monitoring': 'ENRO Staff Monitoring',
            'enro_staff_scheduler': 'ENRO Staff Scheduler',
            'enro_staff_head': 'ENRO Staff Head',
            'enro_staff_eswm_section_head': 'ENRO Staff ESWM Section Head',
            'barangay_official': 'Barangay Official',
            'garbage_collector': 'Garbage Collector'
        };

        return roleMap[role] || role; // Return formatted role or original if not found
    };

    // Check if any filters are active
    const isAnyFilterActive = searchTerm || collectorReportTypeFilter || userRoleFilter || archiveFilter;

    return (
        <>
            <div className="space-y-6">
                {/* Header Section */}
                {/* <div className="flex justify-end">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <FiPlus className="w-4 h-4" />
                        <span>Add New Complain</span>
                    </button>
                </div> */}

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-6">
                    {/* Filters and Search */}

                    {/* First Row: Date Range Filter */}
                    <div className="w-full">
                        <DateRangeFilter
                            onChange={({ startDate, endDate }) => {
                                setStartDate(startDate);
                                setEndDate(endDate);
                            }}
                            downloadHandler={null}
                            hideDownload={true}
                        />
                    </div>


                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search complain by content, name, or barangay"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Complain Type Filter */}
                        {/* <div className="sm:w-48">
                            <select
                                value={collectorReportTypeFilter}
                                onChange={(e) => setCollectorReportTypeFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Types</option>
                                {getComplainTypes().map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div> */}

                        {/* User Role Filter */}
                        {/* <div className="sm:w-48">
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
                        </div> */}

                        {/* Archive Filter */}
                        {/* <div className="sm:w-48">
                            <select
                                value={archiveFilter}
                                onChange={(e) => setArchiveFilter(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div> */}

                        {/* Clear Filters Button */}
                        {/* {isAnyFilterActive && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setCollectorReportTypeFilter('');
                                    setUserRoleFilter('');
                                    setArchiveFilter('');
                                }}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Clear All
                            </button>
                        )} */}
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
                            {collectorReportTypeFilter && (
                                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Type: {collectorReportTypeFilter}
                                    <button
                                        onClick={() => setCollectorReportTypeFilter('')}
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Truck ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Complain Content
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Report Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Specific Issue
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCollectorReports.map((report) => (
                                    <tr key={report._id} className={`hover:bg-gray-50 transition-colors bg-gray-50`}>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{report?.user?.first_name} {report?.user?.middle_name} {report?.user?.last_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{report?.truck?.truck_id}</span>
                                        </td>
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <span className="text-sm text-gray-900 truncate block">
                                                {report?.notes}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{report.report_type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{report.specific_issue}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{report.resolution_status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{formatDate(report.created_at)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {['admin', 'enro_staff_monitoring', 'enro_staff_head'].includes(user.role) && (
                                                    <button
                                                        onClick={() => handleEdit(report)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <FiEdit className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleViewMap(report)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View on Map"
                                                >
                                                    <FiMapPin className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleView(report)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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
                    {filteredCollectorReports.length === 0 && (
                        <div className="text-center py-12">
                            <FiBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No report garbages found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {isAnyFilterActive
                                    ? 'Try adjusting your search or filters'
                                    : 'Get started by adding your first report garbage'
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
                                    {editingCollectorReports ? 'Edit Collector Report' : 'Add New Collector Report'}
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
                                    {/* <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            User
                                        </label>
                                        <select
                                            name="user"
                                            value={formData.user}
                                            onChange={handleInputChange}
                                            required
                                            disabled
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
                                    </div> */}

                                    {/* <div className="md:col-span-2">
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
                                                    <option key={barangay?._id} value={barangay?._id}>
                                                        {barangay?.barangay_name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div> */}



                                    {/* <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Complain Type
                                        </label>
                                        <select
                                            name="complain_type"
                                            value={formData.complain_type}
                                            onChange={handleInputChange}
                                            required
                                            disabled
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
                                    </div> */}

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

                                    {/* {editingCollectorReports && (
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
                                    )} */}

                                    {/* <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Complain Content
                                        </label>
                                        <textarea
                                            name="complain_content"
                                            disabled
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
                                    </div> */}
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
                                        {editingCollectorReports ? 'Update Collector Report' : 'Add Collector Report'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showMapModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[800px] max-w-[90vw] max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-800">Location Map</h2>
                            <button
                                onClick={() => setShowMapModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Map Section */}
                        <div className="w-full h-[500px]">
                            <iframe
                                title="Google Map"
                                src={`https://www.google.com/maps?q=${viewingCollectorReports?.position?.lat},${viewingCollectorReports?.position?.lng}&z=15&output=embed`}
                                width="100%"
                                height="100%"
                                allowFullScreen
                                loading="lazy"
                                className="rounded-b-xl"
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}

            {showModalData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[800px] max-w-[800px] max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Report Details</h2>
                                <button
                                    onClick={() => {
                                        setShowModalData(false);
                                        setViewingCollectorReport(null);
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
                                            {viewingCollectorReports?.user?.first_name} {viewingCollectorReports?.user?.middle_name} {viewingCollectorReports?.user?.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Gender:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {viewingCollectorReports?.user?.gender}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Role:</span>
                                        <p className="font-medium text-gray-800">
                                            {formatRole(viewingCollectorReports?.user?.role)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Contact Number:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingCollectorReports?.user?.contact_number}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Email Address:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingCollectorReports?.user?.email}
                                        </p>
                                    </div>
                                    {/* <div>
                                        <span className="text-gray-500">Verification Status:</span>
                                        <p className={`font-medium ${viewingCollectorReports?.user?.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {viewingCollectorReports?.user?.is_verified ? 'Verified' : 'Unverified'}
                                        </p>
                                    </div> */}
                                </div>
                            </div>

                            {viewingCollectorReports?.verified_by && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">User Verification Information</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-500">Complete Name:</span>
                                            <p className="font-medium text-gray-800 capitalize">
                                                {viewingCollectorReports?.verified_by?.first_name} {viewingCollectorReports?.verified_by?.middle_name} {viewingCollectorReports?.verified_by?.last_name}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Gender:</span>
                                            <p className="font-medium text-gray-800 capitalize">
                                                {viewingCollectorReports?.verified_by?.gender}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Role:</span>
                                            <p className="font-medium text-gray-800">
                                                {formatRole(viewingCollectorReports?.verified_by?.role)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Contact Number:</span>
                                            <p className="font-medium text-gray-800">
                                                {viewingCollectorReports?.verified_by?.contact_number}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Email Address:</span>
                                            <p className="font-medium text-gray-800">
                                                {viewingCollectorReports?.verified_by?.email}
                                            </p>
                                        </div>
                                        {/* <div>
                                        <span className="text-gray-500">Verification Status:</span>
                                        <p className={`font-medium ${viewingCollectorReports?.verified_by?.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {viewingCollectorReports?.verified_by?.is_verified ? 'Verified' : 'Unverified'}
                                        </p>
                                    </div> */}
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Report Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Report Type:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingCollectorReports?.report_type}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Specific Issued:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingCollectorReports?.specific_issue}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Truck ID:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingCollectorReports?.truck.truck_id}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Position:</span>
                                        <p>
                                            Latitude: <span className="font-medium text-gray-800">{viewingCollectorReports?.position.lat}</span>,
                                            Longitude: <span className="font-medium text-gray-800">{viewingCollectorReports?.position.lng}</span>
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Resolution Status:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingCollectorReports?.resolution_status}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Date:</span>
                                        <p className="font-medium text-gray-800">
                                            {formatDate(viewingCollectorReports?.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 text-sm">
                                    <span className="text-gray-500">Report Content:</span>
                                    <p className="font-medium text-gray-800 mt-1 break-words whitespace-pre-wrap overflow-hidden">
                                        {viewingCollectorReports?.notes}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                                {user.role === 'barangay_official' && (
                                    <div className="flex gap-3">
                                        {/* Verify Button - Show only when verified_by is null */}
                                        {viewingCollectorReports?.verified_by === null && (
                                            <button
                                                onClick={() => handleComplainVerification(viewingCollectorReports?._id, 'Verified')}
                                                disabled={viewingCollectorReports?.resolution_status === 'Verified'}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${viewingCollectorReports?.resolution_status === 'Verified'
                                                    ? 'bg-green-100 text-green-600 cursor-not-allowed'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                            >
                                                <FiCheckCircle className="w-4 h-4" />
                                                Mark as Verified
                                            </button>
                                        )}

                                        {/* Unverify Button - Show only when verified_by is not null */}
                                        {viewingCollectorReports?.verified_by !== null && (
                                            <button
                                                onClick={() => handleComplainVerification(viewingCollectorReports?._id, 'Unverified')}
                                                disabled={viewingCollectorReports?.resolution_status === 'Unverified'}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 font-medium ${viewingCollectorReports?.resolution_status === 'Unverified'
                                                    ? 'bg-red-100 text-red-600 cursor-not-allowed'
                                                    : 'bg-red-600 text-white hover:bg-red-700'
                                                    }`}
                                            >
                                                <FiXCircle className="w-4 h-4" />
                                                Mark as Unverified
                                            </button>
                                        )}
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        setShowModalData(false);
                                        setViewingCollectorReport(null);
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

export default ReportGarbageManagementLayout;