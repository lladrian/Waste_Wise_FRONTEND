import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import AccountRecoveryPage from './pages/AccountRecoveryPage';
import AdminLayout from './layouts/admin_layout';

 
// import RegisterPage from './pages/RegisterPage';
// import RoleSelectionPage from './pages/RoleSelectionPage';
// import AccountRecoveryPage from './pages/AccountRecoveryPage';



import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account_recovery" element={<AccountRecoveryPage />} />
        <Route path="/admin/dashboard" element={<AdminLayout />} />
{/*
        <Route path="/register/:role_selected" element={<RegisterPage />} /> 
        <Route path="/role_selection" element={<RoleSelectionPage />} /> 
        <Route path="/account_recovery" element={<AccountRecoveryPage />} />  */}
      </Routes>
    </Router>
  ); 

}

export default App;
