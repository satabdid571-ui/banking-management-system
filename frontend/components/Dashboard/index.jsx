import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, Modal, Form, Input, InputNumber, Space, Tooltip, message, Row, Col, Statistic, Typography, Select, Divider } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  SendOutlined, 
  PlusOutlined, 
  MinusOutlined, 
  CopyOutlined, 
  HistoryOutlined, 
  WalletOutlined,
  UserOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  CreditCardOutlined,
  GlobalOutlined,
  MobileOutlined
} from '@ant-design/icons';
import { useAuth } from '../../src/useAuth';
import { bankStore, subscribeToStore } from '../../src/store';

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard = ({ activeMenu }) => {
  const { user, account, refreshAccount } = useAuth();
  
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [requests, setRequests] = useState([]);
  const [customerAccounts, setCustomerAccounts] = useState([]);

  // Modals
  const [transferVisible, setTransferVisible] = useState(false);
  const [depositVisible, setDepositVisible] = useState(false);
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [loanVisible, setLoanVisible] = useState(false);
  const [reqVisible, setReqVisible] = useState(false);
  const [paymentVisible, setPaymentVisible] = useState(false);
  const [statementVisible, setStatementVisible] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // Forms
  const [transferForm] = Form.useForm();
  const [depositForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();
  const [loanForm] = Form.useForm();
  const [reqForm] = Form.useForm();
  const [paymentForm] = Form.useForm();

  // Action Loading
  const [actionLoading, setActionLoading] = useState(false);

  // Load Store Data
  const loadStoreData = () => {
    if (user) {
      setTransactions(bankStore.getTransactions(account?.accountNumber));
      
      const allLoans = bankStore.getLoans();
      setLoans(allLoans.filter(l => l.username.toLowerCase() === user.username.toLowerCase()));

      const allReqs = bankStore.getAccountRequests();
      setRequests(allReqs.filter(r => r.username.toLowerCase() === user.username.toLowerCase()));

      const allAccounts = bankStore.getAccounts();
      setCustomerAccounts(allAccounts.filter(a => a.userId === user.id));
    }
  };

  useEffect(() => {
    loadStoreData();
    const unsubscribe = subscribeToStore(loadStoreData);
    return () => unsubscribe();
  }, [user, account]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Account number copied!');
  };

  // Submissions
  const handleTransfer = async (values) => {
    setActionLoading(true);
    try {
      bankStore.transferFunds(user.id, values.recipient, values.amount, values.description);
      message.success('Transfer completed successfully!');
      transferForm.resetFields();
      setTransferVisible(false);
      refreshAccount();
    } catch (err) {
      message.error(err.message || 'Transfer failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeposit = async (values) => {
    setActionLoading(true);
    try {
      bankStore.depositFunds(user.id, values.amount, values.depositType);
      message.success('Deposit successful!');
      depositForm.resetFields();
      setDepositVisible(false);
      refreshAccount();
    } catch (err) {
      message.error(err.message || 'Deposit failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async (values) => {
    setActionLoading(true);
    try {
      bankStore.withdrawFunds(user.id, values.amount);
      message.success('Withdrawal successful!');
      withdrawForm.resetFields();
      setWithdrawVisible(false);
      refreshAccount();
    } catch (err) {
      message.error(err.message || 'Withdrawal failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestAccount = async (values) => {
    setActionLoading(true);
    try {
      bankStore.requestAccountOpening(user.username, values.type, values.initialDeposit);
      message.success('Account opening request submitted to Employee audit queue!');
      reqForm.resetFields();
      setReqVisible(false);
    } catch (err) {
      message.error(err.message || 'Failed to submit request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyLoan = async (values) => {
    setActionLoading(true);
    try {
      bankStore.applyForLoan(user.username, values.amount, values.term, values.purpose, values.loanType);
      message.success('Loan application submitted! Awaiting loan specialist review.');
      loanForm.resetFields();
      setLoanVisible(false);
    } catch (err) {
      message.error(err.message || 'Loan application failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayInstallment = async (values) => {
    setActionLoading(true);
    try {
      bankStore.payLoanInstallment(selectedLoan.id, values.amount);
      message.success('Installment payment received. Balance adjusted.');
      paymentForm.resetFields();
      setPaymentVisible(false);
      refreshAccount();
    } catch (err) {
      message.error(err.message || 'Repayment failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Columns
  const transactionColumns = [
    {
      title: 'Tx ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text code className="text-xs text-slate-400 font-mono">{text.substring(0, 10)}...</Text>,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Transaction Type',
      dataIndex: 'type',
      key: 'type',
      render: (type, record) => {
        let color = 'blue';
        let label = 'Transfer';
        if (type === 'deposit') {
          color = 'green';
          label = 'Cash Deposit';
        } else if (type === 'withdraw') {
          color = 'red';
          label = 'Cash Withdrawal';
        } else if (record.fromAccount === account?.accountNumber) {
          color = 'orange';
          label = 'Transfer Out';
        } else {
          color = 'cyan';
          label = 'Transfer In';
        }
        return <Tag color={color}>{label.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span className="text-slate-300 text-sm">{text}</span>,
    },
    {
      title: 'Parties',
      key: 'parties',
      render: (_, record) => {
        if (record.type === 'deposit' || record.type === 'withdraw') return <span className="text-slate-500 text-xs">Internal / Cash</span>;
        if (record.fromAccount === account?.accountNumber) {
          return <span className="text-xs text-slate-300">To: <b>{record.toUsername || record.toAccount}</b></span>;
        } else {
          return <span className="text-xs text-slate-300">From: <b>{record.fromUsername || record.fromAccount}</b></span>;
        }
      }
    },
    {
      title: 'Value',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount, record) => {
        const isDebit = record.fromAccount === account?.accountNumber || record.type === 'withdraw';
        return (
          <Text className={`font-bold font-mono ${isDebit ? 'text-rose-400' : 'text-emerald-400'}`}>
            {isDebit ? '-' : '+'} ₹{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
        );
      },
    },
  ];

  const loanColumns = [
    {
      title: 'Loan Code',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text code className="text-xs text-indigo-300 font-mono">{text.substring(0, 10)}</Text>,
    },
    {
      title: 'Principal',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => <Text className="text-slate-200 font-semibold font-mono">₹{val.toLocaleString()}</Text>,
    },
    {
      title: 'Term',
      dataIndex: 'term',
      key: 'term',
      render: (term) => <Tag color="blue">{term} Months</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'loanType',
      key: 'loanType',
      render: (text) => <Tag color="purple">{text || 'Unsecured Loan'}</Tag>,
    },
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose',
      render: (text) => <Text className="text-slate-400 text-xs">{text}</Text>,
    },
    {
      title: 'Owed Balance',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      render: (val) => <Text className="text-rose-400 font-mono font-bold">₹{val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>,
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
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        record.status === 'Approved' && record.remainingAmount > 0 ? (
          <Button 
            type="primary" 
            size="small" 
            onClick={() => {
              setSelectedLoan(record);
              paymentForm.setFieldsValue({ amount: Math.min(record.remainingAmount, 500) });
              setPaymentVisible(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 border-0 rounded text-xs"
          >
            Pay Installment
          </Button>
        ) : <span className="text-slate-500 text-xs">-</span>
      )
    }
  ];

  const requestColumns = [
    {
      title: 'Reference ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <Text code className="text-xs text-indigo-300 font-mono">{text}</Text>,
    },
    {
      title: 'Account Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Starting Deposit',
      dataIndex: 'initialDeposit',
      key: 'initialDeposit',
      render: (val) => <Text className="text-emerald-400 font-mono">₹{val.toLocaleString()}</Text>,
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
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (text) => new Date(text).toLocaleString(),
    }
  ];

  // Router views
  if (activeMenu === 'customer_loans') {
    const totalDebt = loans
      .filter(l => l.status === 'Approved')
      .reduce((acc, curr) => acc + curr.remainingAmount, 0);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
          <div>
            <Title level={3} style={{ margin: 0, color: 'white' }}>Loans & Financing</Title>
            <Text className="text-slate-400 text-xs">Request instant financing capital or process installment payments.</Text>
          </div>
          <Button 
            type="primary" 
            icon={<DollarCircleOutlined />}
            onClick={() => setLoanVisible(true)}
            className="bg-indigo-600 hover:bg-indigo-500 border-0 h-10 rounded-xl"
          >
            Apply for Loan
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Card className="bg-slate-900 border-slate-800 rounded-2xl">
              <Statistic 
                title={<span className="text-slate-400 text-xs uppercase tracking-wider">Total Outstanding Debt</span>}
                value={totalDebt}
                precision={2}
                valueStyle={{ color: '#f87171', fontFamily: 'monospace', fontWeight: 'bold' }}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card className="bg-slate-900 border-slate-800 rounded-2xl">
              <Statistic 
                title={<span className="text-slate-400 text-xs uppercase tracking-wider">Active Loans</span>}
                value={loans.filter(l => l.status === 'Approved' && l.remainingAmount > 0).length}
                valueStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                prefix={<DollarCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card 
          className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden"
          title={<span className="text-slate-200 font-bold">My Financing Portfolios</span>}
        >
          <Table 
            dataSource={loans} 
            columns={loanColumns} 
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>

        {/* Loan Application Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
              <DollarCircleOutlined className="text-indigo-400" />
              <span className="font-bold text-lg">Apply for Capital Financing</span>
            </div>
          }
          open={loanVisible}
          onCancel={() => {
            setLoanVisible(false);
            loanForm.resetFields();
          }}
          footer={null}
          destroyOnClose
        >
          <Form
            form={loanForm}
            layout="vertical"
            onFinish={handleApplyLoan}
            requiredMark={false}
            className="pt-4"
          >
            <Form.Item
              name="loanType"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Loan Category</span>}
              rules={[{ required: true, message: 'Please select loan type!' }]}
              initialValue="Unsecured Loan"
            >
              <Select className="rounded-lg">
                <Option value="Secured Loan">Secured Loan (Collateral Backed)</Option>
                <Option value="Unsecured Loan">Unsecured Loan (Personal)</Option>
                <Option value="Business & Specialized Loan">Business & Specialized Loan</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="amount"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Financing Capital Amount (₹)</span>}
              rules={[
                { required: true, message: 'Please enter loan amount!' },
                { type: 'number', min: 100, message: 'Minimum borrowing amount is ₹100!' }
              ]}
            >
              <InputNumber className="w-full rounded-lg animate-pulse" min={100} placeholder="5000" />
            </Form.Item>

            <Form.Item
              name="term"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Repayment Period</span>}
              rules={[{ required: true }]}
              initialValue={12}
            >
              <Select className="rounded-lg">
                <Option value={6}>6 Months (Standard Repayment)</Option>
                <Option value={12}>12 Months (Medium Term)</Option>
                <Option value={24}>24 Months (Long Term)</Option>
                <Option value={36}>36 Months (Capital Investment)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="purpose"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Borrowing Purpose / Description</span>}
              rules={[{ required: true, message: 'Brief explanation required!' }]}
            >
              <Input placeholder="e.g. Purchase business assets, education, real estate down payment" className="rounded-lg" />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <Button onClick={() => setLoanVisible(false)} className="rounded-lg">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={actionLoading} className="bg-indigo-600 hover:bg-indigo-500 border-0 rounded-lg">
                Submit Underwriting Form
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Repayment Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
              <CreditCardOutlined className="text-emerald-400" />
              <span className="font-bold text-lg">Process Repayment Installment</span>
            </div>
          }
          open={paymentVisible}
          onCancel={() => {
            setPaymentVisible(false);
            paymentForm.resetFields();
          }}
          footer={null}
          destroyOnClose
        >
          <Form
            form={paymentForm}
            layout="vertical"
            onFinish={handlePayInstallment}
            requiredMark={false}
            className="pt-4"
          >
            <div className="mb-4 p-3 bg-slate-900 border border-slate-800 rounded-lg">
              <div className="text-xs text-slate-400 uppercase">Remaining Debt Balance</div>
              <div className="text-xl font-bold font-mono text-rose-400">₹{selectedLoan?.remainingAmount.toLocaleString()}</div>
            </div>

            <Form.Item
              name="amount"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Payment Amount (₹)</span>}
              rules={[
                { required: true, message: 'Please input payment amount!' },
                { type: 'number', min: 1, message: 'Amount must be > ₹1' },
                {
                  validator: (_, val) => {
                    if (val && val > (account?.balance || 0)) {
                      return Promise.reject(new Error('Payment exceeds checking balance!'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber className="w-full rounded-lg" min={1} max={selectedLoan?.remainingAmount} />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <Button onClick={() => setPaymentVisible(false)} className="rounded-lg">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={actionLoading} className="bg-emerald-600 hover:bg-emerald-500 border-0 rounded-lg">
                Submit Payout
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    );
  }

  if (activeMenu === 'customer_requests') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
          <div>
            <Title level={3} style={{ margin: 0, color: 'white' }}>Account Request Hub</Title>
            <Text className="text-slate-400 text-xs">Request additional portfolios (Savings / Checking / Business) to organize funds.</Text>
          </div>
          <Button 
            type="primary" 
            icon={<FileTextOutlined />}
            onClick={() => setReqVisible(true)}
            className="bg-indigo-600 hover:bg-indigo-500 border-0 h-10 rounded-xl"
          >
            Apply for Account
          </Button>
        </div>

        <Card 
          className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden"
          title={<span className="text-slate-200 font-bold">Portfolios Opening Application History</span>}
        >
          <Table 
            dataSource={requests} 
            columns={requestColumns} 
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>

        {/* Request Account Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
              <FileTextOutlined className="text-indigo-400" />
              <span className="font-bold text-lg">Apply for Additional Portfolio</span>
            </div>
          }
          open={reqVisible}
          onCancel={() => {
            setReqVisible(false);
            reqForm.resetFields();
          }}
          footer={null}
          destroyOnClose
        >
          <Form
            form={reqForm}
            layout="vertical"
            onFinish={handleRequestAccount}
            requiredMark={false}
            className="pt-4"
          >
            <Form.Item
              name="type"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Portfolio Class</span>}
              rules={[{ required: true }]}
              initialValue="Checking"
            >
              <Select className="rounded-lg">
                <Option value="Checking">Checking Account</Option>
                <Option value="Savings">Savings Account</Option>
                <Option value="Business">Business Account</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="initialDeposit"
              label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Opening Deposit (₹)</span>}
              rules={[{ required: true, message: 'Please input deposit!' }]}
              initialValue={500}
            >
              <InputNumber className="w-full rounded-lg animate-pulse" min={0} placeholder="500" />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
              <Button onClick={() => setReqVisible(false)} className="rounded-lg">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={actionLoading} className="bg-indigo-600 hover:bg-indigo-500 border-0 rounded-lg">
                Submit Opening Request
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    );
  }

  // Fallback: Default Ledger overview (My Accounts & Transfer)
  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-indigo-900/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between text-white gap-4">
        <div>
          <Title level={3} style={{ margin: 0, color: 'white' }} className="font-bold flex items-center gap-2">
            <span className="wave">👋</span> Welcome back, {user?.username}!
          </Title>
          <Text className="text-indigo-200">Here is your real-time banking ledger summary.</Text>
        </div>
        <div className="flex items-center gap-2 bg-indigo-900/30 border border-indigo-700/30 px-4 py-2 rounded-xl backdrop-blur-sm self-start md:self-auto">
          <UserOutlined className="text-indigo-400" />
          <div className="text-xs">
            <div className="text-indigo-300">Account Owner</div>
            <div className="font-semibold text-indigo-100">{user?.username}</div>
          </div>
        </div>
      </div>

      {/* Account Balance Card & Stats */}
      <Row gutter={[24, 24]}>
        
        {/* Main Balance Card */}
        <Col xs={24} lg={16}>
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-8 rounded-3xl shadow-lg border border-indigo-400/20 min-h-[220px] flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
            {/* Sparkles design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none"></div>

            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-indigo-100 text-sm tracking-wider uppercase font-medium">Available Balance</span>
                <div className="text-4xl lg:text-5xl font-black mt-1 tracking-tight font-mono">
                  ₹{account?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                </div>
              </div>
              <WalletOutlined className="text-4xl text-indigo-100/50" />
            </div>

            <div className="flex justify-between items-end border-t border-indigo-500/30 pt-4 z-10">
              <div>
                <span className="text-indigo-200 text-xs block uppercase">Account Number</span>
                <span className="font-mono text-sm tracking-widest font-semibold flex items-center gap-2 text-indigo-100">
                  {account?.accountNumber || 'BANK-XXXXX'}
                  <Tooltip title="Copy Account Number">
                    <Button 
                      type="text" 
                      size="small" 
                      icon={<CopyOutlined className="text-indigo-200 hover:text-white" />} 
                      onClick={() => copyToClipboard(account?.accountNumber)}
                    />
                  </Tooltip>
                </span>
              </div>
              <div className="text-right">
                <span className="text-indigo-200 text-xs block uppercase">Bank Status</span>
                <Tag color="success" className="m-0 border-0 bg-emerald-500/20 text-emerald-200 font-semibold px-3 py-0.5 rounded-full">ACTIVE</Tag>
              </div>
            </div>
          </div>
        </Col>

        {/* Transaction Hub */}
        <Col xs={24} lg={8}>
          <Card className="h-full bg-slate-900 border-slate-800 rounded-3xl shadow-md flex flex-col justify-center p-2">
            <div className="mb-4">
              <h3 className="font-bold text-slate-200 text-base mb-1">Transaction Services</h3>
              <p className="text-slate-400 text-xs">Execute immediate balance actions on this ledger.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                size="large"
                icon={<PlusOutlined />} 
                className="bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border-emerald-900/40 h-12 rounded-xl text-sm font-semibold flex flex-col items-center justify-center py-6 h-auto"
                onClick={() => setDepositVisible(true)}
              >
                Cash Deposit
              </Button>
              <Button 
                size="large"
                icon={<MinusOutlined />} 
                className="bg-rose-950 text-rose-300 hover:bg-rose-900 border-rose-900/40 h-12 rounded-xl text-sm font-semibold flex flex-col items-center justify-center py-6 h-auto"
                onClick={() => setWithdrawVisible(true)}
              >
                Cash Withdrawal
              </Button>
              <Button 
                type="primary" 
                size="large"
                icon={<SendOutlined />} 
                className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold border-0 flex flex-col items-center justify-center py-6 h-auto"
                onClick={() => setTransferVisible(true)}
              >
                Fund Transfer
              </Button>
              <Button 
                size="large"
                icon={<FileTextOutlined />} 
                className="bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700 rounded-xl text-sm font-semibold flex flex-col items-center justify-center py-6 h-auto"
                onClick={() => setStatementVisible(true)}
              >
                Mini Statement
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Linked Portfolios List if user requested extra checking/savings portfolios */}
      {customerAccounts.length > 1 && (
        <Card 
          className="bg-slate-900 border-slate-800 rounded-3xl"
          title={<span className="text-slate-200 font-bold text-sm">Linked Portfolios ({customerAccounts.length})</span>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {customerAccounts.map(acc => (
              <div 
                key={acc.accountNumber} 
                className={`p-4 rounded-xl border ${acc.accountNumber === account?.accountNumber ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-800 bg-slate-900/50'} flex justify-between items-center`}
              >
                <div>
                  <div className="text-slate-200 font-semibold text-sm">{acc.type} Portfolio</div>
                  <div className="text-slate-400 font-mono text-xs mt-0.5">{acc.accountNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400 font-mono font-bold">₹{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  {acc.accountNumber === account?.accountNumber && <Tag color="indigo" className="m-0 text-xs mt-1">Active View</Tag>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 24/7 Banking Information Card */}
      <Card 
        className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden shadow-sm"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-4 rounded-2xl border border-indigo-500/20 flex-shrink-0 flex gap-4">
            <GlobalOutlined className="text-3xl text-indigo-400" />
            <MobileOutlined className="text-3xl text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-200 text-base mb-1">24/7 Digital Banking & ATM Access</h3>
            <p className="text-slate-400 text-sm m-0">
              Enjoy uninterrupted 24-hour banking services. Access your funds anytime through our nationwide network of ATM booths, comprehensive digital channels, and seamless mobile banking applications.
            </p>
          </div>
        </div>
      </Card>

      {/* Transaction History Card */}
      <Card 
        className="bg-slate-900 border-slate-800 rounded-3xl overflow-hidden" 
        title={
          <div className="flex items-center gap-2 py-1">
            <HistoryOutlined className="text-indigo-400 text-lg" />
            <div>
              <span className="font-bold text-slate-200 text-base block">Transaction History</span>
              <span className="text-xs text-slate-400 font-normal">History of debits and credits on this account</span>
            </div>
          </div>
        }
        extra={
          <Button 
            type="text" 
            icon={<HistoryOutlined />} 
            onClick={loadStoreData} 
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Refresh
          </Button>
        }
      >
        <Table 
          dataSource={transactions} 
          columns={transactionColumns} 
          rowKey="id"
          pagination={{ pageSize: 5 }}
          className="custom-table"
          locale={{ emptyText: 'No transactions found. Make a deposit or transfer to get started!' }}
        />
      </Card>

      {/* Modals */}

      {/* Transfer Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
            <SendOutlined className="text-indigo-400" />
            <span className="font-bold text-lg">Transfer Money</span>
          </div>
        }
        open={transferVisible}
        onCancel={() => {
          transferForm.resetFields();
          setTransferVisible(false);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={transferForm}
          layout="vertical"
          onFinish={handleTransfer}
          requiredMark={false}
          className="pt-4"
        >
          <Form.Item
            name="recipient"
            label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Recipient Account or Username</span>}
            rules={[{ required: true, message: 'Please enter recipient username or account!' }]}
          >
            <Input placeholder="Enter username (e.g. jane) or account (e.g. BANK-10002)" className="rounded-lg" />
          </Form.Item>

          <Form.Item
            name="amount"
            label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Amount (₹)</span>}
            rules={[
              { required: true, message: 'Please enter transfer amount!' },
              { type: 'number', min: 0.01, message: 'Amount must be greater than 0!' },
              {
                validator: (_, val) => {
                  if (val && val > (account?.balance || 0)) {
                    return Promise.reject(new Error('Amount exceeds checking balance!'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber 
              className="w-full rounded-lg" 
              placeholder="0.00" 
              formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Description (Optional)</span>}
          >
            <Input placeholder="E.g. Rent, dinner bill, invoice payment" className="rounded-lg" />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button onClick={() => setTransferVisible(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={actionLoading} 
              className="bg-indigo-600 hover:bg-indigo-500 rounded-lg border-0 px-6 font-semibold"
            >
              Send Transfer
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
            <PlusOutlined className="text-emerald-400" />
            <span className="font-bold text-lg">Deposit Funds</span>
          </div>
        }
        open={depositVisible}
        onCancel={() => {
          depositForm.resetFields();
          setDepositVisible(false);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={depositForm}
          layout="vertical"
          onFinish={handleDeposit}
          requiredMark={false}
          className="pt-4"
        >
          <Form.Item
            name="depositType"
            label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Deposit Category</span>}
            rules={[{ required: true, message: 'Please select deposit type!' }]}
            initialValue="Demand Deposit"
          >
            <Select className="rounded-lg">
              <Option value="Demand Deposit">Demand Deposit (Instant Access)</Option>
              <Option value="Time Deposit">Time Deposit (Fixed Term)</Option>
              <Option value="Specialized Deposit">Specialized Deposit</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Amount to Deposit (₹)</span>}
            rules={[
              { required: true, message: 'Please enter deposit amount!' },
              { type: 'number', min: 0.01, message: 'Amount must be greater than 0!' }
            ]}
          >
            <InputNumber 
              className="w-full rounded-lg" 
              placeholder="0.00" 
              formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button onClick={() => setDepositVisible(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={actionLoading} 
              className="bg-emerald-600 hover:bg-emerald-500 rounded-lg border-0 px-6 font-semibold"
            >
              Deposit Funds
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-white">
            <MinusOutlined className="text-rose-400" />
            <span className="font-bold text-lg">Withdraw Funds</span>
          </div>
        }
        open={withdrawVisible}
        onCancel={() => {
          withdrawForm.resetFields();
          setWithdrawVisible(false);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={withdrawForm}
          layout="vertical"
          onFinish={handleWithdraw}
          requiredMark={false}
          className="pt-4"
        >
          <Form.Item
            name="amount"
            label={<span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Amount to Withdraw (₹)</span>}
            rules={[
              { required: true, message: 'Please enter withdrawal amount!' },
              { type: 'number', min: 0.01, message: 'Amount must be greater than 0!' },
              {
                validator: (_, val) => {
                  if (val && val > (account?.balance || 0)) {
                    return Promise.reject(new Error('Withdrawal exceeds checking balance!'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber 
              className="w-full rounded-lg" 
              placeholder="0.00" 
              formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/₹\s?|(,*)/g, '')}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <Button onClick={() => setWithdrawVisible(false)} className="rounded-lg">
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={actionLoading} 
              className="bg-rose-600 hover:bg-rose-500 rounded-lg border-0 px-6 font-semibold"
            >
              Withdraw Funds
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Mini Statement Modal */}
      <Modal
        title={
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-white">
            <div className="flex items-center gap-2">
              <FileTextOutlined className="text-indigo-400" />
              <span className="font-bold text-lg">Mini Statement</span>
            </div>
            <Button size="small" type="primary" className="bg-indigo-600 border-0" onClick={() => window.print()}>Print</Button>
          </div>
        }
        open={statementVisible}
        onCancel={() => setStatementVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <div className="pt-4 pb-2" id="printable-statement">
          <div className="text-center mb-6">
            <h2 className="text-slate-200 font-bold text-xl m-0">STATE BANK OF INDIA</h2>
            <p className="text-slate-400 text-xs m-0">Account Mini Statement</p>
          </div>
          
          <div className="flex justify-between bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-6">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Account Holder</div>
              <div className="text-slate-200 font-bold">{user?.username}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Account Number</div>
              <div className="text-indigo-400 font-mono font-bold">{account?.accountNumber}</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Last 5 Transactions</div>
            {transactions.slice(0, 5).map((tx, idx) => {
              const isDebit = tx.fromAccount === account?.accountNumber || tx.type === 'withdraw';
              return (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0">
                  <div>
                    <div className="text-slate-200 text-sm font-medium">{tx.description || tx.type.toUpperCase()}</div>
                    <div className="text-slate-500 text-xs">{new Date(tx.timestamp).toLocaleString()}</div>
                  </div>
                  <div className={`font-mono font-bold ${isDebit ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isDebit ? '-' : '+'} ₹{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && <div className="text-slate-500 text-center py-4 text-sm">No recent transactions found.</div>}
          </div>

          <div className="flex justify-between bg-indigo-950/30 p-4 rounded-lg border border-indigo-900/50 mt-4">
            <div className="text-indigo-200 font-semibold">Available Balance</div>
            <div className="text-indigo-100 font-mono font-black text-lg">₹{account?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          
          <div className="text-center mt-6 text-slate-500 text-xs">
            Generated on {new Date().toLocaleString()}
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default Dashboard;
