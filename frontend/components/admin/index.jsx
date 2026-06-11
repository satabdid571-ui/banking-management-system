import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, InputNumber, Select, Space, Tooltip, message, Row, Col, Statistic, Typography, Tag, Divider, Popconfirm } from 'antd';
import { 
  BankOutlined, 
  TeamOutlined, 
  AppstoreOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { bankStore, subscribeToStore } from '../../src/store';
import api from '../../src/api';
import CustomerManagement from '../customers/index.jsx';
import MISDashboard from './mis.jsx';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminDashboard = ({ activeMenu }) => {
  const [reserve, setReserve] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Modal States
  const [empModalVisible, setEmpModalVisible] = useState(false);
  const [depModalVisible, setDepModalVisible] = useState(false);
  const [reserveModalVisible, setReserveModalVisible] = useState(false);
  const [createAccountVisible, setCreateAccountVisible] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [editingDep, setEditingDep] = useState(null);

  // Form States
  const [empForm] = Form.useForm();
  const [depForm] = Form.useForm();
  const [reserveForm] = Form.useForm();
  const [createAccountForm] = Form.useForm();

  // Load Store Data
  const loadStoreData = async () => {
    try {
      setReserve(await bankStore.getBankReserve());
      setAccounts(await bankStore.getAccounts());
    } catch (err) {
      console.error(err);
    }
    
    // Fetch employees from database
    try {
      const resEmp = await api.get('/admin/employees');
      setEmployees(resEmp.data);
    } catch (err) {
      console.error("Failed to load employees from DB:", err);
    }
    
    // Fetch departments from database
    try {
      const res = await api.get('/admin/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to load departments from DB:", err);
    }
  };

  useEffect(() => {
    loadStoreData();
    const unsubscribe = subscribeToStore(loadStoreData);
    return () => unsubscribe();
  }, []);

  // Total customer balances
  const totalCustomerBalances = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // Reserve Actions
  const handleUpdateReserve = async (values) => {
    try {
      await bankStore.updateBankReserve(values.amount);
      message.success('Bank reserves updated successfully!');
      setReserveModalVisible(false);
      reserveForm.resetFields();
      await loadStoreData();
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Failed to update reserve');
    }
  };

  const handleCreateCustomer = async (values) => {
    try {
      const res = await api.post('/employee/accounts', {
        username: values.fullName,
        email: values.emailOrPhone,
        password: values.emailOrPhone,
        initialDeposit: values.initialDeposit,
        accountType: values.accountType
      });
      message.success(`Account ${res.data.account.accountNumber} created successfully for ${values.fullName}!`);
      setCreateAccountVisible(false);
      createAccountForm.resetFields();
      loadStoreData();
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Failed to create customer');
    }
  };

  // Employee Actions
  const handleSaveEmployee = async (values) => {
    try {
      if (editingEmp) {
        await api.put(`/admin/employees/${editingEmp.id}`, values);
        message.success('Employee updated successfully in database!');
      } else {
        await api.post('/admin/employees', values);
        message.success('Employee added successfully in database!');
      }
      setEmpModalVisible(false);
      setEditingEmp(null);
      empForm.resetFields();
      loadStoreData();
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Failed to save employee');
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await api.delete(`/admin/employees/${id}`);
      message.success('Employee deleted successfully from database!');
      loadStoreData();
    } catch (err) {
      message.error('Failed to delete employee');
    }
  };

  // Department Actions
  const handleAddDepartment = async (values) => {
    try {
      if (editingDep) {
        await api.put(`/admin/departments/${editingDep.id}`, { name: values.name });
        message.success('Department updated successfully in database!');
      } else {
        await api.post('/admin/departments', { name: values.name });
        message.success('Department created successfully in database!');
      }
      setDepModalVisible(false);
      setEditingDep(null);
      depForm.resetFields();
      loadStoreData(); // Refresh list
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Failed to save department');
    }
  };

  const handleDeleteDepartment = async (id) => {
    try {
      await api.delete(`/admin/departments/${id}`);
      message.success('Department deleted successfully from database!');
      loadStoreData(); // Refresh list
    } catch (err) {
      message.error('Failed to delete department');
    }
  };

  // Columns for Employee Table
  const employeeColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text className="text-blue-950 font-semibold">{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <Text className="text-blue-600 text-xs">{text}</Text>,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Position / Role',
      dataIndex: 'role',
      key: 'role',
      render: (text) => <Tag color="geekblue">{text}</Tag>,
    },
    {
      title: 'Salary (Monthly)',
      dataIndex: 'salary',
      key: 'salary',
      render: (val) => <Text className="text-blue-700 font-semibold">₹{val.toLocaleString()}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'success' : 'warning'}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined className="text-blue-700" />} 
            onClick={() => {
              setEditingEmp(record);
              empForm.setFieldsValue(record);
              setEmpModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete Employee"
            description="Are you sure you want to remove this employee?"
            onConfirm={() => handleDeleteEmployee(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Columns for Department Table
  const departmentColumns = [
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text className="text-blue-950 font-semibold">{text}</Text>,
    },
    {
      title: 'ID Code',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text code className="text-xs text-blue-600">{text}</Text>,
    },
    {
      title: 'Employee Count',
      key: 'empCount',
      render: (_, record) => {
        const count = employees.filter(emp => emp.department === record.name).length;
        return <Tag color="blue" className="font-semibold">{count} Personnel</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined className="text-blue-700" />} 
            onClick={() => {
              setEditingDep(record);
              depForm.setFieldsValue({ name: record.name });
              setDepModalVisible(true);
            }}
          />
          <Popconfirm
            title="Delete Department"
            description="Remove this department? This won't delete the employees inside it."
            onConfirm={() => handleDeleteDepartment(record.id)}
            okText="Remove"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Dynamic View Routing by menu selection
  if (activeMenu === 'admin_mis') {
    return <MISDashboard />;
  }

  if (activeMenu === 'admin_customers') {
    return <CustomerManagement />;
  }

  if (activeMenu === 'admin_employees') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-blue-50 border border-blue-200 p-6 rounded-2xl">
          <div>
            <Title level={3} style={{ margin: 0, color: '#1e3a8a' }}>Employee Registry</Title>
            <Text className="text-blue-600 text-xs">Manage active vault handlers, bank tellers, and managers.</Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingEmp(null);
              empForm.resetFields();
              setEmpModalVisible(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white border-0 h-10 rounded-xl"
          >
            Add New Employee
          </Button>
        </div>

        <Card className="bg-white border-blue-100 rounded-3xl overflow-hidden">
          <Table 
            dataSource={employees} 
            columns={employeeColumns} 
            rowKey="id"
            pagination={{ pageSize: 6 }}
            className="custom-table"
          />
        </Card>

        {/* Add/Edit Employee Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2 pb-2 border-b border-blue-100 text-blue-950">
              <TeamOutlined className="text-blue-700" />
              <span className="font-bold text-lg">{editingEmp ? 'Edit Employee Details' : 'Register New Employee'}</span>
            </div>
          }
          open={empModalVisible}
          onCancel={() => {
            setEmpModalVisible(false);
            setEditingEmp(null);
            empForm.resetFields();
          }}
          footer={null}
          destroyOnClose
        >
          <Form
            form={empForm}
            layout="vertical"
            onFinish={handleSaveEmployee}
            requiredMark={false}
            className="pt-4"
          >
            <Form.Item
              name="name"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Employee Name</span>}
              rules={[{ required: true, message: 'Please input employee name!' }]}
            >
              <Input placeholder="Enter employee full name" className="rounded-lg" />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Email Address</span>}
              rules={[
                { required: true, message: 'Please input email!' },
                { type: 'email', message: 'Enter a valid email address!' }
              ]}
            >
              <Input placeholder="e.g. employee@sbi.co.in" className="rounded-lg" />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Login Password</span>}
              rules={[
                { required: !editingEmp, message: 'Please input a password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password placeholder={editingEmp ? "Leave blank to keep existing password" : "Set employee login password"} className="rounded-lg" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="department"
                  label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Department</span>}
                  rules={[{ required: true, message: 'Select department!' }]}
                >
                  <Select placeholder="Select" className="rounded-lg">
                    {departments.map(d => (
                      <Option key={d.id} value={d.name}>{d.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="role"
                  label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Position Role</span>}
                  rules={[{ required: true, message: 'Select role!' }]}
                >
                  <Select placeholder="Select" className="rounded-lg">
                    <Option value="Branch Manager">Branch Manager</Option>
                    <Option value="Probationary Officer (PO) / Deputy Manager">Probationary Officer (PO) / Deputy Manager</Option>
                    <Option value="Cashier">Cashier</Option>
                    <Option value="Accountant">Accountant</Option>
                    <Option value="Sales & Service Officer">Sales & Service Officer</Option>
                    <Option value="Loans & Service Officer">Loans & Service Officer</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="salary"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Monthly Salary (₹)</span>}
              rules={[{ required: true, message: 'Please input salary!' }]}
            >
              <InputNumber className="w-full rounded-lg" min={1000} placeholder="5000" />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-4 border-t border-blue-100">
              <Button onClick={() => setEmpModalVisible(false)} className="rounded-lg">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-lg">
                {editingEmp ? 'Save Changes' : 'Register Employee'}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    );
  }

  if (activeMenu === 'admin_departments') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-blue-50 border border-blue-200 p-6 rounded-2xl">
          <div>
            <Title level={3} style={{ margin: 0, color: '#1e3a8a' }}>Departments</Title>
            <Text className="text-blue-600 text-xs">Define operational divisions and resource structures.</Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingDep(null);
              depForm.resetFields();
              setDepModalVisible(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white border-0 h-10 rounded-xl"
          >
            Create Department
          </Button>
        </div>

        <Card className="bg-white border-blue-100 rounded-3xl overflow-hidden">
          <Table 
            dataSource={departments} 
            columns={departmentColumns} 
            rowKey="id"
            pagination={{ pageSize: 6 }}
          />
        </Card>

        {/* Add Department Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2 pb-2 border-b border-blue-100 text-blue-950">
              <AppstoreOutlined className="text-blue-700" />
              <span className="font-bold text-lg">{editingDep ? 'Edit Department' : 'Create Department'}</span>
            </div>
          }
          open={depModalVisible}
          onCancel={() => {
            setDepModalVisible(false);
            depForm.resetFields();
          }}
          footer={null}
          destroyOnClose
        >
          <Form
            form={depForm}
            layout="vertical"
            onFinish={handleAddDepartment}
            requiredMark={false}
            className="pt-4"
          >
            <Form.Item
              name="name"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Department Name</span>}
              rules={[{ required: true, message: 'Please enter department name!' }]}
            >
              <Input placeholder="Enter unique department name" className="rounded-lg" />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-4 border-t border-blue-100">
              <Button onClick={() => setDepModalVisible(false)} className="rounded-lg">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-lg">
                {editingDep ? 'Save Changes' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    );
  }

  // Fallback: Dashboard & Reserves View
  return (
    <div className="space-y-6">
      
      {/* Header reserve banner */}
      <div className="bg-linear-to-r from-blue-100 via-blue-50 to-white p-8 rounded-3xl border border-blue-200 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between text-blue-950 gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="z-10">
          <span className="text-blue-700 text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 mb-1">
            <SafetyCertificateOutlined className="animate-pulse" /> Reserve Security Active
          </span>
          <Title level={2} style={{ margin: 0, color: '#1e3a8a' }} className="font-black">
            Vault Reserves Control
          </Title>
          <Text className="text-blue-800">Maintain corporate vault liquidity and verify operations.</Text>
        </div>
        <div className="flex items-center gap-4 bg-blue-50/40 border border-blue-200/30 px-6 py-4 rounded-2xl backdrop-blur-sm self-start md:self-auto min-w-70 justify-between">
          <div>
            <span className="text-blue-600 text-xs block uppercase tracking-wider font-semibold">Reserve Fund</span>
            <span className="text-3xl font-black font-mono tracking-tight text-blue-950">₹{reserve.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => {
              reserveForm.setFieldsValue({ amount: reserve });
              setReserveModalVisible(true);
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-lg flex items-center justify-center h-10 w-10 p-0"
          />
        </div>
        
        <div className="flex gap-3 z-10 self-start md:self-auto">
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={() => setCreateAccountVisible(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white border-0 h-11 rounded-xl text-sm font-semibold px-5"
          >
            Create Customer Account
          </Button>
        </div>
      </div>

      {/* Corporate Overview stats */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-white border-blue-100 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
            <Statistic 
              title={<span className="text-blue-600 text-xs uppercase tracking-wider">Vault Liquidity</span>}
              value={reserve}
              precision={2}
              valueStyle={{ color: '#1e3a8a', fontFamily: 'monospace', fontWeight: 'bold' }}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-white border-blue-100 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
            <Statistic 
              title={<span className="text-blue-600 text-xs uppercase tracking-wider">Total Customer Deposits</span>}
              value={totalCustomerBalances}
              precision={2}
              valueStyle={{ color: '#1e3a8a', fontFamily: 'monospace', fontWeight: 'bold' }}
              prefix={<span className="font-bold text-lg mr-1 text-blue-700">₹</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-white border-blue-100 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
            <Statistic 
              title={<span className="text-blue-600 text-xs uppercase tracking-wider">Active Staff</span>}
              value={employees.length}
              valueStyle={{ color: '#1e3a8a', fontWeight: 'bold' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-white border-blue-100 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
            <Statistic 
              title={<span className="text-blue-600 text-xs uppercase tracking-wider">Divisions</span>}
              value={departments.length}
              valueStyle={{ color: '#1e3a8a', fontWeight: 'bold' }}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Liquidity Ledger Info Card */}
      <Card 
        className="bg-white border-blue-100 rounded-3xl p-2"
        title={
          <div className="flex items-center gap-2">
            <DashboardOutlined className="text-blue-700 text-lg" />
            <div>
              <span className="text-blue-950 font-bold text-base block">Reserves Ledger Audit</span>
              <span className="text-xs text-blue-600 font-normal">Real-time bank reserve compliance matching customer liabilities</span>
            </div>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="flex justify-between items-center border-b border-blue-100 pb-3">
            <span className="text-blue-800 text-sm">Vault Reserve Capital</span>
            <span className="text-blue-950 font-mono font-semibold">₹{reserve.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center border-b border-blue-100 pb-3">
            <span className="text-blue-800 text-sm">Total Deposit Liability</span>
            <span className="text-blue-950 font-mono font-semibold">₹{totalCustomerBalances.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center border-b border-blue-100 pb-3">
            <span className="text-blue-800 text-sm">Net Liquidity Leverage Ratio</span>
            <Tag color={reserve >= totalCustomerBalances ? 'success' : 'warning'} className="m-0 font-bold font-mono">
              {(totalCustomerBalances === 0 ? reserve : (reserve / totalCustomerBalances) * 100).toFixed(1)}% Liquidity
            </Tag>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-blue-800 text-sm">Corporate Capital Status</span>
            <Tag color="blue" className="m-0 font-extrabold px-3 rounded-full">SOLVENT & ACTIVE</Tag>
          </div>
        </div>
      </Card>

      {/* Adjust Reserve Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-blue-100 text-blue-950">
            <SafetyCertificateOutlined className="text-blue-700" />
            <span className="font-bold text-lg">Update Vault Reserves</span>
          </div>
        }
        open={reserveModalVisible}
        onCancel={() => {
          setReserveModalVisible(false);
          reserveForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={reserveForm}
          layout="vertical"
          onFinish={handleUpdateReserve}
          requiredMark={false}
          className="pt-4"
        >
          <Form.Item
            name="amount"
            label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Total Reserve Amount (₹)</span>}
            rules={[
              { required: true, message: 'Please input reserve amount!' },
              { type: 'number', min: 0, message: 'Must be positive!' }
            ]}
          >
            <InputNumber 
              className="w-full rounded-lg" 
              size="large"
              placeholder="0.00" 
              formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4 border-t border-blue-100">
            <Button onClick={() => setReserveModalVisible(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-lg">
              Secure Update
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Create Customer Account Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-blue-100 text-blue-950">
            <UserOutlined className="text-blue-700" />
            <span className="font-bold text-lg">Create Customer Account</span>
          </div>
        }
        open={createAccountVisible}
        onCancel={() => {
          setCreateAccountVisible(false);
          createAccountForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={createAccountForm}
          layout="vertical"
          onFinish={handleCreateCustomer}
          requiredMark={false}
          className="pt-4"
        >
          <Form.Item
            name="fullName"
            label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Customer Full Name</span>}
            rules={[{ required: true, message: 'Please input full name!' }, { min: 3, message: 'Must be at least 3 characters!' }]}
          >
            <Input placeholder="Enter customer's full name" className="rounded-lg" />
          </Form.Item>

          <Form.Item
            name="emailOrPhone"
            label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Email or Phone Number</span>}
            rules={[{ required: true, message: 'Please input email or phone number!' }, { min: 3, message: 'Must be at least 3 characters!' }]}
          >
            <Input placeholder="Enter email or phone number" className="rounded-lg" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="accountType"
                label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Account Type</span>}
                rules={[{ required: true }]}
                initialValue="Savings"
              >
                <Select className="rounded-lg">
                  <Option value="Savings">Savings</Option>
                  <Option value="Checking">Checking</Option>
                  <Option value="Business">Business</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="initialDeposit"
                label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Initial Deposit (₹)</span>}
                rules={[{ required: true, message: 'Enter starting deposit!' }]}
                initialValue={100}
              >
                <InputNumber className="w-full rounded-lg" min={0} />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-2 pt-4 border-t border-blue-100">
            <Button onClick={() => setCreateAccountVisible(false)} className="rounded-lg">Cancel</Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-lg">Open Account</Button>
          </div>
        </Form>
      </Modal>

    </div>
  );
};

export default AdminDashboard;
