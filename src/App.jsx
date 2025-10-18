import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/ProtectedRoute';


import LoginPage from './pages/LoginPage';
import AccountRecoveryPage from './pages/AccountRecoveryPage';
import AccountDisabledPage from './pages/AccountDisabledPage';
import AccountVerificationPage from './pages/AccountVerificationPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

import AdminUserManagementPage from './pages/managements/admin/AdminUserManagementPage';
import AdminResidentManagementPage from './pages/managements/admin/AdminResidentManagementPage';
import AdminRoleActionManagementPage from './pages/managements/admin/AdminRoleActionManagementPage';
import AdminLogManagementPage from './pages/managements/admin/AdminLogManagementPage';
import AdminRouteManagementPage from './pages/managements/admin/AdminRouteManagementPage';
import AdminTruckManagementPage from './pages/managements/admin/AdminTruckManagementPage';
import AdminComplainManagementPage from './pages/managements/admin/AdminComplainManagementPage';
import AdminBarangayManagementPage from './pages/managements/admin/AdminBarangayManagementPage';





import StaffLogManagementPage from './pages/managements/staff/StaffLogManagementPage';
import StaffScheduleManagementPage from './pages/managements/staff/StaffScheduleManagementPage';
import StaffRouteManagementPage from './pages/managements/staff/StaffRouteManagementPage';
import StaffTruckManagementPage from './pages/managements/staff/StaffTruckManagementPage';
import StaffComplainManagementPage from './pages/managements/staff/StaffComplainManagementPage';
import StaffBarangayManagementPage from './pages/managements/staff/StaffBarangayManagementPage';


import AdminScheduleApprovalPage from './pages/approvals/admin/AdminScheduleApprovalPage';

import StaffScheduleApprovalPage from './pages/approvals/staff/StaffScheduleApprovalPage';




import AdminLayout from './layouts/admin_layout';
import StaffLayout from './layouts/staff_layout';
import OfficialLayout from './layouts/official_layout';


import OfficialLogPage from './pages/official/OfficialLogPage';
import OfficialUpdateProfilePage from './pages/official/OfficialUpdateProfilePage';


import StaffLogPage from './pages/staff/StaffLogPage';
import StaffUpdateProfilePage from './pages/staff/StaffUpdateProfilePage';

import AdminLogPage from './pages/admin/AdminLogPage';
import AdminUpdateProfilePage from './pages/admin/AdminUpdateProfilePage';


function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verification/:id" element={<AccountVerificationPage />} />
        <Route path="/disabled/:id" element={<AccountDisabledPage />} />
        <Route path="/account_recovery" element={<AccountRecoveryPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />


     

        {/* Admin Routes */}
        <Route
          path="/admin/update_profile"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUpdateProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/login_history"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLogPage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/management/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/management/residents"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminResidentManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/management/role_actions"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRoleActionManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/management/logs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLogManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/management/routes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRouteManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/management/barangays"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminBarangayManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/management/trucks"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminTruckManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/management/complains"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminComplainManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/approval/schedules"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminScheduleApprovalPage />
            </ProtectedRoute>
          }
        />





        {/* Staff Routes */}
        <Route
          path="/staff/update_profile"
          element={
            <ProtectedRoute allowedRoles={['enro_staff', 'enro_staff_head']}>
              <StaffUpdateProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/login_history"
          element={
            <ProtectedRoute allowedRoles={['enro_staff', 'enro_staff_head']}>
              <StaffLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={['enro_staff', 'enro_staff_head']}>
              <StaffLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/management/logs"
          element={
            <ProtectedRoute allowedRoles={['enro_staff', 'enro_staff_head']}>
              <StaffLogManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/management/routes"
          element={
            <ProtectedRoute allowedRoles={['enro_staff']}>
              <StaffRouteManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/management/barangays"
          element={
            <ProtectedRoute allowedRoles={['enro_staff']}>
              <StaffBarangayManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/management/schedules"
          element={
            <ProtectedRoute allowedRoles={['enro_staff']}>
              <StaffScheduleManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/management/trucks"
          element={
            <ProtectedRoute allowedRoles={['enro_staff']}>
              <StaffTruckManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/management/complains"
          element={
            <ProtectedRoute allowedRoles={['enro_staff', 'enro_staff_head']}>
              <StaffComplainManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/approval/schedules"
          element={
            <ProtectedRoute allowedRoles={['enro_staff']}>
              <StaffScheduleApprovalPage />
            </ProtectedRoute>
          }
        />





       <Route
          path="/official/update_profile"
          element={
            <ProtectedRoute allowedRoles={['barangay_official']}>
              <OfficialUpdateProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/official/login_history"
          element={
            <ProtectedRoute allowedRoles={['barangay_official']}>
              <OfficialLogPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/official/dashboard"
          element={
            <ProtectedRoute allowedRoles={['barangay_official']}>
              <OfficialLayout />
            </ProtectedRoute>
          }
        />







      </Routes>
    </Router>
  );

}

export default App;
