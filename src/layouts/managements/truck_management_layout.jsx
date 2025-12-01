import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiBook,
    FiLock,
    FiInfo,
    FiUser,
    FiClock,
    FiCheckCircle,
    FiXCircle
} from 'react-icons/fi';

import { updateTruck, deleteTruck, getAllTruck, createTruck, getSpecificTruck } from "../../hooks/truck_hook";
import BeautifulCalendar from "../../components/BeautifulCalendar";
import { toast } from "react-toastify";

import DateRangeFilter from '../../components/DateRangeFilter';
import { AuthContext } from '../../context/AuthContext';

import MapLocationMarker from '../../components/MapLocationMarker';
import MapLocationMarkerRealtime from '../../components/MapLocationMarkerRealtime';


const TruckManagementLayout = () => {
    const { user } = useContext(AuthContext);
    const [trucks, setTrucks] = useState([]);
    const [users, setUsers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [filteredTrucks, setFilteredTrucks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTrucks, setEditingTruck] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [showModalData, setShowModalData] = useState(false);
    const [endDate, setEndDate] = useState('');
    const [viewingCollectorAttendances, setViewingCollectorAttendance] = useState(null);
    const [selectedView, setSelectedView] = useState('userInfo');
    
    

    const [formData, setFormData] = useState({
        user: '',
        status: '',
        truck_id: '',
    });

    useEffect(() => {
        fetchData();
    }, []);


    const fetchData = async () => {
        try {
            const { data, success } = await getAllTruck();
            if (success === true) {
                setUsers(data.users.data)
                setDrivers(data.drivers)
                setTrucks(data.trucks.data)
                setFilteredTrucks(data.trucks.data)
            }
        } catch (err) {
            console.error("Error fetching reg data:", err);
            toast.error("Failed to load registration data");
        }
    };

    useEffect(() => {
        filterTrucks();
    }, [searchTerm, trucks, startDate, endDate]);


     const handleView = (attendance) => {
        setViewingCollectorAttendance(attendance);
        setShowModalData(true);
    };

    const filterTrucks = () => {
        let filtered = trucks;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(truck =>
                truck?.user?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                truck?.user?.middle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                truck?.user?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                truck?.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${truck.user.first_name} ${truck.user.middle_name} ${truck.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                truck?.truck_id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (startDate && endDate) {
            const startDateStr = `${startDate} 00:00:00`;
            const endDateStr = `${endDate} 23:59:59`;

            filtered = filtered.filter(truck => {
                const createdAt = truck.created_at || ''; // try both places
                return createdAt >= startDateStr && createdAt <= endDateStr;
            });
        }

        setFilteredTrucks(filtered);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        const input_data = {
            truck_id: formData?.truck_id,
            user: formData?.user,
            status: formData?.status,
        };

        if (editingTrucks) {
            try {
                const { data, success } = await updateTruck(editingTrucks._id, input_data);

                if (data && success === false) {
                    toast.error(data.message || "Failed to update truck");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to update truck");
                } else {
                    toast.error("Failed to update truck");
                }
            }
        } else {
            try {
                const { data, success } = await createTruck(input_data);

                if (data && success === false) {
                    toast.error(data.message || "Failed to create truck");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to create truck");
                } else {
                    toast.error("Failed to create truck");
                }
            }
        }

        resetForm();
        setShowModal(false);
    };

    const handleEdit = (truck) => {
        setEditingTruck(truck);
        setFormData({
            user: truck?.user?._id || '',
            status: truck.status,
            truck_id: truck.truck_id,
        });

        setShowModal(true);
    };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this truck?')) {
            try {
                const { data, success } = await deleteTruck(id);

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete truck');
            }
        }
    };


    const resetForm = () => {
        setFormData({
            user: '',
            status: '',
            truck_id: '',
        });

        setEditingTruck(null);
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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


     const formatDateString = (dateString) => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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


    const statusOptions = [
        'Active',
        'On Route',
        'Under Maintenance',
        'Unavailable',
        'Inactive',
    ];


    return (
        <>
            <div className="space-y-6">
                {/* Header Section */}
                {['enro_staff_scheduler'].includes(user.role) && (
                    <div className="flex justify-end">
                        <button
                            disabled={!user?.role_action?.permission?.includes('truck_management_create')}
                            onClick={() => setShowModal(true)}
                            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <FiPlus className="w-4 h-4" />
                            <span>Add New Truck</span>
                        </button>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col gap-4">
                        {/* First Row: Date Range Filter */}
                        {/* <div className="w-full">
                            <DateRangeFilter
                                onChange={({ startDate, endDate }) => {
                                    setStartDate(startDate);
                                    setEndDate(endDate);
                                }}
                                downloadHandler={downloadGeneratedReport}
                            />
                        </div> */}

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
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Latitude
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Longitude
                                    </th> */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Truck ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Truck Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTrucks.map((truck) => (
                                    <tr key={truck._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{truck?.user?.first_name || "None"} {truck?.user?.middle_name} {truck?.user?.last_name}</span>
                                        </td>
                                        {/* <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{truck?.position?.lat}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{truck?.position?.lng}</span>
                                        </td> */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{truck?.truck_id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{truck.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {['enro_staff_scheduler'].includes(user.role) && (
                                                    <>
                                                        <button
                                                            disabled={!user?.role_action?.permission?.includes('truck_management_edit')}
                                                            onClick={() => handleEdit(truck)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Edit"
                                                        >
                                                            <FiEdit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            disabled={!user?.role_action?.permission?.includes('truck_management_delete')}
                                                            onClick={() => handleDelete(truck._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    disabled={!user?.role_action?.permission?.includes('truck_management_full_view')}
                                                    onClick={() => handleView(truck)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {filteredTrucks.length === 0 && (
                        <div className="text-center py-12">
                            <FiBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No truck found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {searchTerm
                                    ? 'Try adjusting your search or filters'
                                    : 'Get started by adding your first truck'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>


             {showModalData && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div className="bg-white rounded-xl shadow-lg w-[800px] max-w-[800px] max-h-[90vh] overflow-y-auto">
                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-xl font-bold text-gray-800">Truck Details</h2>
                                            <button
                                                onClick={() => {
                                                    setShowModalData(false);
                                                    setViewingCollectorAttendance(null);
                                                    resetForm();
                                                }}
                                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                            >
                                                <FiXCircle className="w-6 h-6" />
                                            </button>
                                        </div>
            
                                        {/* Dropdown for view selection */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select View
                                            </label>
                                            <select
                                                value={selectedView}
                                                onChange={(e) => setSelectedView(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                            >
                                                <option value="userInfo">User Information</option>
                                                <option value="realtime_map">Realtime Location Map</option>
                                                {/* <option value="history_route_map">History Route Map</option> */}
                                                {/* <option value="start_map">Start Location Map</option>
                                                <option value="end_map">End Location Map</option> */}
                                            </select>
                                        </div>
            
                                        {selectedView === 'userInfo' ? (
                                            <>
                                                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">User Information</h3>
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">Complete Name:</span>
                                                            <p className="font-medium text-gray-800 capitalize">
                                                                {viewingCollectorAttendances?.user?.first_name} {viewingCollectorAttendances?.user?.middle_name} {viewingCollectorAttendances?.user?.last_name}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Gender:</span>
                                                            <p className="font-medium text-gray-800 capitalize">
                                                                {viewingCollectorAttendances?.user?.gender}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Role:</span>
                                                            <p className="font-medium text-gray-800">
                                                                {formatRole(viewingCollectorAttendances?.user?.role)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Contact Number:</span>
                                                            <p className="font-medium text-gray-800">
                                                                {viewingCollectorAttendances?.user?.contact_number}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Email Address:</span>
                                                            <p className="font-medium text-gray-800">
                                                                {viewingCollectorAttendances?.user?.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
            
            
                                                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Truck Information</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                          
                                                        {/* <div>
                                                            <span className="text-gray-500">Current Position:</span>
                                                            <p>
                                                                Latitude: <span className="font-medium text-gray-800">{viewingCollectorAttendances?.position.lat}</span>,
                                                                Longitude: <span className="font-medium text-gray-800">{viewingCollectorAttendances?.position.lng}</span>
                                                            </p>
                                                        </div> */}
                                                        <div>
                                                            <span className="text-gray-500">Truck ID:</span>
                                                            <p className="font-medium text-gray-800">
                                                                {viewingCollectorAttendances?.truck_id}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Status:</span>
                                                            <p className="font-medium text-gray-800">
                                                                {viewingCollectorAttendances?.status}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        ) : selectedView === 'realtime_map' ? (
                                            <>
                                                <div className="w-full  mb-6">
                                                    <MapLocationMarkerRealtime truck_id={viewingCollectorAttendances?._id} display_type = 'garbage_collector'/>
                                                </div>
                                            </>
                                        )  : (
                                            /* Map Section */
                                            <div className="w-full  mb-6">
                                                <MapLocationMarker
                                                    initialLocation={{
                                                        lat: viewingCollectorAttendances?.position?.lat,
                                                        lng: viewingCollectorAttendances?.position?.lng
                                                    }}
                                                />
                                            </div>
                                        )}
            
                                        {/* Action Buttons */}
                                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                        
                                            <button
                                                onClick={() => {
                                                    setShowModalData(false);
                                                    setViewingCollectorAttendance(null);
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

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[700px] max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingTrucks ? 'Edit Truck' : 'Add New Truck'}
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
                                            Truck ID
                                        </label>
                                        <input
                                            type="text"
                                            name="truck_id"
                                            value={formData.truck_id}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            placeholder="Enter Truck ID"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Truck Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        >
                                            <option value="" disabled>Select Truck Status</option>
                                            {statusOptions.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </div>


                                    {!editingTrucks && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Garbage Collector
                                            </label>
                                            <select
                                                name="user"
                                                value={formData.user}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            >
                                                <option value="" disabled>Select Garbage Collector</option>
                                                {users?.filter(user => user?._id)
                                                    .map((user) => (
                                                        <option key={user._id} value={user._id}>
                                                            {user.first_name} {user.middle_name} {user.last_name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    )}

                                    {editingTrucks && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Garbage Collector
                                            </label>
                                            <select
                                                name="user"
                                                value={formData.user}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            >
                                                <option value="" disabled>Select Garbage Collector</option>
                                                {drivers?.filter(user => user?._id)
                                                    .map((user) => (
                                                        <option key={user._id} value={user._id}>
                                                            {user.first_name} {user.middle_name} {user.last_name}
                                                        </option>
                                                    ))}
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
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                                    >
                                        {editingTrucks ? 'Update Truck' : 'Add Truck'}
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

export default TruckManagementLayout;