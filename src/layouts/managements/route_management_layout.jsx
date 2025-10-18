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

import { getSpecificRoute, createRoute, getAllRoute, deleteRoute, updateRoute } from "../../hooks/route_hook";

import { toast } from "react-toastify";

const RouteManagementLayout = () => {
    const [routes, setRoutes] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [filteredRoutes, setFilteredRoutes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [editingRouteId, setEditingRouteId] = useState(null);
    const [formData, setFormData] = useState({
        route_name: '',
        barangays: [], // Array of barangay objects with _id and order_index
        selected_barangay: '' // Temporary selection for adding
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data, success } = await getAllRoute();
            if (success === true) {
                setRoutes(data.routes.data)
                setBarangays(data.barangays.data)
                setFilteredRoutes(data.routes.data)
            }
        } catch (err) {
            console.error("Error fetching reg data:", err);
            toast.error("Failed to load registration data");
        }
    };

    useEffect(() => {
        filterRoutes();
    }, [searchTerm, routes]);

    const filterRoutes = () => {
        let filtered = routes;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(route =>
                route.route_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredRoutes(filtered);
    };

    const handleBarangaySelect = (e) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            selected_barangay: value
        }));
    };

    const addBarangay = () => {
        if (!formData.selected_barangay) return;

        const selectedBarangay = barangays.find(b => b._id === formData.selected_barangay);
        if (!selectedBarangay) return;

        setFormData(prev => ({
            ...prev,
            barangays: [...prev.barangays, {
                _id: selectedBarangay._id,
                order_index: prev.barangays.length // Auto-assign order index
            }],
            selected_barangay: '' // Reset selection
        }));
    };

    const removeBarangay = (index) => {
        setFormData(prev => ({
            ...prev,
            barangays: prev.barangays.filter((_, i) => i !== index)
                .map((barangay, newIndex) => ({
                    ...barangay,
                    order_index: newIndex // Re-index after removal
                }))
        }));
    };

    const moveBarangayUp = (index) => {
        if (index === 0) return;

        setFormData(prev => {
            const newBarangays = [...prev.barangays];
            // Swap positions
            [newBarangays[index - 1], newBarangays[index]] = [newBarangays[index], newBarangays[index - 1]];

            // Update order indexes
            return {
                ...prev,
                barangays: newBarangays.map((barangay, idx) => ({
                    ...barangay,
                    order_index: idx
                }))
            };
        });
    };

    const moveBarangayDown = (index) => {
        if (index === formData.barangays.length - 1) return;

        setFormData(prev => {
            const newBarangays = [...prev.barangays];
            // Swap positions
            [newBarangays[index], newBarangays[index + 1]] = [newBarangays[index + 1], newBarangays[index]];

            // Update order indexes
            return {
                ...prev,
                barangays: newBarangays.map((barangay, idx) => ({
                    ...barangay,
                    order_index: idx
                }))
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare the data according to your schema
        const input_data = {
            route_name: formData.route_name,
            merge_barangay: formData.barangays.map(barangay => ({
                barangay_id: barangay._id,
                order_index: barangay.order_index
            }))
        };

        console.log('Submitting data:', input_data); // Debug log

        try {
            if (editingRouteId) {
                // Update existing route
                const { data, success } = await updateRoute(editingRouteId, input_data);
                
                if (success === true) {
                    toast.success('Route updated successfully');
                    fetchData();
                    setShowModal(false);
                    resetForm();
                } else {
                    toast.error(data?.message || "Failed to update route");
                }
            } else {
                // Create new route
                const { data, success } = await createRoute(input_data);
                
                if (success === true) {
                    toast.success('Route created successfully');
                    fetchData();
                    setShowModal(false);
                    resetForm();
                } else {
                    toast.error(data?.message || "Failed to create route");
                }
            }
        } catch (error) {
            console.error('Error submitting route:', error);
            if (error.response && error.response.data) {
                toast.error(error.response.data.message || "Failed to save route");
            } else {
                toast.error("Failed to save route");
            }
        }
    };

    const getBarangayName = (barangayId) => {
        const barangay = barangays.find(b => b._id === barangayId);
        return barangay?.barangay_name || 'Unknown Barangay';
    };

    const handleEdit = (route) => {
        console.log('Editing route:', route); // Debug log
        
        setEditingRouteId(route._id);
        
        // Transform the route data to match form structure
        let barangaysArray = [];

        if (route.merge_barangay && route.merge_barangay.length > 0) {
            barangaysArray = route.merge_barangay.map((barangay, index) => {
                // Handle different possible data structures
                if (typeof barangay === 'object') {
                    if (barangay.barangay_id) {
                        // Structure: { barangay_id, order_index }
                        return {
                            _id: barangay.barangay_id,
                            order_index: barangay.order_index || index
                        };
                    } else if (barangay._id) {
                        // Structure: { _id, order_index }
                        return {
                            _id: barangay._id,
                            order_index: barangay.order_index || index
                        };
                    }
                }
                // Fallback: assume it's an ObjectId string
                return {
                    _id: barangay,
                    order_index: index
                };
            });
        }

        console.log('Transformed barangays:', barangaysArray); // Debug log

        setFormData({
            route_name: route.route_name || '',
            barangays: barangaysArray,
            selected_barangay: ''
        });

        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this route?')) {
            try {
                const { data, success } = await deleteRoute(id);

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
            route_name: '',
            barangays: [],
            selected_barangay: ''
        });
        setEditingRouteId(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex justify-end">
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <FiPlus className="w-4 h-4" />
                        <span>Add New Route</span>
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
                                placeholder="search route"
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
                                        Route Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Barangays
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRoutes.map((route) => (
                                    <tr key={route._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900 font-medium">{route.route_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                {route.merge_barangay && route.merge_barangay.length > 0 ? (
                                                    <span>
                                                        {route.merge_barangay.length} Barangays
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">No barangay</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(route)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(route._id)}
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
                    {filteredRoutes.length === 0 && (
                        <div className="text-center py-12">
                            <FiBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No route found</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {searchTerm
                                    ? 'Try adjusting your search or filters'
                                    : 'Get started by adding your first route'
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
                                    {editingRouteId ? 'Edit Route' : 'Add New Route'}
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
                                            Route Name
                                        </label>
                                        <input
                                            type="text"
                                            name="route_name"
                                            value={formData.route_name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            placeholder="Enter Route Name"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Barangays (Multiple Selection)
                                        </label>

                                        {/* Selected Barangays with Order Index */}
                                        {formData.barangays && formData.barangays.length > 0 && (
                                            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Barangays Order:</h4>
                                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                                    {formData.barangays
                                                        .sort((a, b) => a.order_index - b.order_index)
                                                        .map((barangay, index) => (
                                                            <div key={barangay._id} className="flex items-center justify-between bg-white p-3 rounded border">
                                                                <div className="flex items-center space-x-3">
                                                                    <span className="flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium">
                                                                        {barangay.order_index + 1}
                                                                    </span>
                                                                    <span className="text-sm font-medium text-gray-700">
                                                                        {getBarangayName(barangay._id)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => moveBarangayUp(index)}
                                                                        disabled={index === 0}
                                                                        className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                                    >
                                                                        ↑
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => moveBarangayDown(index)}
                                                                        disabled={index === formData.barangays.length - 1}
                                                                        className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                                    >
                                                                        ↓
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeBarangay(index)}
                                                                        className="p-1 text-gray-400 hover:text-red-600"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Barangay Selection */}
                                        <div className="flex space-x-2">
                                            <select
                                                name="selected_barangay"
                                                value={formData.selected_barangay || ''}
                                                onChange={handleBarangaySelect}
                                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            >
                                                <option value="" disabled>Select Barangay to Add</option>
                                                {barangays
                                                    ?.filter(barangay => {
                                                        const isAlreadySelected = formData.barangays?.some(b => b._id === barangay._id);
                                                        return barangay?._id && !isAlreadySelected;
                                                    })
                                                    .map((barangay) => (
                                                        <option key={barangay._id} value={barangay._id}>
                                                            {barangay.barangay_name}
                                                        </option>
                                                    ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={addBarangay}
                                                disabled={!formData.selected_barangay}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {formData.barangays?.length || 0} barangay(s) selected. Use arrows to reorder.
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
                                        disabled={!formData.barangays || formData.barangays.length === 0}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm hover:shadow-md"
                                    >
                                        {editingRouteId ? 'Update Route' : 'Add Route'}
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

export default RouteManagementLayout;