import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  WalletOutlined,
  LogoutOutlined,
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  BankOutlined,
  AuditOutlined,
  FileTextOutlined,
  UsergroupAddOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Avatar, Space, Typography, Tag } from 'antd';
import { useAuth } from '../src/useAuth';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

const HomeLayout = ({ children, activeMenu, setActiveMenu }) => {
  const { user, logout, loading, account } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-blue-800">
        <div className="relative flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
          <Text className="text-white font-semibold text-lg tracking-wider animate-pulse">State Bank of India</Text>
        </div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
    } else {
      setActiveMenu(key);
    }
  };

  // Define sidebar menu items based on role
  const getMenuItems = () => {
    const adminItems = [
      {
        key: 'admin_dashboard',
        icon: <BankOutlined className="text-blue-950" />,
        label: 'Bank Reserves & Analytics',
      },
      {
        key: 'admin_employees',
        icon: <TeamOutlined className="text-blue-100" />,
        label: 'Manage Employees',
      },
      {
        key: 'admin_departments',
        icon: <AppstoreOutlined className="text-blue-100" />,
        label: 'Manage Departments',
      },
      {
        key: 'admin_customers',
        icon: <UsergroupAddOutlined className="text-blue-100" />,
        label: 'Manage Customers',
      },
      {
        key: 'admin_mis',
        icon: <PieChartOutlined className="text-blue-100" />,
        label: 'Management Information System',
      }
    ];

    const employeeItems = [
      {
        key: 'employee_dashboard',
        icon: <WalletOutlined className="text-blue-950" />,
        label: 'Account Control Center',
      },
      {
        key: 'employee_requests',
        icon: <AuditOutlined className="text-blue-100" />,
        label: 'Account Opening Req.',
      },
      {
        key: 'employee_loans',
        icon: <span className="ant-menu-item-icon text-blue-100 font-bold text-base">₹</span>,
        label: 'Loan Applications',
      }
    ];

    const customerItems = [
      {
        key: 'customer_dashboard',
        icon: <WalletOutlined className="text-blue-950" />,
        label: 'My Accounts & Transfer',
      },
      {
        key: 'customer_loans',
        icon: <span className="ant-menu-item-icon text-blue-100 font-bold text-base">₹</span>,
        label: 'Loans & Financing',
      },
      {
        key: 'customer_requests',
        icon: <FileTextOutlined className="text-blue-100" />,
        label: 'Account Request Hub',
      }
    ];

    const logoutItem = {
      key: 'logout',
      icon: <LogoutOutlined className="text-blue-950" />,
      label: 'Logout',
    };

    switch (user.role) {
      case 'admin':
        return [
          { type: 'group', label: 'Admin Tools', children: adminItems },
          { type: 'divider' },
          { type: 'group', label: 'Employee Tools', children: employeeItems },
          { type: 'divider' },
          { type: 'group', label: 'Customer Tools', children: customerItems },
          { type: 'divider' },
          logoutItem
        ];
      case 'employee':
        return [
          { type: 'group', label: 'Employee Tools', children: employeeItems },
          { type: 'divider' },
          { type: 'group', label: 'Customer Tools', children: customerItems },
          { type: 'divider' },
          logoutItem
        ];
      case 'customer':
      default:
        return [...customerItems, logoutItem];
    }
  };

  const getPageName = () => {
    const allItems = getMenuItems();
    const found = allItems.find(item => item.key === activeMenu);
    return found ? found.label : 'Dashboard';
  };

  const getRoleTag = () => {
    switch (user.role) {
      case 'admin':
        return <Tag className="m-0 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-xs border border-white text-blue-950 bg-blue-800">Admin</Tag>;
      case 'employee':
        return <Tag className="m-0 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-xs border border-white text-blue-950 bg-blue-600">Employee</Tag>;
      case 'customer':
      default:
        return <Tag className="m-0 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-xs border border-white text-blue-950 bg-blue-500">Customer</Tag>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>

      {/* Sidebar navigation */}
      <Sider trigger={null} collapsible collapsed={collapsed} style={{ background: '#3b82f6' }} className="shadow-2xl no-scrollbar overflow-y-auto">
        <div className="flex flex-col items-center justify-center py-5 px-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          {/* SBI Logo */}
          <div className="flex items-center justify-center mb-2">
            <img
              src="/sbi-logo.png"
              alt="SBI Logo"
              style={{
                width: collapsed ? '40px' : '56px',
                height: collapsed ? '40px' : '56px',
                objectFit: 'contain',
                borderRadius: '8px',
                background: '#ffffffff',
                padding: '4px',
                transition: 'all 0.3s',
                boxShadow: '0 2px 10px rgba(131, 43, 147, 0.89)',
              }}
            />
          </div>
          {!collapsed && (
            <div className="text-center">
              <div className="text-white font-extrabold text-sm tracking-wide leading-tight">
                State Bank of India
              </div>

            </div>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeMenu]}
          onClick={handleMenuClick}
          className="bg-transparent px-2"
          items={getMenuItems()}
          style={{ background: 'transparent', borderRight: 0 }}
        />
      </Sider>

      {/* Main content layout */}
      <Layout style={{ background: '#f0f4ff' }}>
        <Header style={{ padding: '0 24px', background: '#3b82f6' }} className="flex justify-between items-center shadow-lg">
          <Space size="middle" className="items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-white hover:text-blue-200 h-10 w-10 flex items-center justify-center rounded-lg hover:bg-blue-600/50"
              style={{ fontSize: '16px' }}
            />
            <Text className="text-white font-bold text-base tracking-wide hidden sm:block" style={{ letterSpacing: '0.01em' }}>
              {getPageName()}
            </Text>
          </Space>

          <Space size="middle" className="items-center">
            <div className="hidden sm:flex flex-col text-right">
              <Space className="mb-0.5">
                {getRoleTag()}
                <Text className="font-bold text-white text-sm">{user.username}</Text>
              </Space>
              {user.role === 'customer' && account && (
                <Text className="text-blue-100 text-xs font-mono">Acc: {account.accountNumber}</Text>
              )}
            </div>
            <Avatar
              style={{ backgroundColor: '#ffffff', color: '#1e3a8a' }}
              icon={<UserOutlined />}
              className="shadow-md"
            />
          </Space>
        </Header>

        <Content
          style={{
            margin: '24px 24px',
            padding: 24,
            minHeight: 280,
            background: 'white',
            borderRadius: borderRadiusLG,
          }}
          className="overflow-y-auto no-scrollbar"
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default HomeLayout;