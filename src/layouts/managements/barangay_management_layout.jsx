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
    FiMapPin,
    FiInfo,
    FiUser,
    FiClock,
    FiCheckCircle,
    FiXCircle
} from 'react-icons/fi';

import { getSpecificBarangay, createBarangay, getAllBarangay, getAllGarbageSiteSpecifcBarangay, deleteBarangay, updateBarangay } from "../../hooks/barangay_hook";

import { toast } from "react-toastify";
import { AuthContext } from '../../context/AuthContext';

import MapLocationMarkerMultiple from '../../components/MapLocationMarkerMultiple';
import MapLocationPicker from '../../components/MapLocationPicker';


const BarangayManagementLayout = () => {
    const { user } = useContext(AuthContext);
    const [barangays, setBarangays] = useState([]);
    const [garbageSites, setGarbageSites] = useState([]);
    const [garbageSitePositions, setGarbageSitePositions] = useState([]);
    const [filteredBarangays, setFilteredBarangays] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [editingBarangays, setEditingBarangay] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);
    const [barangayStats, setBarangayStats] = useState({});
    const [formData, setFormData] = useState({
        barangay_name: '',
        latitude: '',
        longitude: ''
    });

    const handleLocationSelect = (location) => {
        setFormData(prev => ({
            ...prev,
            latitude: location.lat,
            longitude: location.lng
        }));
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const fetchAllBarangayStats = async () => {
            const stats = {};
            for (const barangay of filteredBarangays) {
                try {
                    const { data, success } = await getAllGarbageSiteSpecifcBarangay(barangay._id);
                    if (success && data?.data) {
                        stats[barangay._id] = data.data.length;
                    } else {
                        stats[barangay._id] = 0;
                    }
                } catch (err) {
                    console.error("Error fetching data for barangay:", barangay._id, err);
                    stats[barangay._id] = 0;
                }
            }
            setBarangayStats(stats);
        };

        if (filteredBarangays.length > 0) {
            fetchAllBarangayStats();
        }
    }, [filteredBarangays]); // Only re-fetch when filteredBarangays changes


    const fetchData = async () => {
        try {
            const { data, success } = await getAllBarangay();
            if (success === true) {
                setBarangays(data.data)
                setFilteredBarangays(data.data)
            }
        } catch (err) {
            console.error("Error fetching reg data:", err);
            toast.error("Failed to load registration data");
        }
    };

    const fetchDataGarbageSites = async (barangay_id) => {
        try {
            const { data, success } = await getAllGarbageSiteSpecifcBarangay(barangay_id);
            if (success === true) {
                const locations = data.data.map(site => ({
                    lat: site.position.lat,
                    lng: site.position.lng
                }));

                setGarbageSites(data.data);
                setGarbageSitePositions(locations);
            }
        } catch (err) {
            console.error("Error fetching reg data:", err);
            toast.error("Failed to load registration data");
        }
    };



    useEffect(() => {
        filterBarangays();
    }, [searchTerm, barangays]);

    const filterBarangays = () => {
        let filtered = barangays;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(barangay =>
                barangay.barangay_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredBarangays(filtered);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        const input_data = {
            barangay_name: formData.barangay_name,
            latitude: formData.latitude,
            longitude: formData.longitude,
        };

        if (editingBarangays) {
            try {
                const { data, success } = await updateBarangay(editingBarangays._id, input_data);

                if (data && success === false) {
                    toast.error(data.message || "Failed to update barangay");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to update barangay");
                } else {
                    toast.error("Failed to update barangay");
                }
            }
        } else {
            try {
                const { data, success } = await createBarangay(input_data);

                if (data && success === false) {
                    toast.error(data.message || "Failed to create barangay");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to create barangay");
                } else {
                    toast.error("Failed to create barangay");
                }
            }
        }

        resetForm();
        setShowModal(false);
        setShowModalPassword(false);
    };

    const handleEdit = (barangay) => {
        setEditingBarangay(barangay);
        setFormData({
            barangay_name: barangay?.barangay_name,
            latitude: barangay?.position?.lat,
            longitude: barangay?.position?.lng
        });
        setShowModal(true);
    };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this barangay?')) {
            try {
                const { data, success } = await deleteBarangay(id);

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete barangay');
            }
        }
    };


    const resetForm = () => {
        setFormData({
            barangay_name: '',
        });

        setEditingBarangay(null);
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleViewMap = (barangay) => {
        fetchDataGarbageSites(barangay._id)
        setShowMapModal(true)
        setEditingBarangay(barangay);
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header Section */}
                {['enro_staff_scheduler'].includes(user.role) && (
                    <div className="flex justify-end">
                        <button
                            disabled={!user?.role_action?.permission?.includes('barangay_management_create')}
                            onClick={() => setShowModal(true)}
                            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <FiPlus className="w-4 h-4" />
                            <span>Add New Barangay</span>
                        </button>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="search barangay"
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
                                        Barangay Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Garbage Sites
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredBarangays.map((barangay) => (
                                    <tr key={barangay._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <span className="text-sm text-gray-900 truncate block">
                                                {barangay.barangay_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">
                                                {barangayStats[barangay._id] !== undefined
                                                    ? `${barangayStats[barangay._id]} Garbage Sites`
                                                    : "Loading..."}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {['enro_staff_scheduler'].includes(user.role) && (
                                                    <>
                                                        <button
                                                            disabled={!user?.role_action?.permission?.includes('barangay_management_edit')}
                                                            onClick={() => handleEdit(barangay)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Edit"
                                                        >
                                                            <FiEdit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            disabled={!user?.role_action?.permission?.includes('barangay_management_delete')}
                                                            onClick={() => handleDelete(barangay._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>

                                                    </>
                                                )}
                                                <button
                                                    disabled={!user?.role_action?.permission?.includes('barangay_management_full_view')}
                                                    onClick={() => handleViewMap(barangay)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="View on Map"
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
                    {filteredBarangays.length === 0 && (
                        <div className="text-center py-12">
                            <FiBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No barangay found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {searchTerm
                                    ? 'Try adjusting your search or filters'
                                    : 'Get started by adding your first barangay'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {showMapModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[800px] max-w-[90vw] max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b">
                            <div className="flex flex-col items-start justify-center text-center space-y-2">
                                <label className="text-xl font-medium text-gray-700">
                                    Total Garbage Sites: ({garbageSites.length})
                                </label>
                                <div className="flex items-center justify-center h-full ">
                                    <label className="text-xl font-medium text-gray-700 flex items-baseline">
                                        Barangay Name: <span className="inline-block max-w-[550px] truncate ml-1">{editingBarangays.barangay_name}</span>
                                    </label>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowMapModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                ✕
                            </button>
                        </div>
                        {/* Map Section */}
                        <div className="w-full h-[500px]">
                            <MapLocationMarkerMultiple barangay_position={editingBarangays.position} locations={garbageSitePositions} />
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
                                    {editingBarangays ? 'Edit Barangay' : 'Add New Barangay'}
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
                                            Barangay Name
                                        </label>
                                        <input
                                            type="text"
                                            name="barangay_name"
                                            value={formData.barangay_name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            placeholder="Enter Barangay Name"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Location on Map
                                        </label>
                                        <div className="border border-gray-300 rounded-lg bg-gray-100 relative overflow-hidden">
                                            <div className="w-full h-full relative">
                                                {editingBarangays ? (
                                                    <MapLocationPicker
                                                        initialLocation={{
                                                            lat: formData.latitude,
                                                            lng: formData.longitude
                                                        }}
                                                        onLocationSelect={handleLocationSelect}
                                                    />
                                                ) : (
                                                    <MapLocationPicker onLocationSelect={handleLocationSelect} />
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Click anywhere on the map to set the garbage site location
                                        </p>
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
                                        {editingBarangays ? 'Update Barangay' : 'Add Barangay'}
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

export default BarangayManagementLayout;