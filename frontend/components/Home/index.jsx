import React, { useState, useEffect } from 'react';
import HomeLayout from "../../layout/index.jsx";
import Login from "./login/index.jsx";
import Dashboard from "../Dashboard/index.jsx"; // Customer dashboard
import AdminDashboard from "../admin/index.jsx";
import EmployeeDashboard from "../employee/index.jsx";
import { useAuth } from "../../src/useAuth";

const HomePage = () => {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState('');

  // Dynamic menu router based on logged in role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        setActiveMenu('admin_dashboard');
      } else if (user.role === 'employee') {
        setActiveMenu('employee_dashboard');
      } else {
        setActiveMenu('customer_dashboard');
      }
    } else {
      setActiveMenu('');
    }
  }, [user]);

  const renderDashboard = () => {
    if (!user) return <Login />;
    
    if (user.role === 'admin') {
      if (activeMenu.startsWith('employee_')) {
        return <EmployeeDashboard activeMenu={activeMenu} />;
      }
      if (activeMenu.startsWith('customer_')) {
        return <Dashboard activeMenu={activeMenu} />;
      }
      return <AdminDashboard activeMenu={activeMenu} />;
    }

    if (user.role === 'employee') {
      if (activeMenu.startsWith('customer_')) {
        return <Dashboard activeMenu={activeMenu} />;
      }
      return <EmployeeDashboard activeMenu={activeMenu} />;
    }

    if (user.role === 'customer') {
      return <Dashboard activeMenu={activeMenu} />;
    }
    
    return <Dashboard activeMenu={activeMenu} />;
  };

  return (
    <HomeLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
      {renderDashboard()}
    </HomeLayout>
  );
};

export default HomePage;