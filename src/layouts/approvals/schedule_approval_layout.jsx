import React, { useState, useEffect, useContext } from 'react';
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
    FiXCircle
} from 'react-icons/fi';

import { getSpecificSchedule, createSchedule, getAllSchedule, deleteSchedule, updateSchedule, updateScheduleApproval } from "../../hooks/schedule_hook";
import BeautifulCalendar from "../../components/BeautifulCalendar";
import { toast } from "react-toastify";

import DateRangeFilter from '../../components/DateRangeFilter';
import { AuthContext } from '../../context/AuthContext';

const ScheduleApprovalLayout = () => {
    const [schedules, setSchedules] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [filteredSchedules, setFilteredSchedules] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [approvalFilter, setApprovalFilter] = useState('need_approval'); // Default to need approval
    const [showModal, setShowModal] = useState(false);
    const [showModalData, setShowModalData] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [editingSchedules, setEditingSchedule] = useState(null);
    const [viewingSchedules, setViewingSchedule] = useState(null);
    const [showModalDate, setShowModalDate] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { user } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        route: '',
        truck: '',
        user: '',
        status: '',
        remark: '',
        garbage_type: '',
        is_editable: '',
        scheduled_collection: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data, success } = await getAllSchedule();
            if (success === true) {
                setTrucks(data.trucks.data)
                setRoutes(data.routes.data)
                setBarangays(data.barangays.data)
                setSchedules(data.schedules.data)
                setFilteredSchedules(data.schedules.data)
            }
        } catch (err) {
            console.error("Error fetching reg data:", err);
            toast.error("Failed to load registration data");
        }
    };

    useEffect(() => {
        filterSchedules();
    }, [searchTerm, schedules, startDate, endDate, approvalFilter]);

    const filterSchedules = () => {
        let filtered = schedules;

        // Approval filter - default to show schedules that need approval
        if (approvalFilter === 'need_approval') {
            filtered = filtered.filter(schedule =>
                !schedule.approved_by // Show schedules where approved_by is empty/null
            );
        } else if (approvalFilter === 'approved') {
            filtered = filtered.filter(schedule =>
                schedule.approved_by // Show schedules where approved_by has value
            );
        } else if (approvalFilter === 'cancelled') {
            filtered = filtered.filter(schedule =>
                schedule.cancelled_by // Show schedules where approved_by has value
            );
        }
        // If 'all' is selected, show all schedules

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(schedule =>
                schedule?.truck?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schedule?.truck?.user?.middle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schedule?.truck?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${schedule?.truck?.user?.first_name} ${schedule?.truck?.user?.middle_name} ${schedule?.truck?.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) 
            );
        }

        if (startDate && endDate) {
            const startDateStr = `${startDate}`;
            const endDateStr = `${endDate}`;

            filtered = filtered.filter(schedule => {
                const createdAt = schedule.scheduled_collection || '';
                return createdAt >= startDateStr && createdAt <= endDateStr;
            });
        }

        setFilteredSchedules(filtered);
    };

    // Count schedules that need approval
    const schedulesNeedingApproval = schedules.filter(schedule => !schedule.approved_by).length;
    const approvedSchedulesCount = schedules.filter(schedule => schedule.approved_by).length;
    const cancelledSchedulesCount = schedules.filter(schedule => schedule.cancelled_by).length;


    const handleSubmit = async (e) => {
        e.preventDefault();

        const input_data = {
            user: user?._id,
            route: formData?.route,
            truck: formData?.truck,
            garbage_type: formData?.garbage_type,
            status: formData?.status,
            remark: formData?.remark,
            is_editable: formData?.is_editable,
            scheduled_collection: formData?.scheduled_collection,
        };

        if (editingSchedules) {
            try {
                const { data, success } = await updateScheduleApproval(editingSchedules._id, input_data);

                if (data && success === false) {
                    toast.error(data.message || "Failed to update route");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to update route");
                } else {
                    toast.error("Failed to update route");
                }
            }
        } else {
            try {
                const { data, success } = await createSchedule(input_data);

                const selectedTruck = trucks?.find(truck => truck._id === formData.truck);
                if (selectedTruck?.status !== 'Active' && selectedTruck?.status !== 'On Route') {
                    alert('Cannot schedule: Selected truck is not ready. Please select an active truck.');
                    return;
                }

                if (data && success === false) {
                    toast.error(data.message || "Failed to create route");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to create route");
                } else {
                    toast.error("Failed to create route");
                }
            }
        }

        resetForm();
        setShowModal(false);
        setShowModalPassword(false);
    };

    const handleEdit = (schedule) => {
        setEditingSchedule(schedule);
        setFormData({
            route: schedule?.route?._id || '',
            user: schedule?.user?._id || '',
            truck: schedule?.truck?._id || '',
            status: schedule.status,
            remark: schedule.remark,
            is_editable: String(schedule.is_editable),
            garbage_type: schedule.garbage_type,
            scheduled_collection: schedule.scheduled_collection
        });

        setShowModal(true);
    };

    const handleView = (schedule) => {
        setViewingSchedule(schedule);
        setShowModalData(true);
    };

    const getSelectedTruckStatus = () => {
        if (!formData.truck) return null;
        const selectedTruck = trucks?.find(truck => truck._id === formData.truck);
        return selectedTruck?.status;
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this route?')) {
            try {
                const { data, success } = await deleteSchedule(id);

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete route');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            route: '',
            truck: '',
            user: '',
            status: '',
            remark: '',
            garbage_type: '',
            is_editable: '',
            scheduled_collection: ''
        });

        setEditingSchedule(null);
        setViewingSchedule(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'truck') {
            const selectedTruck = trucks?.find(truck => truck._id === value);
            const userId = selectedTruck?.user?._id || '';

            setFormData(prev => ({
                ...prev,
                truck: value,
                user: userId // Automatically set user ID
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const formatDate = (dateString) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const date = new Date(dateString);
        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();

        return `${month} ${day}, ${year}`;
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

    const downloadGeneratedReport = async () => {
        try {
            const res = await generateReportLoginLog({
                start_date: startDate,
                end_date: endDate,
            });

            const blob = new Blob([res.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'login-logs-report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download failed:', err);
            toast.error('Failed to download reports data');
        }
    };

    const scheduleStatusOptions = [
        'Pending',
        'Scheduled',
        'Cancelled',
    ];

    const commonRemarks = [
        'Pending',
        'Approved',
        'Delayed',
        'Cancelled',
    ];

    const getBarangayName = (barangayId) => {
        const barangay = barangays.find(b => b._id === barangayId);
        return barangay?.barangay_name || 'Unknown Barangay';
    };

    const approvalFilterOptions = [
        { value: 'need_approval', label: `Need Approval (${schedulesNeedingApproval})` },
        { value: 'approved', label: `Approved (${approvedSchedulesCount})` },
        { value: 'cancelled', label: `Cancelled (${cancelledSchedulesCount})` },
        { value: 'all', label: 'All Schedules' }
    ];

    return (
        <>
            <div className="space-y-6">
                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col gap-4">
                        {/* First Row: Date Range Filter */}
                        <div className="w-full">
                            <DateRangeFilter
                                onChange={({ startDate, endDate }) => {
                                    setStartDate(startDate);
                                    setEndDate(endDate);
                                }}
                                downloadHandler={downloadGeneratedReport}
                            />
                        </div>

                        {/* Second Row: Search and Filter Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search Input */}
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search user..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Approval Filter */}
                            <div>
                                <select
                                    value={approvalFilter}
                                    onChange={(e) => setApprovalFilter(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                >
                                    {approvalFilterOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Reset Filters Button */}
                            <div>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setApprovalFilter('need_approval');
                                        setStartDate('');
                                        setEndDate('');
                                    }}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <FiFilter className="w-4 h-4" />
                                    <span>Reset Filters</span>
                                </button>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(searchTerm || approvalFilter !== 'need_approval' || startDate || endDate) && (
                            <div className="flex flex-wrap gap-2 items-center text-sm">
                                <span className="text-gray-500">Active filters:</span>
                                {approvalFilter !== 'need_approval' && (
                                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                        {approvalFilter === 'approved' ? 'Approved Only' : 'All Schedules'}
                                        <button
                                            onClick={() => setApprovalFilter('need_approval')}
                                            className="ml-1 text-blue-500 hover:text-blue-700"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {searchTerm && (
                                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                        Search: {searchTerm}
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="ml-1 text-purple-500 hover:text-purple-700"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                                {(startDate || endDate) && (
                                    <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                                        Date: {startDate} to {endDate}
                                        <button
                                            onClick={() => { setStartDate(''); setEndDate(''); }}
                                            className="ml-1 text-orange-500 hover:text-orange-700"
                                        >
                                            ×
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
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
                                        Route Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Collection Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Garbage Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Remark
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Approval Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSchedules.map((schedule) => (
                                    <tr key={schedule._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{schedule?.truck?.user?.first_name || "None"} {schedule?.truck?.user?.middle_name} {schedule?.truck?.user?.last_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{schedule?.truck?.truck_id || "None"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{schedule?.route?.route_name || "None"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{formatDate(schedule.scheduled_collection)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{schedule.garbage_type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{schedule.remark || "Not Yet"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{schedule.status || "Not Yet"}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {schedule.cancelled_by ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Cancelled
                                                </span>
                                            ) : schedule.approved_by ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Needs Approval
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(schedule)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleView(schedule)}
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
                    {filteredSchedules.length === 0 && (
                        <div className="text-center py-12">
                            <FiBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">
                                {approvalFilter === 'need_approval'
                                    ? 'No schedules need approval'
                                    : approvalFilter === 'approved'
                                        ? 'No approved schedules found'
                                        : 'No schedules found'
                                }
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                                {searchTerm || startDate || endDate
                                    ? 'Try adjusting your search or filters'
                                    : approvalFilter === 'need_approval'
                                        ? 'All schedules have been approved'
                                        : approvalFilter === 'approved'
                                            ? 'No schedules have been approved yet'
                                            : 'No schedules available'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Rest of your modal code remains exactly the same */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[700px] max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingSchedules ? 'Edit Schedule' : 'Add New Schedule'}
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
                                    {editingSchedules && (
                                        <>
                                            {/* Remark Field */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Remark
                                                </label>
                                                <select
                                                    name="remark"
                                                    value={formData.remark}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                >
                                                    <option value="" disabled>Select Remark</option>
                                                    {commonRemarks.map((remark) => (
                                                        <option key={remark} value={remark}>
                                                            {remark}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Status Field */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Status
                                                </label>
                                                <select
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                >
                                                    <option value="" disabled>Select Truck Status</option>
                                                    {scheduleStatusOptions.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Editable
                                                </label>
                                                <select
                                                    name="is_editable"
                                                    value={formData.is_editable}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                >
                                                    <option value="" disabled>Select Editable</option>
                                                    <option value="true">True</option>
                                                    <option value="false">False</option>
                                                </select>
                                            </div>
                                        </>
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
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                                    >
                                        {editingSchedules ? 'Update Schedule' : 'Add Schedule'}
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
                                <button
                                    onClick={() => {
                                        setShowModalData(false);
                                        setViewingSchedule(null);
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
                                            {viewingSchedules?.truck?.user?.first_name} {viewingSchedules?.truck?.user?.middle_name} {viewingSchedules?.truck?.user?.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Gender:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {viewingSchedules?.truck?.user?.gender}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Role:</span>
                                        <p className="font-medium text-gray-800">
                                            {formatRole(viewingSchedules?.truck?.user?.role)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Contact Number:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingSchedules?.truck?.user?.contact_number}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Email Address:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingSchedules?.truck?.user?.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Schedule Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Garbage Type:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingSchedules?.garbage_type}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Truck ID:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingSchedules?.truck?.truck_id}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Schedule Status:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingSchedules?.status}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Truck Status:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingSchedules?.truck.status}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Remark:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingSchedules?.remark}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Date:</span>
                                        <p className="font-medium text-gray-800">
                                            {formatDate(viewingSchedules?.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Route Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Route Name:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingSchedules?.route.route_name}
                                        </p>
                                    </div>

                                    <div className="md:col-span-2">
                                        <span className="text-gray-500">Barangays Covered:</span>
                                        <div className="mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Order</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Barangay Name</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {viewingSchedules?.route.merge_barangay && viewingSchedules.route.merge_barangay.length > 0 ? (
                                                        viewingSchedules.route.merge_barangay
                                                            .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                                                            .map((barangay, index) => {
                                                                const barangayId = barangay.barangay_id;
                                                                const barangayName = getBarangayName(barangayId);
                                                                const orderNumber = barangay.order_index + 1;

                                                                return (
                                                                    <tr key={barangayId}>
                                                                        <td className="px-4 py-2">
                                                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs">
                                                                                {orderNumber}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-4 py-2 font-medium text-gray-700">
                                                                            {barangayName}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="2" className="px-4 py-4 text-center text-gray-400">
                                                                No barangays assigned to this route
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ScheduleApprovalLayout;