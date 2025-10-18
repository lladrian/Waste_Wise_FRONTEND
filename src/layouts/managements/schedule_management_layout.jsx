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
    FiXCircle
} from 'react-icons/fi';

import { getSpecificSchedule, createSchedule, getAllSchedule, deleteSchedule, updateSchedule } from "../../hooks/schedule_hook";
import BeautifulCalendar from "../../components/BeautifulCalendar";
import { toast } from "react-toastify";

import DateRangeFilter from '../../components/DateRangeFilter';


const ScheduleManagementLayout = () => {
    const [schedules, setSchedules] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [filteredSchedules, setFilteredSchedules] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalData, setShowModalData] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [editingSchedules, setEditingSchedule] = useState(null);
    const [viewingSchedules, setViewingSchedule] = useState(null);
    const [showModalDate, setShowModalDate] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [formData, setFormData] = useState({
        route: '',
        truck: '',
        user: '',
        status: '',
        remark: '',
        garbage_type: '',
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
                setBarangays(data.barangays.data)
                setRoutes(data.routes.data)
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
    }, [searchTerm, schedules, startDate, endDate]);


    const filterSchedules = () => {
        let filtered = schedules;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(schedule =>
                schedule?.truck?.user?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schedule?.truck?.user?.middle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                schedule?.truck?.user?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (startDate && endDate) {
            //  const startDateStr = `${startDate} 00:00:00`;
            // const endDateStr = `${endDate} 23:59:59`;

            // filtered = filtered.filter(schedule => {
            //     const createdAt = schedule.created_at || ''; // try both places
            //     return createdAt >= startDateStr && createdAt <= endDateStr;
            // });

            const startDateStr = `${startDate}`;
            const endDateStr = `${endDate}`;

            filtered = filtered.filter(schedule => {
                const createdAt = schedule.scheduled_collection || ''; // try both places
                return createdAt >= startDateStr && createdAt <= endDateStr;
            });
        }

        setFilteredSchedules(filtered);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();



        const input_data = {
            route: formData?.route,
            truck: formData?.truck,
            user: formData?.user,
            garbage_type: formData?.garbage_type,
            status: formData?.status,
            remark: formData?.remark,
            scheduled_collection: formData?.scheduled_collection,
        };

        if (editingSchedules) {
            try {
                const { data, success } = await updateSchedule(editingSchedules._id, input_data);

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
                if (selectedTruck?.status !== 'Active' && selectedTruck?.status !== 'On Route') { // Change 'active' to your "ready" status
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

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData(prev => ({
    //         ...prev,
    //         [name]: value
    //     }));
    // };

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
            'enro_staff_head': 'ENRO Staff Head',
            'barangay_official': 'Barangay Official',
            'garbage_collector': 'Garbage Collector'
        };

        return roleMap[role] || role; // Return formatted role or original if not found
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
        'In Progress',
        'Completed',
        'Delayed',
        'Cancelled',
    ];


    const commonRemarks = [
        'None',
        'Pending',
        'Approved',
        'In Progress',
        'Completed',
        'Delayed',
        'Cancelled',
    ];

    const getBarangayName = (barangayId) => {
    const barangay = barangays.find(b => b._id === barangayId);
    return barangay?.barangay_name || 'Unknown Barangay';
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
                        <span>Add New Schedule</span>
                    </button>
                </div>


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

                        {/* Second Row: Search Input */}
                        <div className="relative w-full">
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
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Truck Status
                                    </th> */}
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
                                        {/* <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{schedule?.truck?.status || "None"}</span>
                                        </td> */}
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

                                                <button
                                                    onClick={() => handleDelete(schedule._id)}
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
                    {filteredSchedules.length === 0 && (
                        <div className="text-center py-12">
                            <FiBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No schedule found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {searchTerm
                                    ? 'Try adjusting your search or filters'
                                    : 'Get started by adding your first schedule'
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

                                    {editingSchedules && (
                                        <>
                                            {/* Remark Field */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Remark
                                                </label>

                                                {/* Combined approach */}
                                                <div className="space-y-2">
                                                    <input
                                                        list="remark-suggestions"
                                                        name="remark"
                                                        value={formData.remark}
                                                        onChange={handleInputChange}
                                                        placeholder="Type or select a remark..."
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                                    />
                                                    <datalist id="remark-suggestions">
                                                        {commonRemarks.map((remark) => (
                                                            <option key={remark} value={remark} />
                                                        ))}
                                                    </datalist>
                                                </div>
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

                                        </>
                                    )}


                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Garbage Collector
                                        </label>
                                        <select
                                            name="truck"
                                            value={formData.truck}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        >
                                            <option value="" disabled>Select Garbage Collector</option>
                                            {/* Active trucks */}
                                            {trucks?.filter(truck => truck?.status === 'Active' || truck?.status === 'On Route')
                                                .map((truck) => (
                                                    <option key={truck?._id} value={truck?._id}>
                                                        {truck?.user?.first_name} {truck?.user?.middle_name} {truck?.user?.last_name} - {truck?.truck_id} ✓
                                                    </option>
                                                ))}

                                            {/* Non-active trucks (disabled) */}
                                            {trucks?.filter(truck => truck?.status !== 'Active' && truck?.status !== 'On Route')
                                                .map((truck) => (
                                                    <option key={truck?._id} value={truck?._id} disabled>
                                                        {truck?.user?.first_name} {truck?.user?.middle_name} {truck?.user?.last_name} - {truck?.truck_id} ({truck?.status}) ❌
                                                    </option>
                                                ))}
                                        </select>
                                    </div>


                                    {/* Status container */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Truck Status
                                        </label>
                                        <div className={`w-full border rounded-lg px-4 py-3 ${formData.truck && getSelectedTruckStatus() !== 'Active' && getSelectedTruckStatus() !== 'On Route'
                                            ? 'border-amber-300 bg-amber-50'
                                            : 'border-gray-300 bg-gray-50'
                                            }`}>
                                            {formData.truck ? (
                                                (() => {
                                                    const selectedTruck = trucks?.find(truck => truck._id === formData.truck);
                                                    const status = selectedTruck?.status;
                                                    const isReady = status === 'Active' || status === 'On Route';

                                                    return (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm font-medium text-gray-700">Status:</span>
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isReady
                                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                                    }`}>
                                                                    {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}

                                                                </span>
                                                            </div>
                                                            {!isReady && (
                                                                <div className="flex items-start space-x-2 text-amber-600 text-sm">
                                                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <span>This truck cannot be scheduled in its current status.</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <span className="text-gray-500 text-sm">Select a garbage collector to view status</span>
                                            )}
                                        </div>
                                    </div>


                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Garbage Type
                                        </label>
                                        <select
                                            name="garbage_type"
                                            value={formData.garbage_type}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        >
                                            <option value="" disabled>Select Garbage Type</option>
                                            <option value="Biodegradable">Biodegradable</option>
                                            <option value="Non Biodegradable">Non Biodegradable</option>
                                            <option value="Recyclable">Recyclable</option>
                                            {/* <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Under Review">Under Review</option>
                                            <option value="Cancelled">Resolved</option> 
                                            <option value="Invalid">Invalid</option> 
                                            */}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Collection Date
                                        </label>

                                        {/* Display selected date or placeholder */}
                                        <div
                                            onClick={() => setShowCalendarModal(true)}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 cursor-pointer bg-white hover:border-gray-400 flex items-center justify-between"
                                        >
                                            <span className={formData.scheduled_collection ? "text-gray-700" : "text-gray-400"}>
                                                {formData.scheduled_collection
                                                    ? new Date(formData.scheduled_collection).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : 'Select a collection date'
                                                }
                                            </span>
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>

                                        {/* Beautiful Calendar Modal */}
                                        <BeautifulCalendar
                                            name="scheduled_collection"
                                            value={formData.scheduled_collection}
                                            onChange={handleInputChange}
                                            minDate={new Date().toISOString().split('T')[0]}
                                            isOpen={showCalendarModal}
                                            onClose={() => setShowCalendarModal(false)}
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
                                        disabled={editingSchedules && !editingSchedules.is_editable}
                                        className={`px-6 py-2 rounded-lg transition-colors duration-200 font-medium shadow-sm ${editingSchedules && !editingSchedules.is_editable
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                                            }`}
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
                                            {viewingSchedules?.user?.first_name} {viewingSchedules?.user?.middle_name} {viewingSchedules?.user?.last_name}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Gender:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {viewingSchedules?.user?.gender}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Role:</span>
                                        <p className="font-medium text-gray-800">
                                            {formatRole(viewingSchedules?.user?.role)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Contact Number:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingSchedules?.user?.contact_number}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Email Address:</span>
                                        <p className="font-medium text-gray-800">
                                            {viewingSchedules?.user?.email}
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

export default ScheduleManagementLayout;