import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiBook,
    FiMapPin,
    FiInfo,
    FiLock,
    FiUser,
    FiClock,
    FiCheckCircle,
    FiXCircle
} from 'react-icons/fi';

import { createGarbageSite, getAllGarbageSite, deleteGarbageSite, updateGarbageSite } from "../../hooks/garbage_site_management_hook";

import { toast } from "react-toastify";

import MapLocationPicker from '../../components/MapLocationPicker';
import MapLocationMarker from '../../components/MapLocationMarker';

import { AuthContext } from '../../context/AuthContext';


const GarbageSiteManagementLayout = () => {
    const { user } = useContext(AuthContext);
    const [garbageSites, setGarbageSites] = useState([]);
    const [filteredGarbageSites, setFilteredGarbageSites] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [editingGarbageSites, setEditingGarbageSite] = useState(null);
    const [barangays, setBarangays] = useState([]);
    const [viewingReportGarbages, setViewingReportGarbage] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);


    // Also update your formData state to include markerPosition
    const [formData, setFormData] = useState({
        barangay: '',
        garbage_site_name: '',
        latitude: '',
        longitude: '',
        markerPosition: null // { x: number, y: number }
    });

    // And update resetForm to reset markerPosition
    const resetForm = () => {
        setFormData({
            barangay: '',
            garbage_site_name: '',
            latitude: '',
            longitude: '',
            markerPosition: null
        });
        setEditingGarbageSite(null);
    };

    useEffect(() => {
        fetchData();
    }, []);


    const handleViewMap = (site) => {
        setViewingReportGarbage(site);
        setShowMapModal(true)
    };

    const fetchData = async () => {
        try {
            const { data, success } = await getAllGarbageSite();
            if (success === true) {
                const filteredBarangays = data?.barangays?.data?.filter(barangay => barangay?._id === user?.barangay?._id);
                const filteredGarbageSites = data?.garbage_sites?.data?.filter(site => site?.barangay?._id === user?.barangay?._id);

                if (user.role === 'barangay_official') {
                    setBarangays(filteredBarangays)
                    setGarbageSites(filteredGarbageSites)
                    setFilteredGarbageSites(filteredGarbageSites)
                } else {
                    setBarangays(data.barangays.data)
                    setGarbageSites(data.garbage_sites.data)
                    setFilteredGarbageSites(data.garbage_sites.data)
                }
            }
        } catch (err) {
            console.error("Error fetching reg data:", err);
            toast.error("Failed to load registration data");
        }
    };

    useEffect(() => {
        filterGarbageSites();
    }, [searchTerm, garbageSites]);

    const filterGarbageSites = () => {
        let filtered = garbageSites;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(site =>
                site.garbage_site_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredGarbageSites(filtered);
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        const input_data = {
            barangay: formData.barangay,
            garbage_site_name: formData.garbage_site_name,
            latitude: formData.latitude,
            longitude: formData.longitude,
        };

        if (editingGarbageSites) {
            try {
                const { data, success } = await updateGarbageSite(editingGarbageSites._id, input_data);

                if (data && success === false) {
                    toast.error(data.message || "Failed to update garbage site");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to update garbage site");
                } else {
                    toast.error("Failed to update garbage site");
                }
            }
        } else {
            try {
                const { data, success } = await createGarbageSite(input_data);

                if (data && success === false) {
                    toast.error(data.message || "Failed to create garbage site");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to create garbage site");
                } else {
                    toast.error("Failed to create garbage site");
                }
            }
        }

        resetForm();
        setShowModal(false);
        setShowModalPassword(false);
    };

    const handleEdit = (site) => {
        setEditingGarbageSite(site);
        setFormData({
            barangay: site.barangay._id,
            garbage_site_name: site.garbage_site_name,
            latitude: site.position.lat,
            longitude: site.position.lng,
        });

        setShowModal(true);
    };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this garbage site?')) {
            try {
                const { data, success } = await deleteGarbageSite(id);

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete garbage site');
            }
        }
    };





    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };


    const handleLocationSelect = (location) => {
        console.log('Selected location:', location);
        setFormData(prev => ({
            ...prev,
            latitude: location.lat,
            longitude: location.lng
        }));
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header Section */}
                {['enro_staff_scheduler', 'barangay_official'].includes(user.role) && (
                    <div className="flex justify-end">
                        <button
                            disabled={!user?.role_action?.permission?.includes('garbage_site_management_create')}
                            onClick={() => setShowModal(true)}
                            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2   rounded-lg hover:bg-indigo-700 transition-colors  disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiPlus className="w-4 h-4" />
                            <span>Add New Garbage Site</span>
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
                                        Site Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Barangay Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Latitude
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Longitude
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredGarbageSites.map((site) => (
                                    <tr key={site._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{site.garbage_site_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{site.barangay.barangay_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{site.position.lat}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{site.position.lng}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {['enro_staff_scheduler', 'barangay_official'].includes(user.role) && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(site)}
                                                            disabled={!user?.role_action?.permission?.includes('garbage_site_management_edit')}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors  disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Edit"
                                                        >
                                                            <FiEdit className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            disabled={!user?.role_action?.permission?.includes('garbage_site_management_delete')}
                                                            onClick={() => handleDelete(site._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    disabled={!user?.role_action?.permission?.includes('garbage_site_management_full_view')}
                                                    onClick={() => handleViewMap(site)}
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
                    {filteredGarbageSites.length === 0 && (
                        <div className="text-center py-12">
                            <FiBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No garbage site found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {searchTerm
                                    ? 'Try adjusting your search or filters'
                                    : 'Get started by adding your first garbage site'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {showMapModal && viewingReportGarbages && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[800px] max-w-[90vw] max-h-[90vh] overflow-hidden">

                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-800">Location Map</h2>
                            <button
                                onClick={() => setShowMapModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Display Info Based on viewingReportGarbages */}
                        <div className="p-4 space-y-2 border-b">
                            <p><strong>Site:</strong> {viewingReportGarbages.garbage_site_name}</p>
                            <p><strong>Barangay:</strong> {viewingReportGarbages.barangay.barangay_name}</p>
                            <p><strong>Latitude:</strong> {viewingReportGarbages.position.lat}</p>
                            <p><strong>Longitude:</strong> {viewingReportGarbages.position.lng}</p>
                        </div>

                        {/* Map Section */}
                        <div className="w-full h-[500px]">
                            <MapLocationMarker
                                initialLocation={{
                                    lat: viewingReportGarbages.position.lat,
                                    lng: viewingReportGarbages.position.lng
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}


            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[800px] max-w-[800px] max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingGarbageSites ? 'Edit Garbage Site' : 'Add New Garbage Site'}
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
                                            Barangay
                                        </label>
                                        <select
                                            name="barangay"
                                            value={formData.barangay || ""}
                                            onChange={handleInputChange}
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
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Site Name
                                        </label>
                                        <input
                                            type="text"
                                            name="garbage_site_name"
                                            value={formData.garbage_site_name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            placeholder="Enter Site Name"
                                        />
                                    </div>

                                    {/* Map Container */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Location on Map
                                        </label>
                                        <div className="border border-gray-300 rounded-lg bg-gray-100 relative overflow-hidden">
                                            <div className="w-full h-full relative">
                                                {editingGarbageSites ? (
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

                                    {/* Latitude and Longitude Display */}
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Latitude
                                        </label>
                                        <input
                                            type="text"
                                            name="latitude"
                                            value={formData.latitude || ""}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                                            placeholder="Click on map to set latitude"
                                        />
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Longitude
                                        </label>
                                        <input
                                            type="text"
                                            name="longitude"
                                            value={formData.longitude || ""}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                                            placeholder="Click on map to set longitude"
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
                                        {editingGarbageSites ? 'Update Garbage Site' : 'Add Garbage Site'}
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

                            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Barangay Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Barangay Name:</span>
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

export default GarbageSiteManagementLayout;