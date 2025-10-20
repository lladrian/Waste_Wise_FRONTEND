// pages/StaffDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
    FiUsers,
    FiTruck,
    FiMap,
    FiCalendar,
    FiAlertCircle,
    FiTrendingUp,
    FiCheckCircle,
    FiClock,
    FiBarChart2,
    FiRefreshCw,
    FiEye,
    FiFileText,
    FiMessageSquare
} from 'react-icons/fi';


import { getAllDataDashboard } from "../../hooks/dashboard_hook";

import { AuthContext } from '../../context/AuthContext';

const DashboardLayout = () => {
    const { user } = useContext(AuthContext);
    const [schedules, setSchedules] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [users, setUser] = useState([]);
    const [complains, setComplains] = useState([]);
    const [loading, setLoading] = useState(true);

        const fetchData = async () => {
            setLoading(true);

            try {
                const { data, success } = await getAllDataDashboard(user.barangay);
                if (success === true) {
                    setSchedules(data.schedules2.data)
                    setRoutes(data.routes.data)
                    setUser(data.users.data)
                    setComplains(data.complains.data)
                    setTrucks(data.trucks.data)
                    setBarangays(data.barangays.data)
                }
            } catch (err) {
                console.error("Error fetching reg data:", err);
                toast.error("Failed to load registration data");
            } finally {
                setLoading(false);
            }
        };

    // Mock data - replace with actual API calls
    useEffect(() => {
        fetchData();
    }, []);

    const StatCard = ({ icon: Icon, title, value, change, color, link }) => (
        <Link to={link} className="block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 hover:border-blue-200 cursor-pointer">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                        <p className="text-2xl font-bold text-gray-900">{loading ? '...' : value}</p>
                        {change && (
                            <p className={`text-xs mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {change > 0 ? '+' : ''}{change}% from last week
                            </p>
                        )}
                    </div>
                    <div className={`p-3 rounded-lg ${color}`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
        </Link>
    );


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <StatCard
                    icon={FiUsers}
                    title="Total Resident Users"
                    value={users.filter(user => user.role === "resident" && user.barangay._id === "68f30ca559da83fb2adf7d19").length}
                    // change={2}
                    color="bg-indigo-500"
                    // link="/staff/management/barangays"
                />
                {console.log(complains)}
                <StatCard
                    icon={FiAlertCircle}
                    title="Total Complaints"
                    value={complains.filter(complain => complain.barangay._id === "68f30ca559da83fb2adf7d19").length}
                    // value={complains.length}
                    // change={1}
                    color="bg-red-500"
                    // link="/staff/management/complains"
                />
                  <StatCard
                    icon={FiAlertCircle}
                    title="Total Schedules"
                    value={schedules.length}
                    // change={1}
                    color="bg-red-500"
                    // link="/staff/management/complains"
                />

                
            </div>
        </div>
    );
};

export default DashboardLayout;