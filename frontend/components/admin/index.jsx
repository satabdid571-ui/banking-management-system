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
  const [editingEmp, setEditingEmp] = useState(null);

  // Form States
  const [empForm] = Form.useForm();
  const [depForm] = Form.useForm();
  const [reserveForm] = Form.useForm();

  // Load Store Data
  const loadStoreData = () => {
    setReserve(bankStore.getBankReserve());
    setEmployees(bankStore.getEmployees());
    setDepartments(bankStore.getDepartments());
    setAccounts(bankStore.getAccounts());
  };

  useEffect(() => {
    loadStoreData();
    const unsubscribe = subscribeToStore(loadStoreData);
    return () => unsubscribe();
  }, []);

  // Total customer balances
  const totalCustomerBalances = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  // Reserve Actions
  const handleUpdateReserve = (values) => {
    try {
      bankStore.updateBankReserve(values.amount);
      message.success('Bank reserves updated successfully!');
      setReserveModalVisible(false);
      reserveForm.resetFields();
    } catch (err) {
      message.error(err.message || 'Failed to update reserve');
    }
  };

  // Employee Actions
  const handleSaveEmployee = (values) => {
    try {
      if (editingEmp) {
        bankStore.updateEmployee(editingEmp.id, values);
        message.success('Employee updated successfully!');
      } else {
        bankStore.addEmployee(values);
        message.success('Employee added successfully!');
      }
      setEmpModalVisible(false);
      setEditingEmp(null);
      empForm.resetFields();
    } catch (err) {
      message.error(err.message || 'Failed to save employee');
    }
  };

  const handleDeleteEmployee = (id) => {
    try {
      bankStore.deleteEmployee(id);
      message.success('Employee deleted successfully!');
    } catch (err) {
      message.error('Failed to delete employee');
    }
  };

  // Department Actions
  const handleAddDepartment = (values) => {
    try {
      bankStore.addDepartment(values.name);
      message.success('Department created successfully!');
      setDepModalVisible(false);
      depForm.resetFields();
    } catch (err) {
      message.error(err.message || 'Failed to create department');
    }
  };

  const handleDeleteDepartment = (id) => {
    try {
      bankStore.deleteDepartment(id);
      message.success('Department deleted successfully!');
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
      render: (text) => <Text className="text-slate-200 font-semibold">{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <Text className="text-slate-400 text-xs">{text}</Text>,
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
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: 'Salary (Monthly)',
      dataIndex: 'salary',
      key: 'salary',
      render: (val) => <Text className="text-emerald-400 font-semibold">₹{val.toLocaleString()}</Text>,
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
            icon={<EditOutlined className="text-indigo-400" />} 
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
      render: (text) => <Text className="text-slate-200 font-semibold">{text}</Text>,
    },
    {
      title: 'ID Code',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text code className="text-xs text-indigo-300">{text}</Text>,
    },
    {
      title: 'Employee Count',
      key: 'empCount',
      render: (_, record) => {
        const count = employees.filter(emp => emp.department === record.name).length;
        return <Tag color="cyan" className="font-semibold">{count} Personnel</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
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
        <div className="flex justify-between items-center bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
          <div>
            <Title level={3} style={{ margin: 0, color: 'white' }}>Employee Registry</Title>
            <Text className="text-slate-400 text-xs">Manage active vault handlers, bank tellers, and managers.</Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingEmp(null);
              empForm.resetFields();
              setEmpModalVisible(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 border-0 h-10 rounded-xl"
          >
            Add New Employee
          </Button>
        </div>

        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden">
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
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
              <TeamOutlined className="text-indigo-400" />
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
              label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Employee Name</span>}
              rules={[{ required: true, message: 'Please input employee name!' }]}
            >
              <Input placeholder="Enter employee full name" className="rounded-lg" />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Email Address</span>}
              rules={[
                { required: true, message: 'Please input email!' },
                { type: 'email', message: 'Enter a valid email address!' }
              ]}
            >
              <Input placeholder="e.g. employee@apex.com" className="rounded-lg" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="department"
                  label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Department</span>}
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
                  label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Position Role</span>}
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
              label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Monthly Salary (₹)</span>}
              rules={[{ required: true, message: 'Please input salary!' }]}
            >
              <InputNumber className="w-full rounded-lg" min={1000} placeholder="5000" />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <Button onClick={() => setEmpModalVisible(false)} className="rounded-lg">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" className="bg-indigo-600 hover:bg-indigo-500 border-0 rounded-lg">
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
        <div className="flex justify-between items-center bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
          <div>
            <Title level={3} style={{ margin: 0, color: 'white' }}>Departments</Title>
            <Text className="text-slate-400 text-xs">Define operational divisions and resource structures.</Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setDepModalVisible(true)}
            className="bg-emerald-600 hover:bg-emerald-500 border-0 h-10 rounded-xl"
          >
            Create Department
          </Button>
        </div>

        <Card className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden">
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
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
              <AppstoreOutlined className="text-indigo-400" />
              <span className="font-bold text-lg">Create Department</span>
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
              label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Department Name</span>}
              rules={[{ required: true, message: 'Please enter department name!' }]}
            >
              <Input placeholder="Enter unique department name" className="rounded-lg" />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <Button onClick={() => setDepModalVisible(false)} className="rounded-lg">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" className="bg-indigo-600 hover:bg-indigo-500 border-0 rounded-lg">
                Create
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
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-8 rounded-3xl border border-emerald-900/40 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between text-white gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="z-10">
          <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 mb-1">
            <SafetyCertificateOutlined className="animate-pulse" /> Reserve Security Active
          </span>
          <Title level={2} style={{ margin: 0, color: 'white' }} className="font-black">
            Vault Reserves Control
          </Title>
          <Text className="text-slate-300">Maintain corporate vault liquidity and verify operations.</Text>
        </div>
        <div className="flex items-center gap-4 bg-emerald-950/40 border border-emerald-700/30 px-6 py-4 rounded-2xl backdrop-blur-sm self-start md:self-auto min-w-[280px] justify-between">
          <div>
            <span className="text-emerald-300 text-xs block uppercase tracking-wider font-semibold">Reserve Fund</span>
            <span className="text-3xl font-black font-mono tracking-tight text-white">₹{reserve.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => {
              reserveForm.setFieldsValue({ amount: reserve });
              setReserveModalVisible(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 border-0 rounded-lg flex items-center justify-center h-10 w-10 p-0"
          />
        </div>
      </div>

      {/* Corporate Overview stats */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900 border-slate-800 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
            <Statistic 
              title={<span className="text-slate-400 text-xs uppercase tracking-wider">Vault Liquidity</span>}
              value={reserve}
              precision={2}
              valueStyle={{ color: '#10b981', fontFamily: 'monospace', fontWeight: 'bold' }}
              prefix={<BankOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900 border-slate-800 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
            <Statistic 
              title={<span className="text-slate-400 text-xs uppercase tracking-wider">Total Customer Deposits</span>}
              value={totalCustomerBalances}
              precision={2}
              valueStyle={{ color: '#818cf8', fontFamily: 'monospace', fontWeight: 'bold' }}
              prefix={<span className="font-bold text-lg mr-1 text-indigo-400">₹</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900 border-slate-800 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
            <Statistic 
              title={<span className="text-slate-400 text-xs uppercase tracking-wider">Active Staff</span>}
              value={employees.length}
              valueStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="bg-slate-900 border-slate-800 rounded-2xl hover:scale-[1.02] transition-transform duration-300">
            <Statistic 
              title={<span className="text-slate-400 text-xs uppercase tracking-wider">Divisions</span>}
              value={departments.length}
              valueStyle={{ color: '#c084fc', fontWeight: 'bold' }}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Liquidity Ledger Info Card */}
      <Card 
        className="bg-slate-900 border-slate-800 rounded-3xl p-2"
        title={
          <div className="flex items-center gap-2">
            <DashboardOutlined className="text-emerald-500 text-lg" />
            <div>
              <span className="text-slate-200 font-bold text-base block">Reserves Ledger Audit</span>
              <span className="text-xs text-slate-400 font-normal">Real-time bank reserve compliance matching customer liabilities</span>
            </div>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-slate-300 text-sm">Vault Reserve Capital</span>
            <span className="text-slate-200 font-mono font-semibold">₹{reserve.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-slate-300 text-sm">Total Deposit Liability</span>
            <span className="text-slate-200 font-mono font-semibold">₹{totalCustomerBalances.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-slate-300 text-sm">Net Liquidity Leverage Ratio</span>
            <Tag color={reserve >= totalCustomerBalances ? 'success' : 'warning'} className="m-0 font-bold font-mono">
              {(totalCustomerBalances === 0 ? reserve : (reserve / totalCustomerBalances) * 100).toFixed(1)}% Liquidity
            </Tag>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300 text-sm">Corporate Capital Status</span>
            <Tag color="success" className="m-0 font-extrabold px-3 rounded-full">SOLVENT & ACTIVE</Tag>
          </div>
        </div>
      </Card>

      {/* Adjust Reserve Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
            <span className="font-bold text-xl text-emerald-400 px-1">₹</span>
            <span className="font-bold text-lg">Edit Vault Reserves</span>
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
            label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Total Reserve Fund (₹)</span>}
            rules={[{ required: true, message: 'Please enter reserve amount!' }]}
          >
            <InputNumber 
              className="w-full rounded-lg" 
              size="large"
              placeholder="0.00" 
              formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button onClick={() => setReserveModalVisible(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-emerald-600 hover:bg-emerald-500 border-0 rounded-lg">
              Update Vault
            </Button>
          </div>
        </Form>
      </Modal>

    </div>
  );
};

export default AdminDashboard;
