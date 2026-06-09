import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Form, Input, InputNumber, Select, Space, Tooltip, message, Row, Col, Statistic, Typography, Tag, Divider, Popconfirm } from 'antd';
import {
  UserAddOutlined,
  UserDeleteOutlined,
  AuditOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  SwapOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { bankStore, subscribeToStore } from '../../src/store';

const { Title, Text } = Typography;
const { Option } = Select;

const EmployeeDashboard = ({ activeMenu }) => {
  const [accounts, setAccounts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loans, setLoans] = useState([]);

  // Modals
  const [createAccountVisible, setCreateAccountVisible] = useState(false);
  const [adjustmentVisible, setAdjustmentVisible] = useState(false);

  // Forms
  const [createForm] = Form.useForm();
  const [adjustForm] = Form.useForm();

  // Load Store Data
  const loadStoreData = () => {
    setAccounts(bankStore.getAccounts());
    setRequests(bankStore.getAccountRequests());
    setLoans(bankStore.getLoans());
  };

  useEffect(() => {
    loadStoreData();
    const unsubscribe = subscribeToStore(loadStoreData);
    return () => unsubscribe();
  }, []);

  // Employee actions
  const handleCreateCustomer = (values) => {
    try {
      bankStore.createCustomerAccount(values.fullName, values.emailOrPhone, values.emailOrPhone, values.initialDeposit, values.accountType);
      message.success(`Account created successfully for ${values.fullName}!`);
      setCreateAccountVisible(false);
      createForm.resetFields();
    } catch (err) {
      message.error(err.message || 'Failed to create customer');
    }
  };

  const handleDeleteCustomer = (accountNumber) => {
    try {
      bankStore.deleteAccount(accountNumber);
      message.success(`Account ${accountNumber} has been closed.`);
    } catch (err) {
      message.error(err.message || 'Failed to close account');
    }
  };

  const handleAdjustBalance = (values) => {
    try {
      bankStore.adjustBalance(values.accountNumber, values.amount, values.type, values.description);
      message.success(`Account adjusted successfully! Balance has been ${values.type}ed.`);
      setAdjustmentVisible(false);
      adjustForm.resetFields();
    } catch (err) {
      message.error(err.message || 'Failed to adjust account balance');
    }
  };

  const handleApproveRequest = (id) => {
    try {
      bankStore.updateAccountRequestStatus(id, 'Approved');
      message.success('Account opening request approved!');
    } catch (err) {
      message.error('Failed to approve request');
    }
  };

  const handleRejectRequest = (id) => {
    try {
      bankStore.updateAccountRequestStatus(id, 'Rejected');
      message.warning('Account opening request rejected.');
    } catch (err) {
      message.error('Failed to reject request');
    }
  };

  const handleApproveLoan = (id) => {
    try {
      bankStore.updateLoanStatus(id, 'Approved');
      message.success('Loan application approved and funds credited!');
    } catch (err) {
      message.error('Failed to approve loan');
    }
  };

  const handleRejectLoan = (id) => {
    try {
      bankStore.updateLoanStatus(id, 'Rejected');
      message.warning('Loan application rejected.');
    } catch (err) {
      message.error('Failed to reject loan');
    }
  };

  // Columns
  const accountColumns = [
    {
      title: 'Customer Name',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <Text className="text-blue-950 font-semibold">{text}</Text>,
    },
    {
      title: 'Account Number',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      render: (text) => <Text code className="text-xs text-blue-600 font-mono">{text}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (val) => <Text className="text-blue-700 font-semibold font-mono">₹{val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>,
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
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Close Account"
          description="Are you sure you want to close this account? Balance will be settled with cash."
          onConfirm={() => handleDeleteCustomer(record.accountNumber)}
          okText="Close Account"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<UserDeleteOutlined />}>
            Close
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const requestColumns = [
    {
      title: 'Requested By',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <Text className="text-blue-950 font-semibold">{text}</Text>,
    },
    {
      title: 'Account Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Initial Deposit',
      dataIndex: 'initialDeposit',
      key: 'initialDeposit',
      render: (val) => <Text className="text-blue-700 font-mono">₹{val.toLocaleString()}</Text>,
    },
    {
      title: 'Submission Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'gold';
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'red';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        record.status === 'Pending' ? (
          <Space size="small">
            <Button type="primary" size="small" onClick={() => handleApproveRequest(record.id)} className="bg-blue-600 hover:bg-blue-500 text-white border-0 rounded">
              Approve
            </Button>
            <Button size="small" danger onClick={() => handleRejectRequest(record.id)} className="rounded">
              Reject
            </Button>
          </Space>
        ) : <span className="text-blue-500 text-xs">Processed</span>
      )
    }
  ];

  const loanColumns = [
    {
      title: 'Applicant',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <Text className="text-blue-950 font-semibold">{text}</Text>,
    },
    {
      title: 'Amount Requested',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => <Text className="text-blue-700 font-mono font-semibold">₹{val.toLocaleString()}</Text>,
    },
    {
      title: 'Term',
      dataIndex: 'term',
      key: 'term',
      render: (term) => <Tag color="geekblue">{term} Months</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'loanType',
      key: 'loanType',
      render: (text) => <Tag color="blue">{text || 'Unsecured Loan'}</Tag>,
    },
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose',
      render: (text) => <Text className="text-blue-600 text-xs">{text}</Text>,
    },
    {
      title: 'Remaining Balance',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      render: (val) => <Text className="text-blue-600 font-mono">₹{val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'gold';
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'red';
        if (status === 'Paid') color = 'blue';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        record.status === 'Pending' ? (
          <Space size="small">
            <Button type="primary" size="small" onClick={() => handleApproveLoan(record.id)} className="bg-blue-600 hover:bg-blue-500 text-white border-0 rounded">
              Approve
            </Button>
            <Button size="small" danger onClick={() => handleRejectLoan(record.id)} className="rounded">
              Reject
            </Button>
          </Space>
        ) : <span className="text-blue-500 text-xs">Processed</span>
      )
    }
  ];

  // Router subviews by activeMenu
  if (activeMenu === 'employee_requests') {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
          <Title level={3} style={{ margin: 0, color: 'white' }}>Account Applications</Title>
          <Text className="text-blue-600 text-xs">Approve or reject customer requests to open savings, checking, or business portfolios.</Text>
        </div>
        <Card className="bg-white border-blue-100 rounded-3xl overflow-hidden">
          <Table
            dataSource={requests}
            columns={requestColumns}
            rowKey="id"
            pagination={{ pageSize: 6 }}
          />
        </Card>
      </div>
    );
  }

  if (activeMenu === 'employee_loans') {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
          <Title level={3} style={{ margin: 0, color: 'white' }}>Loan Underwriting</Title>
          <Text className="text-blue-600 text-xs">Evaluate and process pending loans submitted by retail customers.</Text>
        </div>
        <Card className="bg-white border-blue-100 rounded-3xl overflow-hidden">
          <Table
            dataSource={loans}
            columns={loanColumns}
            rowKey="id"
            pagination={{ pageSize: 6 }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Banner info */}
      <div className="bg-gradient-to-r from-blue-100 via-blue-50 to-white p-8 rounded-3xl border border-blue-200 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between text-blue-950 gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="z-10">
          <span className="text-blue-600 text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 mb-1">
            <DatabaseOutlined className="animate-spin" style={{ animationDuration: '6s' }} /> Ledger Operations Active
          </span>
          <Title level={2} style={{ margin: 0, color: 'white' }} className="font-black">
            Account Control Center
          </Title>
          <Text className="text-blue-800">Open client profiles, adjust user ledger balances, and perform audit controls.</Text>
        </div>
        <div className="flex gap-3 z-10 self-start md:self-auto">
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setCreateAccountVisible(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white border-0 h-11 rounded-xl text-sm font-semibold px-5"
          >
            Create Account
          </Button>
          <Button
            icon={<SwapOutlined />}
            onClick={() => setAdjustmentVisible(true)}
            className="bg-blue-50 text-blue-950 border-blue-200 hover:bg-blue-200 h-11 rounded-xl text-sm font-semibold px-5"
          >
            Debit / Credit Adjust
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <Card className="bg-white border-blue-100 rounded-2xl">
            <Statistic
              title={<span className="text-blue-600 text-xs uppercase tracking-wider">Managed Portfolios</span>}
              value={accounts.length}
              valueStyle={{ color: '#1e3a8a', fontWeight: 'bold' }}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="bg-white border-blue-100 rounded-2xl">
            <Statistic
              title={<span className="text-blue-600 text-xs uppercase tracking-wider">Pending Accounts</span>}
              value={requests.filter(r => r.status === 'Pending').length}
              valueStyle={{ color: '#1e3a8a', fontWeight: 'bold' }}
              prefix={<AuditOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="bg-white border-blue-100 rounded-2xl">
            <Statistic
              title={<span className="text-blue-600 text-xs uppercase tracking-wider">Pending Loans</span>}
              value={loans.filter(l => l.status === 'Pending').length}
              valueStyle={{ color: '#1e3a8a', fontWeight: 'bold' }}
              prefix={<span className="font-bold text-lg mr-1 text-blue-500">₹</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* Account Registry Table */}
      <Card
        className="bg-white border-blue-100 rounded-3xl overflow-hidden"
        title={<span className="text-blue-950 font-bold">Client Account Registry</span>}
      >
        <Table
          dataSource={accounts}
          columns={accountColumns}
          rowKey="accountNumber"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* Create Account Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-blue-100 text-blue-950">
            <UserAddOutlined className="text-blue-700" />
            <span className="font-bold text-lg">Create Customer Account</span>
          </div>
        }
        open={createAccountVisible}
        onCancel={() => {
          setCreateAccountVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateCustomer}
          requiredMark={false}
          className="pt-4"
        >
          <Form.Item
            name="fullName"
            label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Customer Full Name</span>}
            rules={[
              { required: true, message: 'Please input full name!' },
              { min: 3, message: 'Must be at least 3 characters!' }
            ]}
          >
            <Input placeholder="Enter customer's full name" className="rounded-lg" />
          </Form.Item>

          <Form.Item
            name="emailOrPhone"
            label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Email or Phone Number</span>}
            rules={[
              { required: true, message: 'Please input email or phone number!' },
              { min: 3, message: 'Must be at least 3 characters!' }
            ]}
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
            <Button onClick={() => setCreateAccountVisible(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-lg">
              Open Account
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Debit/Credit Balance Adjustment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-blue-100 text-blue-950">
            <SwapOutlined className="text-blue-700" />
            <span className="font-bold text-lg">Debit / Credit Adjustment</span>
          </div>
        }
        open={adjustmentVisible}
        onCancel={() => {
          setAdjustmentVisible(false);
          adjustForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={adjustForm}
          layout="vertical"
          onFinish={handleAdjustBalance}
          requiredMark={false}
          className="pt-4"
        >
          <Form.Item
            name="accountNumber"
            label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Target Account Number</span>}
            rules={[{ required: true, message: 'Select target account!' }]}
          >
            <Select placeholder="Select customer account" className="rounded-lg">
              {accounts.map(acc => (
                <Option key={acc.accountNumber} value={acc.accountNumber}>
                  {acc.accountNumber} ({acc.username}) - Balance: ₹{acc.balance.toLocaleString()}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Adjustment Type</span>}
                rules={[{ required: true }]}
                initialValue="credit"
              >
                <Select className="rounded-lg">
                  <Option value="credit">Credit (+) Deposit</Option>
                  <Option value="debit">Debit (-) Withdraw</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="amount"
                label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Amount (₹)</span>}
                rules={[
                  { required: true, message: 'Input adjust amount!' },
                  { type: 'number', min: 0.01, message: 'Amount must be > 0' }
                ]}
              >
                <InputNumber className="w-full rounded-lg" min={0.01} placeholder="100.00" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={<span className="text-xs uppercase tracking-wider font-semibold text-blue-600">Reason / Description</span>}
            rules={[{ required: true, message: 'Please provide adjustment reason!' }]}
          >
            <Input placeholder="e.g. Audit correction, manual check payout, fee reversal" className="rounded-lg" />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4 border-t border-blue-100">
            <Button onClick={() => setAdjustmentVisible(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-lg">
              Apply Adjustment
            </Button>
          </div>
        </Form>
      </Modal>

    </div>
  );
};

export default EmployeeDashboard;
