import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, Button, Table, Tag, Modal, Form, Input, Select,
  Space, Tooltip, message, Row, Col, Statistic, Typography,
  Divider, DatePicker, Descriptions, Badge, Popconfirm, InputNumber
} from 'antd';
import {
  UserAddOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  BankOutlined,
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { bankStore, subscribeToStore } from '../../src/store';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// ─── Utility ────────────────────────────────────────────────────────────────
const statusColor = { Active: 'success', Inactive: 'warning', Suspended: 'error' };
const statusIcon = {
  Active: <CheckCircleOutlined />,
  Inactive: <ExclamationCircleOutlined />,
  Suspended: <CloseOutlined />,
};

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 text-lg">
      {icon}
    </div>
    <div>
      <div className="text-slate-200 font-bold text-sm">{title}</div>
      {subtitle && <div className="text-slate-500 text-xs">{subtitle}</div>}
    </div>
  </div>
);

// ─── Validation helpers ──────────────────────────────────────────────────────
const mobileValidator = (_, value) => {
  if (!value) return Promise.reject('Mobile number is required');
  if (!/^[6-9]\d{9}$/.test(value)) return Promise.reject('Enter a valid 10-digit Indian mobile number');
  return Promise.resolve();
};
const aadhaarValidator = (_, value) => {
  if (!value) return Promise.reject('Aadhaar number is required');
  if (!/^\d{12}$/.test(value)) return Promise.reject('Aadhaar must be exactly 12 digits');
  return Promise.resolve();
};
const panValidator = (_, value) => {
  if (!value) return Promise.reject('PAN number is required');
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.toUpperCase())) {
    return Promise.reject('Invalid PAN format (e.g. ABCDE1234F)');
  }
  return Promise.resolve();
};

