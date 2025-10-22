import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/ProtectedRoute';

import TestPage from './pages/TestPage';

import MapMarkingPage from './pages/MapMarkingPage';
import TestMapPage from './pages/TestMapPage';
import WasteManagementPage from './pages/WasteManagementPage';
import LoginPage from './pages/LoginPage';
import AccountRecoveryPage from './pages/AccountRecoveryPage';
import AccountDisabledPage from './pages/AccountDisabledPage';
import AccountVerificationPage from './pages/AccountVerificationPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import AccountRequestPage from './pages/AccountRequestPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUserManagementPage from './pages/managements/admin/AdminUserManagementPage';
import AdminResidentManagementPage from './pages/managements/admin/AdminResidentManagementPage';
import AdminRoleActionManagementPage from './pages/managements/admin/AdminRoleActionManagementPage';
import AdminLogManagementPage from './pages/managements/admin/AdminLogManagementPage';
import AdminRouteManagementPage from './pages/managements/admin/AdminRouteManagementPage';
import AdminTruckManagementPage from './pages/managements/admin/AdminTruckManagementPage';
import AdminComplainManagementPage from './pages/managements/admin/AdminComplainManagementPage';
import AdminBarangayManagementPage from './pages/managements/admin/AdminBarangayManagementPage';

import AdminScheduleApprovalPage from './pages/approvals/admin/AdminScheduleApprovalPage';
import AdminUserRequestApprovalPage from './pages/approvals/admin/AdminUserRequestApprovalPage';

import AdminLogPage from './pages/admin/AdminLogPage';
import AdminUpdateProfilePage from './pages/admin/AdminUpdateProfilePage';

import StaffDashboardPage from './pages/staff/StaffDashboardPage';
import StaffLogManagementPage from './pages/managements/staff/StaffLogManagementPage';
import StaffScheduleManagementPage from './pages/managements/staff/StaffScheduleManagementPage';
import StaffRouteManagementPage from './pages/managements/staff/StaffRouteManagementPage';
import StaffTruckManagementPage from './pages/managements/staff/StaffTruckManagementPage';
import StaffComplainManagementPage from './pages/managements/staff/StaffComplainManagementPage';
import StaffBarangayManagementPage from './pages/managements/staff/StaffBarangayManagementPage';

import StaffScheduleApprovalPage from './pages/approvals/staff/StaffScheduleApprovalPage';

import StaffLogPage from './pages/staff/StaffLogPage';
import StaffUpdateProfilePage from './pages/staff/StaffUpdateProfilePage';

import OfficialDashboardPage from './pages/official/OfficialDashboardPage';
import OfficialScheduleManagementPage from './pages/managements/official/OfficialScheduleManagementPage';
import OfficialComplainManagementPage from './pages/managements/official/OfficialComplainManagementPage';



import OfficialLogPage from './pages/official/OfficialLogPage';
import OfficialUpdateProfilePage from './pages/official/OfficialUpdateProfilePage';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<MapMarkingPage />} />
        <Route path="/test" element={<TestMapPage />} />
        <Route path="/marking" element={<MapMarkingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verification/:id" element={<AccountVerificationPage />} />
        <Route path="/disabled/:id" element={<AccountDisabledPage />} />
        <Route path="/account_recovery" element={<AccountRecoveryPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/account_request" element={<AccountRequestPage />} />



     

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
              <AdminDashboardPage />
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

  
        
         <Route
          path="/admin/approval/requests"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUserRequestApprovalPage />
            </ProtectedRoute>
          }
        />

        


        {/* Staff Routes */}
        <Route
          path="/staff/update_profile"
          element={
            <ProtectedRoute allowedRoles={['enro_staff_scheduler', 'enro_staff_head', 'enro_staff_monitoring', 'enro_staff_eswm_section_head']}>
              <StaffUpdateProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/login_history"
          element={
            <ProtectedRoute allowedRoles={['enro_staff_scheduler', 'enro_staff_head', 'enro_staff_monitoring', 'enro_staff_eswm_section_head']}>
              <StaffLogPage />
            </ProtectedRoute>
          }
        />

        {/* StaffDashboardPage */}
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute allowedRoles={['enro_staff_scheduler', 'enro_staff_head', 'enro_staff_monitoring', 'enro_staff_eswm_section_head']}>
              <StaffDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/management/logs"
          element={
            <ProtectedRoute allowedRoles={['enro_staff_scheduler', 'enro_staff_head', 'enro_staff_monitoring', 'enro_staff_eswm_section_head']}>
              <StaffLogManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/management/routes"
          element={
            <ProtectedRoute allowedRoles={['enro_staff_scheduler']}>
              <StaffRouteManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/management/barangays"
          element={
            <ProtectedRoute allowedRoles={['enro_staff_scheduler']}>
              <StaffBarangayManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/management/schedules"
          element={
            <ProtectedRoute allowedRoles={['enro_staff_scheduler', 'enro_staff_monitoring', 'enro_staff_eswm_section_head']}>
              <StaffScheduleManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/management/trucks"
          element={
            <ProtectedRoute allowedRoles={['enro_staff_scheduler']}>
              <StaffTruckManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/management/complains"
          element={
            <ProtectedRoute allowedRoles={['enro_staff_scheduler', 'enro_staff_head', 'enro_staff_monitoring', 'enro_staff_eswm_section_head']}>
              <StaffComplainManagementPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/approval/schedules"
          element={
            <ProtectedRoute allowedRoles={['enro_staff_scheduler', 'enro_staff_head']}>
              <StaffScheduleApprovalPage />
            </ProtectedRoute>
          }
        />





        <Route
          path="/official/dashboard"
          element={
            <ProtectedRoute allowedRoles={['barangay_official']}>
              <OfficialDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/official/management/schedules"
          element={
            <ProtectedRoute allowedRoles={['barangay_official']}>
              <OfficialScheduleManagementPage />
            </ProtectedRoute>
          }
        />

          <Route
          path="/official/management/complains"
          element={
            <ProtectedRoute allowedRoles={['barangay_official']}>
              <OfficialComplainManagementPage />
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
      </Routes>
    </Router>
  );

}

export default App;
