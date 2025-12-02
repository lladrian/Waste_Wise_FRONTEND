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
    FiUser,
    FiClock,
    FiCheckCircle,
    FiXCircle
} from 'react-icons/fi';

import { updateRoleAction, deleteRoleAction, getAllRoleAction, createRoleAction, getSpecificRoleAction } from "../../hooks/permission_management_hook";
import { AuthContext } from '../../context/AuthContext';
import { toast } from "react-toastify";

const RoleActionManagementLayout = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalPassword, setShowModalPassword] = useState(false);
    const [editingUsers, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        action_name: '',
        role: '',
        permission: [],
        management: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data, success } = await getAllRoleAction();
            if (success === true) {
                setUsers(data.data)
                setFilteredUsers(data.data)
            }
        } catch (err) {
            console.error("Error fetching reg data:", err);
            toast.error("Failed to load registration data");
        }
    };

    useEffect(() => {
        filterUsers();
    }, [searchTerm, users]);

    const filterUsers = () => {
        let filtered = users;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.action_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredUsers(filtered);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const permissionValues = formData.permission ? formData.permission.map(option =>
            typeof option === 'string' ? option : option.value
        ) : [];

        const managementData = formData.management ? formData.management.map(option => {
            const managementValue = typeof option === 'string' ? option : option.value;
            // Find the full option to get the route - FILTER BY SELECTED ROLE
            const fullOption = managementOptions.find(m =>
                m.value === managementValue && m.role === formData.role
            );
            return {
                value: managementValue,
                route: fullOption ? fullOption.route : '', // Get the route from the option
                label: fullOption ? fullOption.label : managementValue
            };
        }) : [];

        const managementValues = managementData.map(item => item.value);
        const managementRoutes = managementData.map(item => item.route);

        const input_data = {
            role: formData.role,
            action_name: formData.action_name,
            permission: permissionValues,
            management: managementValues,
            route: managementRoutes,
        };

        if (editingUsers) {
            try {
                const { data, success } = await updateRoleAction(editingUsers._id, input_data);

                if (data && success === false) {
                    toast.error(data.message || "Failed to update role action");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to update role action");
                } else {
                    toast.error("Failed to update role action");
                }
            }
        } else {
            try {
                const { data, success } = await createRoleAction(input_data);

                if (data && success === false) {
                    toast.error(data.message || "Failed to create role action");
                }

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                if (error.response && error.response.data) {
                    toast.error(error.response.data.message || error.message || "Failed to create role action");
                } else {
                    toast.error("Failed to create role action");
                }
            }
        }

        resetForm();
        setShowModal(false);
        setShowModalPassword(false);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            role: user.role,
            action_name: user.action_name,
            permission: user.permission || [],
            management: user.management || []
        });

        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const { data, success } = await deleteRoleAction(id);

                if (success === true) {
                    toast.success(data.data);
                    fetchData();
                }
            } catch (error) {
                console.error('Delete failed:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            action_name: '',
            role: '',
            permission: [],
            management: []
        });

        setEditingUser(null);
    };

    const managementOptions = [
        { value: 'barangay_complain_management', label: 'Barangay Complain Management', route: '/official/management/complains', role: 'barangay_official' },
        { value: 'barangay_request_management', label: 'Barangay Request Management', route: '/official/management/barangay_requests', role: 'barangay_official' },
        { value: 'collector_report_management', label: 'Collector Report Management', route: '/official/management/collector_reports', role: 'barangay_official' },
        { value: 'garbage_report_management', label: 'Garbage Report Management', route: '/official/management/garbage_reports', role: 'barangay_official' },
        { value: 'garbage_site_management', label: 'Garbage Site Management', route: '/official/management/garbage_sites', role: 'barangay_official' },
        { value: 'resident_management', label: 'Resident Management', route: '/official/management/residents', role: 'barangay_official' },
        { value: 'schedule_management', label: 'Schedule Management', route: '/official/management/schedules', role: 'barangay_official' },

        { value: 'user_management', label: 'User Management', route: '/admin/management/users', role: 'admin' },
        { value: 'resident_management', label: 'Resident Management', route: '/admin/management/residents', role: 'admin' },
        { value: 'role_action_management', label: 'Role Action Management', route: '/admin/management/role_actions', role: 'admin' },
        { value: 'log_management', label: 'Log Management', route: '/admin/management/logs', role: 'admin' },
        { value: 'schedule_management', label: 'Schedule Management', route: '/admin/management/schedules', role: 'admin' },
        { value: 'barangay_complain_management', label: 'Barangay Complain Management', route: '/admin/management/complains', role: 'admin' },
        { value: 'barangay_request_management', label: 'Barangay Request Management', route: '/admin/management/barangay_requests', role: 'admin' },
        { value: 'route_management', label: 'Route Management', route: '/admin/management/routes', role: 'admin' },
        { value: 'barangay_management', label: 'Barangay Management', route: '/admin/management/barangays', role: 'admin' },
        { value: 'truck_management', label: 'Truck Management', route: '/admin/management/trucks', role: 'admin' },
        { value: 'garbage_site_management', label: 'Garbage Site Management', route: '/admin/management/garbage_sites', role: 'admin' },
        { value: 'garbage_report_management', label: 'Garbage Report Management', route: '/admin/management/garbage_reports', role: 'admin' },
        { value: 'collector_report_management', label: 'Collector Report Management', route: '/admin/management/collector_reports', role: 'admin' },
        { value: 'collector_attendance_management', label: 'Collector Attendance Management', route: '/admin/management/collector_attendances', role: 'admin' },

        { value: 'log_management', label: 'Log Management', route: '/staff/management/logs', role: 'enro_staff_monitoring' },
        { value: 'garbage_report_management', label: 'Garbage Report Management', route: '/staff/management/garbage_reports', role: 'enro_staff_monitoring' },
        { value: 'garbage_site_management', label: 'Garbage Site Management', route: '/staff/management/garbage_sites', role: 'enro_staff_monitoring' },
        { value: 'collector_report_management', label: 'Collector Report Management', route: '/staff/management/collector_reports', role: 'enro_staff_monitoring' },
        { value: 'collector_attendance_management', label: 'Collector Attendance Management', route: '/staff/management/collector_attendances', role: 'enro_staff_monitoring' },
        { value: 'schedule_management', label: 'Schedule Management', route: '/staff/management/schedules', role: 'enro_staff_monitoring' },
        { value: 'route_management', label: 'Route Management', route: '/staff/management/routes', role: 'enro_staff_monitoring' },
        { value: 'truck_management', label: 'Truck Management', route: '/staff/management/trucks', role: 'enro_staff_monitoring' },
        { value: 'barangay_management', label: 'Barangay Management', route: '/staff/management/barangays', role: 'enro_staff_monitoring' },
        { value: 'barangay_complain_management', label: 'Barangay Complain Management', route: '/staff/management/complains', role: 'enro_staff_monitoring' },
        { value: 'barangay_request_management', label: 'Barangay Request Management', route: '/staff/management/barangay_requests', role: 'enro_staff_monitoring' },

        { value: 'log_management', label: 'Log Management', route: '/staff/management/logs', role: 'enro_staff_head' },
        { value: 'garbage_report_management', label: 'Garbage Report Management', route: '/staff/management/garbage_reports', role: 'enro_staff_head' },
        { value: 'garbage_site_management', label: 'Garbage Site Management', route: '/staff/management/garbage_sites', role: 'enro_staff_head' },
        { value: 'collector_report_management', label: 'Collector Report Management', route: '/staff/management/collector_reports', role: 'enro_staff_head' },
        { value: 'collector_attendance_management', label: 'Collector Attendance Management', route: '/staff/management/collector_attendances', role: 'enro_staff_head' },
        { value: 'schedule_management', label: 'Schedule Management', route: '/staff/management/schedules', role: 'enro_staff_head' },
        { value: 'route_management', label: 'Route Management', route: '/staff/management/routes', role: 'enro_staff_head' },
        { value: 'truck_management', label: 'Truck Management', route: '/staff/management/trucks', role: 'enro_staff_head' },
        { value: 'barangay_management', label: 'Barangay Management', route: '/staff/management/barangays', role: 'enro_staff_head' },
        { value: 'barangay_complain_management', label: 'Barangay Complain Management', route: '/staff/management/complains', role: 'enro_staff_head' },
        { value: 'barangay_request_management', label: 'Barangay Request Management', route: '/staff/management/barangay_requests', role: 'enro_staff_head' },

        { value: 'log_management', label: 'Log Management', route: '/staff/management/logs', role: 'enro_staff_scheduler' },
        { value: 'garbage_report_management', label: 'Garbage Report Management', route: '/staff/management/garbage_reports', role: 'enro_staff_scheduler' },
        { value: 'garbage_site_management', label: 'Garbage Site Management', route: '/staff/management/garbage_sites', role: 'enro_staff_scheduler' },
        { value: 'collector_report_management', label: 'Collector Report Management', route: '/staff/management/collector_reports', role: 'enro_staff_scheduler' },
        { value: 'collector_attendance_management', label: 'Collector Attendance Management', route: '/staff/management/collector_attendances', role: 'enro_staff_scheduler' },
        { value: 'schedule_management', label: 'Schedule Management', route: '/staff/management/schedules', role: 'enro_staff_scheduler' },
        { value: 'route_management', label: 'Route Management', route: '/staff/management/routes', role: 'enro_staff_scheduler' },
        { value: 'truck_management', label: 'Truck Management', route: '/staff/management/trucks', role: 'enro_staff_scheduler' },
        { value: 'barangay_management', label: 'Barangay Management', route: '/staff/management/barangays', role: 'enro_staff_scheduler' },
        { value: 'barangay_complain_management', label: 'Barangay Complain Management', route: '/staff/management/complains', role: 'enro_staff_scheduler' },
        { value: 'barangay_request_management', label: 'Barangay Request Management', route: '/staff/management/barangay_requests', role: 'enro_staff_scheduler' },

        { value: 'log_management', label: 'Log Management', route: '/staff/management/logs', role: 'enro_staff_eswm_section_head' },
        { value: 'garbage_report_management', label: 'Garbage Report Management', route: '/staff/management/garbage_reports', role: 'enro_staff_eswm_section_head' },
        { value: 'garbage_site_management', label: 'Garbage Site Management', route: '/staff/management/garbage_sites', role: 'enro_staff_eswm_section_head' },
        { value: 'collector_report_management', label: 'Collector Report Management', route: '/staff/management/collector_reports', role: 'enro_staff_eswm_section_head' },
        { value: 'collector_attendance_management', label: 'Collector Attendance Management', route: '/staff/management/collector_attendances', role: 'enro_staff_eswm_section_head' },
        { value: 'schedule_management', label: 'Schedule Management', route: '/staff/management/schedules', role: 'enro_staff_eswm_section_head' },
        { value: 'route_management', label: 'Route Management', route: '/staff/management/routes', role: 'enro_staff_eswm_section_head' },
        { value: 'truck_management', label: 'Truck Management', route: '/staff/management/trucks', role: 'enro_staff_eswm_section_head' },
        { value: 'barangay_management', label: 'Barangay Management', route: '/staff/management/barangays', role: 'enro_staff_eswm_section_head' },
        { value: 'barangay_complain_management', label: 'Barangay Complain Management', route: '/staff/management/complains', role: 'enro_staff_eswm_section_head' },
        { value: 'barangay_request_management', label: 'Barangay Request Management', route: '/staff/management/barangay_requests', role: 'enro_staff_eswm_section_head' },
    ];

   const permissionOptions = [
        { value: 'schedule_management_full_view', label: 'Schedule Full View', management: 'schedule_management', role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official']},
        { value: 'schedule_management_create', label: 'Schedule Create', management: 'schedule_management', role: ['enro_staff_scheduler']},
        { value: 'schedule_management_edit', label: 'Schedule Edit', management: 'schedule_management', role: ['enro_staff_scheduler'] },
        { value: 'schedule_management_delete', label: 'Schedule Delete', management: 'schedule_management', role: ['enro_staff_scheduler'] },
        { value: 'barangay_complain_management_full_view', label: 'Barangay Complain Full View', management: 'barangay_complain_management', role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official']},
        { value: 'barangay_complain_management_create', label: 'Barangay Complain Create', management: 'barangay_complain_management', role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official'] },
        { value: 'barangay_complain_management_approval', label: 'Barangay Complain Approval', management: 'barangay_complain_management', role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official']},
        { value: 'garbage_site_management_create', label: 'Garbage Site Create', management: 'garbage_site_management', role: ['enro_staff_scheduler', 'barangay_official']},
        { value: 'garbage_site_management_delete', label: 'Garbage Site Delete', management: 'garbage_site_management', role: ['enro_staff_scheduler', 'barangay_official'] },
        { value: 'garbage_site_management_edit', label: 'Garbage Site Edit', management: 'garbage_site_management', role: ['enro_staff_scheduler', 'barangay_official'] },
        { value: 'garbage_site_management_full_view', label: 'Garbage Site Full View', management: 'garbage_site_management', role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official'] },
        { value: 'garbage_report_management_full_view', label: 'Garbage Report Full View', management: 'garbage_report_management', role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official'] },
        { value: 'collector_report_management_full_view', label: 'Collector Report Full View', management: 'collector_report_management', role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official'] },
        { value: 'collector_report_management_approval', label: 'Collector Report Approval', management: 'collector_report_management', role: ['enro_staff_head', 'enro_staff_eswm_section_head']},
        { value: 'barangay_request_management_full_view', label: 'Barangay Request Full View', management: 'barangay_request_management', role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official'] },
        { value: 'barangay_request_management_create', label: 'Barangay Request Create', management: 'barangay_request_management', role: ['barangay_official']},
        { value: 'barangay_request_management_approval', label: 'Barangay Request Approval', management: 'barangay_request_management', role: ['enro_staff_eswm_section_head', 'enro_staff_head']},
        { value: 'resident_management_full_view', label: 'Resident Full View', management: 'resident_management', role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official'] },
        { value: 'resident_management_edit', label: 'Resident Edit', management: 'resident_management', role: ['admin']},
        { value: 'user_management_full_view', label: 'User Full View', management: 'user_management', role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official'] },
        { value: 'user_management_create', label: 'User Create', management: 'user_management', role: ['admin']},
        { value: 'user_management_delete', label: 'User Delete', management: 'user_management', role: ['admin']},
        { value: 'user_management_edit', label: 'User Edit', management: 'user_management', role: ['admin']},
        { value: 'role_action_management_edit', label: 'Role Action Edit', management: 'role_action_management', role: ['admin']},
        { value: 'role_action_management_delete', label: 'Role Action Delete', management: 'role_action_management', role: ['admin']},
        { value: 'role_action_management_create', label: 'Role Action Create', management: 'role_action_management', role: ['admin'] },
        { value: 'log_management_full_view', label: 'Log Full View', management: 'log_management', role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official'] },
        { value: 'route_management_full_view', label: 'Route Full View', management: 'route_management', role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official'] },
        { value: 'route_management_create', label: 'Route Create', management: 'route_management', role: ['enro_staff_scheduler']},
        { value: 'route_management_edit', label: 'Route Edit', management: 'route_management', role: ['enro_staff_scheduler']},
        { value: 'route_management_delete', label: 'Route Delete', management: 'route_management', role: ['enro_staff_scheduler']},
        { value: 'barangay_management_full_view', label: 'Barangay Full View', management: 'barangay_management', role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official'] },
        { value: 'barangay_management_create', label: 'Barangay Create', management: 'barangay_management', role: ['enro_staff_scheduler']},
        { value: 'barangay_management_edit', label: 'Barangay Edit', management: 'barangay_management', role: ['enro_staff_scheduler']},
        { value: 'barangay_management_delete', label: 'Barangay Delete', management: 'barangay_management', role: ['enro_staff_scheduler'] },
        { value: 'truck_management_full_view', label: 'Truck Full View', management: 'truck_management', role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official']},
        { value: 'truck_management_create', label: 'Truck Create', management: 'truck_management', role: ['enro_staff_scheduler']},
        { value: 'truck_management_edit', label: 'Truck Edit', management: 'truck_management', role: ['enro_staff_scheduler']},
        { value: 'truck_management_delete', label: 'Truck Delete', management: 'truck_management', role: ['enro_staff_scheduler']},
        { value: 'collector_attendance_management_full_view', label: 'Collector Attendance Full View', management: 'collector_attendance_management',  role: ['admin', 'enro_staff_monitoring', 'enro_staff_head', 'enro_staff_scheduler', 'enro_staff_eswm_section_head', 'barangay_official'] },
    ];


    // Get filtered permission options based on selected management modules
    const getFilteredPermissionOptions = () => {
        if (!formData.management || formData.management.length === 0) {
            return [];
        }

        const selectedManagementValues = formData.management.map(management =>
            typeof management === 'string' ? management : management.value
        );

        return permissionOptions.filter(permission =>
            selectedManagementValues.includes(permission.management) &&
            permission.role.includes(formData.role)  // ← filter by role
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // If role is changing, clear management and permission selections
        if (name === 'role' && formData.role !== value) {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                management: [], // Clear management selections
                permission: []  // Clear permission selections
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle select change - convert option objects back to values
    const handleSelectChangePermission = (selectedOptions) => {
        // Extract just the values from the selected option objects
        const permissionValues = selectedOptions ? selectedOptions.map(option => option.value) : [];

        setFormData(prev => ({
            ...prev,
            permission: permissionValues
        }));
    };

    const handleSelectChangeManagement = (selectedOptions) => {
        // Extract just the values from the selected option objects
        const managementValues = selectedOptions ? selectedOptions.map(option => option.value) : [];

        // Filter permissions to keep only those that belong to the newly selected management modules
        const filteredPermissions = formData.permission.filter(permission => {
            const permissionValue = typeof permission === 'string' ? permission : permission.value;
            const permissionOption = permissionOptions.find(opt => opt.value === permissionValue);
            return permissionOption && managementValues.includes(permissionOption.management);
        });

        setFormData(prev => ({
            ...prev,
            management: managementValues,
            permission: filteredPermissions
        }));
    };

    const getSelectedOptionsPermission = (permissionValues) => {
        return permissionValues.map(value => {
            // Find the option object for this value
            const option = permissionOptions.find(opt => opt.value === value);
            // If found, return the option object, otherwise create a fallback
            return option || { value: value, label: value };
        });
    };

    const getSelectedOptionsManagement = (managementValues) => {
        return managementValues.map(value => {
            // Find the option object for this value
            const option = managementOptions.find(opt => opt.value === value);
            // If found, return the option object, otherwise create a fallback
            return option || { value: value, label: value };
        });
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

    return (
        <>
            <div className="space-y-6">
                {/* Header Section */}
                {['admin'].includes(user.role) && (
                    <div className="flex justify-end">
                        <button
                            disabled={!user?.role_action?.permission?.includes('role_action_management_create')}
                            onClick={() => setShowModal(true)}
                            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <FiPlus className="w-4 h-4" />
                            <span>Add New User</span>
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
                                        Role Action Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((role) => (
                                    <tr key={role._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{role.action_name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{formatRole(role.role)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {['admin'].includes(user.role) && (
                                                    <button
                                                        onClick={() => handleEdit(role)}
                                                        disabled={!user?.role_action?.permission?.includes('role_action_management_edit')}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Edit"
                                                    >
                                                        <FiEdit className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {['admin'].includes(user.role) && (

                                                    <button
                                                        onClick={() => handleDelete(role._id)}
                                                        disabled={!user?.role_action?.permission?.includes('role_action_management_delete')}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                )}
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

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-lg w-[700px] max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingUsers ? 'Edit Role Action' : 'Add New Role Action'}
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
                                            Role
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                        >
                                            <option value="" disabled>Select Role</option>
                                            <option value="admin">Admin</option>
                                            <option value="enro_staff_monitoring">ENRO Staff Monitoring</option>
                                            <option value="enro_staff_scheduler">ENRO Staff Scheduler</option>
                                            <option value="enro_staff_head">ENRO Staff Head</option>
                                            <option value="enro_staff_eswm_section_head">ENRO Staff ESWM Section Head</option>
                                            <option value="barangay_official">Barangay Official</option>
                                            <option value="garbage_collector">Garbage Collector</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role Action Name
                                        </label>
                                        <input
                                            type="text"
                                            name="action_name"
                                            value={formData.action_name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            placeholder="Enter Role Action Name"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Management
                                        </label>
                                        <Select
                                            id="management-select"
                                            name="management"
                                            isMulti
                                            options={managementOptions.filter(option =>
                                                option.role === formData.role
                                            )}
                                            value={getSelectedOptionsManagement(formData.management)}
                                            onChange={handleSelectChangeManagement}
                                            placeholder="Choose managements..."
                                            isSearchable
                                            closeMenuOnSelect={false}
                                            styles={{
                                                menu: (base) => ({
                                                    ...base,
                                                    zIndex: 9999
                                                }),
                                                menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999
                                                })
                                            }}
                                            menuPortalTarget={document.body}
                                        />
                                        {formData.role && managementOptions.filter(option => option.role === formData.role).length === 0 && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                No management options available for this role
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Permission
                                        </label>
                                        <Select
                                            id="permission-select"
                                            name="permission"
                                            isMulti
                                            options={getFilteredPermissionOptions()}
                                            value={getSelectedOptionsPermission(formData.permission)}
                                            onChange={handleSelectChangePermission}
                                            placeholder={
                                                formData.management.length === 0
                                                    ? "Please select management first"
                                                    : "Choose permissions..."
                                            }
                                            isSearchable
                                            closeMenuOnSelect={false}
                                            isDisabled={formData.management.length === 0}
                                            styles={{
                                                menu: (base) => ({
                                                    ...base,
                                                    zIndex: 9999
                                                }),
                                                menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999
                                                })
                                            }}
                                            menuPortalTarget={document.body}
                                        />
                                        {formData.management.length === 0 && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Please select at least one management module to see available permissions
                                            </p>
                                        )}
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
                                        {editingUsers ? 'Update Role Action' : 'Add Role Action'}
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

export default RoleActionManagementLayout;