// ─── Main Component ──────────────────────────────────────────────────────────
const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [view, setView] = useState('list'); // 'list' | 'add' | 'view' | 'edit'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const loadData = () => {
    setCustomers(bankStore.getCustomers());
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToStore(loadData);
    return () => unsub();
  }, []);

  // ─── Derived / Filtered Data ──────────────────────────────────────────────
  const filteredCustomers = useMemo(() => {
    let list = [...customers];
    if (statusFilter !== 'All') list = list.filter(c => c.status === statusFilter);
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(c =>
        c.fullName?.toLowerCase().includes(q) ||
        c.customerId?.toLowerCase().includes(q) ||
        c.mobile?.includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.accountNumber?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [customers, searchText, statusFilter]);

  const stats = useMemo(() => ({
    total: customers.length,
    active: customers.filter(c => c.status === 'Active').length,
    inactive: customers.filter(c => c.status === 'Inactive').length,
    suspended: customers.filter(c => c.status === 'Suspended').length,
  }), [customers]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleAddCustomer = (values) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
        pan: values.pan?.toUpperCase(),
        ifsc: values.ifsc?.toUpperCase(),
        dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : '',
      };
      // Remove empty accountNumber so store auto-generates it
      if (!submitData.accountNumber || !submitData.accountNumber.trim()) {
        delete submitData.accountNumber;
      }
      bankStore.addCustomer(submitData);
      message.success({ content: `Customer "${values.fullName}" added successfully!`, icon: <CheckCircleOutlined className="text-emerald-400" /> });
      addForm.resetFields();
      setView('list');
    } catch (err) {
      message.error(err.message || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = (values) => {
    setLoading(true);
    try {
      bankStore.updateCustomer(selectedCustomer.id, {
        ...values,
        pan: values.pan?.toUpperCase(),
        dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : selectedCustomer.dateOfBirth,
      });
      message.success({ content: 'Customer record updated successfully!', icon: <CheckCircleOutlined className="text-emerald-400" /> });
      setView('list');
      setSelectedCustomer(null);
    } catch (err) {
      message.error(err.message || 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = () => {
    try {
      bankStore.deleteCustomer(customerToDelete.id);
      message.success({ content: `Customer "${customerToDelete.fullName}" has been deleted.`, icon: <DeleteOutlined className="text-rose-400" /> });
      setDeleteModalOpen(false);
      setCustomerToDelete(null);
      if (view !== 'list') setView('list');
    } catch (err) {
      message.error(err.message || 'Failed to delete customer');
    }
  };

  const openEdit = (customer) => {
    setSelectedCustomer(customer);
    editForm.setFieldsValue({
      ...customer,
      dateOfBirth: customer.dateOfBirth ? dayjs(customer.dateOfBirth) : null,
    });
    setView('edit');
  };

  const openView = (customer) => {
    setSelectedCustomer(customer);
    setView('view');
  };

  const exportData = () => {
    const headers = ['Customer ID', 'Full Name', 'Mobile', 'Email', 'Account Number', 'Account Type', 'Status', 'Created At'];
    const rows = filteredCustomers.map(c => [
      c.customerId, c.fullName, c.mobile, c.email, c.accountNumber, c.accountType, c.status,
      new Date(c.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'customers.csv'; a.click();
    URL.revokeObjectURL(url);
    message.success('Customer data exported as CSV!');
  };

  // ─── Table Columns ────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'Customer ID',
      dataIndex: 'customerId',
      key: 'customerId',
      sorter: (a, b) => a.customerId.localeCompare(b.customerId),
      render: (text) => (
        <Text code className="text-xs text-indigo-300 font-mono">{text}</Text>
      ),
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
            {text?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div className="text-slate-200 font-semibold text-sm">{text}</div>
            <div className="text-slate-500 text-xs">{record.occupation}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (text) => <Text className="text-slate-300 font-mono text-sm">+91 {text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <Text className="text-slate-400 text-xs truncate max-w-[140px] block">{text}</Text>,
    },
    {
      title: 'Account No.',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      render: (text) => <Text code className="text-xs text-cyan-300 font-mono">{text}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => a.status.localeCompare(b.status),
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
        { text: 'Suspended', value: 'Suspended' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={statusColor[status]} icon={statusIcon[status]} className="font-semibold px-2 rounded-full">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined className="text-indigo-400" />}
              onClick={() => openView(record)}
              className="hover:bg-indigo-900/30 rounded-lg"
            />
          </Tooltip>
          <Tooltip title="Edit Customer">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined className="text-amber-400" />}
              onClick={() => openEdit(record)}
              className="hover:bg-amber-900/30 rounded-lg"
            />
          </Tooltip>
          <Tooltip title="Delete Customer">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => { setCustomerToDelete(record); setDeleteModalOpen(true); }}
              className="hover:bg-rose-900/30 rounded-lg"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ─── Customer Form (shared for Add & Edit) ────────────────────────────────
  const CustomerForm = ({ form, onFinish, isEdit = false }) => (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      requiredMark={false}
      className="space-y-2"
    >
      {/* Personal Information */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-4">
        <SectionHeader icon={<UserOutlined />} title="Personal Information" subtitle="Basic identity details" />
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item name="fullName" label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Full Name</span>}
              rules={[{ required: true, message: 'Full name is required' }, { min: 2, message: 'Minimum 2 characters' }]}>
              <Input placeholder="e.g. Rajesh Kumar" className="rounded-lg" prefix={<UserOutlined className="text-slate-500" />} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="dateOfBirth" label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Date of Birth</span>}
              rules={[{ required: true, message: 'Date of birth is required' }]}>
              <DatePicker className="w-full rounded-lg" placeholder="YYYY-MM-DD" disabledDate={d => d && d > dayjs().subtract(18, 'year')} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="gender" label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Gender</span>}
              rules={[{ required: true, message: 'Gender is required' }]}>
              <Select placeholder="Select" className="rounded-lg">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="occupation" label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Occupation</span>}
              rules={[{ required: true, message: 'Occupation is required' }]}>
              <Select placeholder="Select" className="rounded-lg">
                <Option value="Salaried">Salaried</Option>
                <Option value="Software Engineer">Software Engineer</Option>
                <Option value="Business Owner">Business Owner</Option>
                <Option value="Doctor">Doctor</Option>
                <Option value="Lawyer">Lawyer</Option>
                <Option value="Teacher">Teacher</Option>
                <Option value="Retired">Retired</Option>
                <Option value="Student">Student</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="nominee" label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Nominee Name</span>}
              rules={[{ required: true, message: 'Nominee is required' }]}>
              <Input placeholder="e.g. Anita Kumar" className="rounded-lg" />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* Contact Information */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-4">
        <SectionHeader icon={<PhoneOutlined />} title="Contact Information" subtitle="Reachability & address" />
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item name="mobile" label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Mobile Number</span>}
              rules={[{ validator: mobileValidator }]}>
              <Input placeholder="9876543210" maxLength={10} className="rounded-lg" prefix={<PhoneOutlined className="text-slate-500" />} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="email" label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Email Address</span>}
              rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Enter a valid email' }]}>
              <Input placeholder="example@email.com" className="rounded-lg" prefix={<MailOutlined className="text-slate-500" />} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item name="address" label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Residential Address</span>}
              rules={[{ required: true, message: 'Address is required' }, { min: 10, message: 'Address too short' }]}>
              <Input.TextArea rows={2} placeholder="House No., Street, City, State, PIN" className="rounded-lg" />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* KYC Documents */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-4">
        <SectionHeader icon={<IdcardOutlined />} title="KYC Documents" subtitle="Government-issued identification" />
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item name="aadhaar" label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Aadhaar Number</span>}
              rules={[{ validator: aadhaarValidator }]}>
              <Input placeholder="12-digit Aadhaar" maxLength={12} className="rounded-lg font-mono" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="pan" label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">PAN Number</span>}
              rules={[{ validator: panValidator }]}>
              <Input placeholder="ABCDE1234F" maxLength={10} className="rounded-lg font-mono uppercase" style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>
        </Row>
      </div>

      {/* Account Information */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-4">
        <SectionHeader icon={<BankOutlined />} title="Account Information" subtitle="Banking account & branch details" />
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item name="accountType" label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Account Type</span>}
              rules={[{ required: true, message: 'Account type is required' }]} initialValue="Savings">
              <Select className="rounded-lg">
                <Option value="Savings">Savings Account</Option>
                <Option value="Current">Current Account</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            {!isEdit && (
              <Form.Item
                name="accountNumber"
                label={
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Account Number&nbsp;<span className="text-slate-500 font-normal normal-case text-xs">(optional – leave blank to auto‑generate)</span>
                  </span>
                }
              >
                <Input
                  placeholder="e.g. 10001  (max 5 chars)"
                  maxLength={5}
                  className="rounded-lg font-mono"
                  prefix={<BankOutlined className="text-slate-500" />}
                />
              </Form.Item>
            )}
            {isEdit && (
              <Form.Item name="status" label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Account Status</span>}
                rules={[{ required: true }]}>
                <Select className="rounded-lg">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                  <Option value="Suspended">Suspended</Option>
                </Select>
              </Form.Item>
            )}
          </Col>

          {!isEdit && (
            <Col xs={24} sm={12}>
              <Form.Item name="initialDeposit" label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Initial Deposit (₹)</span>}
                rules={[{ required: true, message: 'Initial deposit is required' }, { type: 'number', min: 500, message: 'Minimum deposit is ₹500' }]}
                initialValue={1000}>
                <InputNumber className="w-full rounded-lg" min={500} placeholder="1000" formatter={v => `₹ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={v => v.replace(/₹\s?|(,*)/g, '')} />
              </Form.Item>
            </Col>
          )}

          <Col xs={24} sm={12}>
            <Form.Item
              name="branch"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Branch Name</span>}
              rules={[{ required: true, message: 'Branch is required' }]}
              initialValue="BURDWAN MAIN BRANCH"
            >
              <Input className="rounded-lg" prefix={<BankOutlined className="text-slate-500" />} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="ifsc"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">IFSC Code</span>}
              rules={[{ required: true, message: 'IFSC code is required' }]}
              initialValue="SBIN000048"
            >
              <Input className="rounded-lg font-mono" maxLength={11} style={{ textTransform: 'uppercase' }} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="micr"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">MICR Code</span>}
              rules={[{ required: true, message: 'MICR code is required' }]}
              initialValue="713002101"
            >
              <Input className="rounded-lg font-mono" maxLength={9} />
            </Form.Item>
          </Col>

        </Row>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          icon={<ReloadOutlined />}
          onClick={() => form.resetFields()}
          className="rounded-xl border-slate-700 text-slate-300 hover:border-slate-500"
        >
          Reset Form
        </Button>
        <Button
          onClick={() => { setView('list'); setSelectedCustomer(null); }}
          icon={<CloseOutlined />}
          className="rounded-xl border-slate-700 text-slate-300 hover:border-slate-500"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<SaveOutlined />}
          className="bg-indigo-600 hover:bg-indigo-500 border-0 rounded-xl px-6 font-semibold"
        >
          {isEdit ? 'Update Customer' : 'Save Customer'}
        </Button>
      </div>
    </Form>
  );

  // ─── VIEW: Customer Detail ────────────────────────────────────────────────
  if (view === 'view' && selectedCustomer) {
    const c = selectedCustomer;
    const custTransactions = bankStore.getCustomers().find(cu => cu.id === c.id);
    const totalTransactions = bankStore.getTransactions(c.accountNumber)?.length || 0;
    return (
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-900/50 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {c.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <Title level={3} style={{ margin: 0, color: 'white' }}>{c.fullName}</Title>
              <div className="flex items-center gap-2 mt-1">
                <Text code className="text-xs text-indigo-300">{c.customerId}</Text>
                <Tag color={statusColor[c.status]} icon={statusIcon[c.status]} className="font-semibold rounded-full m-0">{c.status}</Tag>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button icon={<EditOutlined />} onClick={() => openEdit(c)} className="bg-amber-600/20 text-amber-300 border-amber-700/50 hover:bg-amber-600/30 rounded-xl">
              Edit Customer
            </Button>
            <Button icon={<ArrowLeftOutlined />} onClick={() => { setView('list'); setSelectedCustomer(null); }} className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 rounded-xl">
              Back to List
            </Button>
          </div>
        </div>

        {/* Transaction Summary stats */}
        <Row gutter={[16, 16]}>
          {[
            { label: 'Account Number', value: c.accountNumber, color: '#818cf8', icon: <BankOutlined /> },
            { label: 'Account Type', value: c.accountType, color: '#34d399', icon: <SafetyCertificateOutlined /> },
            { label: 'Initial Deposit', value: `₹${(c.initialDeposit || 0).toLocaleString()}`, color: '#60a5fa', icon: <BankOutlined /> },
            { label: 'Transactions', value: totalTransactions, color: '#f59e0b', icon: <TeamOutlined /> },
          ].map((s, i) => (
            <Col key={i} xs={12} sm={6}>
              <Card className="bg-slate-900 border-slate-800 rounded-2xl hover:scale-[1.02] transition-all duration-300">
                <Statistic title={<span className="text-slate-400 text-xs uppercase tracking-wider">{s.label}</span>}
                  value={s.value} valueStyle={{ color: s.color, fontWeight: 'bold', fontSize: '1.1rem' }} prefix={s.icon} />
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          {/* Personal Info */}
          <Col xs={24} lg={12}>
            <Card className="bg-slate-900 border-slate-800 rounded-2xl h-full" title={
              <div className="flex items-center gap-2 text-slate-200">
                <UserOutlined className="text-indigo-400" />
                <span className="font-bold">Personal Information</span>
              </div>
            }>
              <Descriptions column={1} size="small" labelStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                contentStyle={{ color: '#e2e8f0', fontWeight: '500', paddingBottom: '12px' }}>
                <Descriptions.Item label="Full Name">{c.fullName}</Descriptions.Item>
                <Descriptions.Item label="Date of Birth">{c.dateOfBirth}</Descriptions.Item>
                <Descriptions.Item label="Gender">{c.gender}</Descriptions.Item>
                <Descriptions.Item label="Occupation">{c.occupation}</Descriptions.Item>
                <Descriptions.Item label="Nominee">{c.nominee}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Contact Info */}
          <Col xs={24} lg={12}>
            <Card className="bg-slate-900 border-slate-800 rounded-2xl h-full" title={
              <div className="flex items-center gap-2 text-slate-200">
                <PhoneOutlined className="text-emerald-400" />
                <span className="font-bold">Contact Information</span>
              </div>
            }>
              <Descriptions column={1} size="small" labelStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                contentStyle={{ color: '#000101', fontWeight: '500', paddingBottom: '12px' }}>
                <Descriptions.Item label="Mobile">+91 {c.mobile}</Descriptions.Item>
                <Descriptions.Item label="Email">{c.email}</Descriptions.Item>
                <Descriptions.Item label="Address">{c.address}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* KYC */}
          <Col xs={24} lg={12}>
            <Card className="bg-slate-900 border-slate-800 rounded-2xl" title={
              <div className="flex items-center gap-2 text-slate-200">
                <IdcardOutlined className="text-amber-400" />
                <span className="font-bold">KYC Documents</span>
              </div>
            }>
              <Descriptions column={1} size="small" labelStyle={{ color: '#94b5b8ff', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                contentStyle={{ color: '#e2e8f0', fontWeight: '500', paddingBottom: '12px' }}>
                <Descriptions.Item label="Aadhaar Number">
                  <Text className="font-mono text-slate-200">
                    {c.aadhaar ? `XXXX XXXX ${c.aadhaar.slice(-4)}` : 'N/A'}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="PAN Number">
                  <Text className="font-mono text-slate-200">{c.pan}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Account Info */}
          <Col xs={24} lg={12}>
            <Card className="bg-slate-900 border-slate-800 rounded-2xl" title={
              <div className="flex items-center gap-2 text-slate-200">
                <BankOutlined className="text-cyan-400" />
                <span className="font-bold">Account Information</span>
              </div>
            }>
              <Descriptions column={1} size="small" labelStyle={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                contentStyle={{ color: '#e2e8f0', fontWeight: '500', paddingBottom: '12px' }}>
                <Descriptions.Item label="Account Number">
                  <Text code className="text-cyan-300 font-mono">{c.accountNumber}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Account Type">
                  <Tag color="blue">{c.accountType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Branch">
                  <Text className="text-slate-200 font-semibold">{c.branch || 'BURDWAN MAIN BRANCH'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="IFSC Code">
                  <Text className="font-mono text-indigo-300 font-bold">{c.ifsc || 'SBIN000048'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="MICR Code">
                  <Text className="font-mono text-purple-300 font-bold">{c.micr || '713002101'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Initial Deposit">
                  <Text className="text-emerald-400 font-mono font-bold">₹{(c.initialDeposit || 0).toLocaleString()}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Badge status={c.status === 'Active' ? 'success' : c.status === 'Suspended' ? 'error' : 'warning'} text={<span className="text-slate-200">{c.status}</span>} />
                </Descriptions.Item>
                <Descriptions.Item label="Registered On">
                  {new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* Delete Confirmation Modal */}
        <Modal
          open={deleteModalOpen}
          onCancel={() => setDeleteModalOpen(false)}
          footer={null}
          centered
          width={440}
          title={
            <div className="flex items-center gap-2 text-rose-400">
              <DeleteOutlined />
              <span className="font-bold">Delete Customer</span>
            </div>
          }
        >
          <div className="py-4">
            <div className="bg-rose-950/30 border border-rose-800/50 rounded-xl p-4 mb-4">
              <p className="text-slate-200 text-sm">
                Are you sure you want to delete <strong className="text-white">{customerToDelete?.fullName}</strong>?
                This action <strong className="text-rose-400">cannot be undone</strong>.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button onClick={() => setDeleteModalOpen(false)} icon={<CloseOutlined />} className="rounded-xl border-slate-700 text-slate-300">
                Cancel
              </Button>
              <Button danger type="primary" icon={<DeleteOutlined />} onClick={handleDeleteConfirm} className="rounded-xl bg-rose-600 hover:bg-rose-500 border-0">
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  // ─── VIEW: Add Customer ───────────────────────────────────────────────────
  if (view === 'add') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-900/50 p-6 rounded-2xl">
          <div>
            <Title level={3} style={{ margin: 0, color: 'white' }} className="flex items-center gap-2">
              <UserAddOutlined className="text-emerald-400" /> Add New Customer
            </Title>
            <Text className="text-slate-400 text-xs">Fill in all required fields to register a new bank customer.</Text>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => { setView('list'); addForm.resetFields(); }} className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 rounded-xl">
            Back to List
          </Button>
        </div>
        <Card className="bg-slate-900 border-slate-800 rounded-3xl">
          <CustomerForm form={addForm} onFinish={handleAddCustomer} isEdit={false} />
        </Card>
      </div>
    );
  }

  // ─── VIEW: Edit Customer ──────────────────────────────────────────────────
  if (view === 'edit' && selectedCustomer) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-950 to-slate-900 border border-amber-900/50 p-6 rounded-2xl">
          <div>
            <Title level={3} style={{ margin: 0, color: 'white' }} className="flex items-center gap-2">
              <EditOutlined className="text-amber-400" /> Edit Customer
            </Title>
            <Text className="text-slate-400 text-xs">Updating record for: <strong className="text-amber-300">{selectedCustomer.fullName}</strong> ({selectedCustomer.customerId})</Text>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => { setView('list'); setSelectedCustomer(null); }} className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 rounded-xl">
            Back to List
          </Button>
        </div>
        <Card className="bg-slate-900 border-slate-800 rounded-3xl">
          <CustomerForm form={editForm} onFinish={handleEditCustomer} isEdit={true} />
        </Card>
      </div>
    );
  }

  // ─── VIEW: Customer List (default) ────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Page Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-indigo-400 text-xs font-bold tracking-widest uppercase flex items-center gap-1.5 mb-1">
              <TeamOutlined /> Customer Management Portal
            </span>
            <Title level={3} style={{ margin: 0, color: 'white' }}>Customer Registry</Title>
            <Text className="text-slate-400 text-xs">Manage, view, and control all customer records in the banking system.</Text>
          </div>
          {/* Top Action Bar */}
          <div className="flex flex-wrap gap-2">
            <Tooltip title="Add New Customer">
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => { setView('add'); addForm.resetFields(); }}
                className="bg-indigo-600 hover:bg-indigo-500 border-0 rounded-xl font-semibold h-10"
              >
                Add Customer
              </Button>
            </Tooltip>
            <Tooltip title="Export as CSV">
              <Button icon={<DownloadOutlined />} onClick={exportData} className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 rounded-xl h-10">
                Export Data
              </Button>
            </Tooltip>
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined />} onClick={loadData} className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 rounded-xl h-10">
                Refresh
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <Row gutter={[16, 16]}>
        {[
          { label: 'Total Customers', value: stats.total, color: '#818cf8', icon: <TeamOutlined /> },
          { label: 'Active', value: stats.active, color: '#34d399', icon: <CheckCircleOutlined /> },
          { label: 'Inactive', value: stats.inactive, color: '#fbbf24', icon: <ExclamationCircleOutlined /> },
          { label: 'Suspended', value: stats.suspended, color: '#f87171', icon: <CloseOutlined /> },
        ].map((s, i) => (
          <Col key={i} xs={12} sm={6}>
            <Card className="bg-slate-900 border-slate-800 rounded-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer" onClick={() => setStatusFilter(i === 0 ? 'All' : s.label)}>
              <Statistic
                title={<span className="text-slate-400 text-xs uppercase tracking-wider">{s.label}</span>}
                value={s.value}
                valueStyle={{ color: s.color, fontWeight: 'bold' }}
                prefix={s.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Customer Table */}
      <Card
        className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden"
        title={
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <TeamOutlined className="text-indigo-400 text-lg" />
              <span className="text-slate-200 font-bold">All Customers</span>
              <Tag color="indigo" className="m-0 font-mono">{filteredCustomers.length}</Tag>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Search name, ID, mobile, email…"
                prefix={<SearchOutlined className="text-slate-500" />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                allowClear
                className="rounded-xl w-64 bg-slate-800 border-slate-700"
              />
              <Select value={statusFilter} onChange={setStatusFilter} className="rounded-xl w-36" style={{ minWidth: 120 }}>
                <Option value="All">All Status</Option>
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Suspended">Suspended</Option>
              </Select>
            </div>
          </div>
        }
      >
        <Table
          dataSource={filteredCustomers}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 8,
            showSizeChanger: true,
            pageSizeOptions: ['5', '8', '15', '25'],
            showTotal: (total, range) => <span className="text-slate-400 text-xs">{range[0]}-{range[1]} of {total} customers</span>,
          }}
          scroll={{ x: 'max-content' }}
          rowClassName={() => 'hover:bg-slate-800/50 transition-colors'}
          locale={{ emptyText: <div className="py-12 text-center text-slate-500"><TeamOutlined className="text-4xl mb-3 block" />No customers found</div> }}
        />
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onCancel={() => { setDeleteModalOpen(false); setCustomerToDelete(null); }}
        footer={null}
        centered
        width={440}
        title={
          <div className="flex items-center gap-2 text-rose-400">
            <DeleteOutlined />
            <span className="font-bold text-base">Delete Customer</span>
          </div>
        }
      >
        <div className="py-3">
          <div className="bg-rose-950/30 border border-rose-800/50 rounded-xl p-4 mb-5">
            <p className="text-slate-200 text-sm leading-relaxed">
              Are you sure you want to delete{' '}
              <strong className="text-white">{customerToDelete?.fullName}</strong>{' '}
              (<Text code className="text-xs text-indigo-300">{customerToDelete?.customerId}</Text>)?
              <br />
              <span className="text-rose-400 font-semibold">This action cannot be undone.</span>
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button onClick={() => { setDeleteModalOpen(false); setCustomerToDelete(null); }} icon={<CloseOutlined />} className="rounded-xl border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button danger type="primary" icon={<DeleteOutlined />} onClick={handleDeleteConfirm} className="rounded-xl bg-rose-600 hover:bg-rose-500 border-0 font-semibold">
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerManagement;
