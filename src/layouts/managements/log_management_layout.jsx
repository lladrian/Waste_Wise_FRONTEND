import React, { useState, useEffect } from 'react';
import {
    FiPlus,
    FiEdit,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiBook,
    FiInfo,
    FiUser,
    FiClock,
    FiCheckCircle,
    FiXCircle
} from 'react-icons/fi';

import { generateReportLoginLog, getAllLoginLog } from "../../hooks/log_management_hook";

import { toast } from "react-toastify";

import DateRangeFilter from '../../components/DateRangeFilter';


const UserManagementLayout = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [editingUsers, setEditingUser] = useState(null);
    const [editingUserPassword, setEditingUserPassword] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
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
        role_action: '',
        role_action_name: '',
        device: '',
        platform: '',
        remark: '',
        status: '',
        created_at: '',
        os: ''
    });


    useEffect(() => {
        fetchData();
    }, []);


    const fetchData = async () => {
        try {
            const { data, success } = await getAllLoginLog();
            if (success === true) {
                setUsers(data.data)
                setFilteredUsers(data.data)
            }
        } catch (err) {
            console.error("Error fetching reg data:", err);
            toast.error("Failed to load registration data");
        }
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


    useEffect(() => {
        filterUsers();
    }, [searchTerm, users, startDate, endDate]);

    const filterUsers = () => {
        let filtered = users;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.middle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.contact_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.role.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Date range filter on created_at string inside each user object (assumed format "YYYY-MM-DD HH:mm:ss")
        if (startDate && endDate) {
            const startDateStr = `${startDate} 00:00:00`;
            const endDateStr = `${endDate} 23:59:59`;

            filtered = filtered.filter(user => {
                const createdAt = user.created_at || user?.user?.created_at || ''; // try both places
                return createdAt >= startDateStr && createdAt <= endDateStr;
            });
        }

        setFilteredUsers(filtered);
    };

    const handleEditPassword = (user, log) => {
        setEditingUserPassword(user)
        setFormData({
            os: log.os,
            device: log.device,
            platform: log.platform,
            remark: log.remark,
            status: log.status,
            created_at: log.created_at,
            email: user.email,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            gender: user.gender,
            contact_number: user.contact_number,
            role: user.role,
            role_action: user.role_action || '',
            role_action_name: user?.role_action?.action_name || "None",
            is_disabled: user.is_disabled
        });

        setShowModalPassword(true);
    };

    const resetForm = () => {
        setFormData({
            os: '',
            device: '',
            platform: '',
            remark: '',
            status: '',
            created_at: '',
            email: '',
            password: '',
            first_name: '',
            middle_name: '',
            last_name: '',
            gender: '',
            contact_number: '',
            role: '',
            is_disabled: '',
            role_action: ''
        });

        setEditingUser(null);
        setEditingUserPassword(null);
    };


    const formatRole = (role) => {
        const roleMap = {
            'admin': 'Admin',
            'resident': 'Resident',
            'enro_staff': 'ENRO Staff',
            'barangay_official': 'Barangay Official',
            'garbage_collector': 'Garbage Collector'
        };

        return roleMap[role] || role; // Return formatted role or original if not found
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


    return (
        <>
            <div className="space-y-6">
                {/* Header Section */}


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
                                        Account Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Logged In
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Device
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Platform
                                    </th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Operating System
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Remark
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user.user.first_name} {user.user.middle_name} {user.user.last_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{formatRole(user.user.role)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{formatDate(user.created_at)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user.device}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user.platform}</span>
                                        </td>
                                          <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user.os}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user.remark}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEditPassword(user.user, user)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Change Password"
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



            {showModalPassword && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[500px] max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-end items-center mb-6">

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

                            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3"> Log Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Device:</span>
                                        <p className="font-medium text-gray-800">
                                            {formData?.device}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Platform:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {formData?.platform}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Operating System:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {formData?.os}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Remark:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {formatRole(formData?.remark)}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-gray-500">Status:</span>
                                        <p className="font-medium text-gray-800 capitalize">
                                            {formData?.status}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-gray-500">Date:</span>
                                        <p className="font-medium text-gray-800">
                                            {formatDate(formData?.created_at)}
                                        </p>
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

export default UserManagementLayout;