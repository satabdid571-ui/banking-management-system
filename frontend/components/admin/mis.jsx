import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Progress, Table, Tag } from 'antd';
import {
  BankOutlined,
  UsergroupAddOutlined,
  PieChartOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { bankStore, subscribeToStore } from '../../src/store';

const { Title, Text } = Typography;

const MISDashboard = () => {
  const [data, setData] = useState({
    reserve: 0,
    accounts: [],
    loans: [],
    customers: [],
    employees: [],
    transactions: []
  });

  const loadData = () => {
    setData({
      reserve: bankStore.getBankReserve(),
      accounts: bankStore.getAccounts(),
      loans: bankStore.getLoans(),
      customers: bankStore.getCustomers(),
      employees: bankStore.getEmployees(),
      transactions: bankStore.getBankReserve() ? loadDbTransactions() : []
    });
  };

  // Helper to load raw tx from localstorage since bankStore doesn't expose getAllTransactions
  const loadDbTransactions = () => {
    const raw = localStorage.getItem('apex_bank_database');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return parsed.transactions || [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToStore(loadData);
    return () => unsubscribe();
  }, []);

  // Calculate Metrics
  const totalLiabilities = data.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalAssets = data.reserve + data.loans.reduce((sum, l) => sum + (l.status === 'Approved' ? l.remainingAmount : 0), 0);
  
  const totalLoanPrincipal = data.loans.reduce((sum, l) => sum + (l.status === 'Approved' ? l.amount : 0), 0);
  
  // Loan Distribution
  const securedLoans = data.loans.filter(l => l.loanType === 'Secured Loan').length;
  const unsecuredLoans = data.loans.filter(l => l.loanType === 'Unsecured Loan').length;
  const businessLoans = data.loans.filter(l => l.loanType === 'Business & Specialized Loan').length;
  const totalLoanCount = data.loans.length || 1; // avoid div by 0

  // Account Distribution
  const savingsAccounts = data.accounts.filter(a => a.type === 'Savings').length;
  const checkingAccounts = data.accounts.filter(a => a.type === 'Checking').length;
  const businessAccounts = data.accounts.filter(a => a.type === 'Business').length;
  const totalAccCount = data.accounts.length || 1;

  // Recent Large Transactions
  const largeTransactions = [...data.transactions]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const txColumns = [
    {
      title: 'TXID',
      dataIndex: 'id',
      render: text => <Text code className="text-xs">{text}</Text>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: text => <Tag color="blue">{text.toUpperCase()}</Tag>
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      render: val => <Text className="font-mono font-semibold">₹{val.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
    },
    {
      title: 'Description',
      dataIndex: 'description'
    },
    {
      title: 'Date',
      dataIndex: 'timestamp',
      render: text => new Date(text).toLocaleString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <Title level={3} style={{ margin: 0, color: 'white' }}>
            <PieChartOutlined className="mr-3" />
            Management Information System
          </Title>
          <Text className="text-indigo-200 text-sm">Real-time aggregate data and performance indicators across the banking network.</Text>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card className="bg-slate-900 border-slate-800 rounded-2xl h-full shadow-lg">
            <Statistic 
              title={<span className="text-slate-400 uppercase tracking-widest text-xs">Total Network Assets</span>} 
              value={totalAssets} 
              precision={2} 
              prefix="₹" 
              valueStyle={{ color: '#34d399', fontWeight: '900', fontSize: '28px' }} 
            />
            <div className="mt-4 text-xs text-slate-500 border-t border-slate-800 pt-3">
              Includes Liquid Reserves (₹{data.reserve.toLocaleString()}) + Outstanding Loan Principal
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="bg-slate-900 border-slate-800 rounded-2xl h-full shadow-lg">
            <Statistic 
              title={<span className="text-slate-400 uppercase tracking-widest text-xs">Total Liabilities (Deposits)</span>} 
              value={totalLiabilities} 
              precision={2} 
              prefix="₹" 
              valueStyle={{ color: '#fbbf24', fontWeight: '900', fontSize: '28px' }} 
            />
            <div className="mt-4 text-xs text-slate-500 border-t border-slate-800 pt-3">
              Total combined balances across {data.accounts.length} active customer portfolios
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="bg-slate-900 border-slate-800 rounded-2xl h-full shadow-lg">
            <Statistic 
              title={<span className="text-slate-400 uppercase tracking-widest text-xs">Total Loan Principal Issued</span>} 
              value={totalLoanPrincipal} 
              precision={2} 
              prefix="₹" 
              valueStyle={{ color: '#f87171', fontWeight: '900', fontSize: '28px' }} 
            />
            <div className="mt-4 text-xs text-slate-500 border-t border-slate-800 pt-3">
              Capital currently distributed via {data.loans.filter(l => l.status === 'Approved').length} approved loans
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            className="bg-slate-900 border-slate-800 rounded-2xl shadow-lg"
            title={<span className="text-white font-bold"><CreditCardOutlined className="mr-2" />Loan Portfolio Distribution</span>}
          >
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Secured Loans ({securedLoans})</span>
                <span className="text-emerald-400">{Math.round((securedLoans / totalLoanCount) * 100)}%</span>
              </div>
              <Progress percent={Math.round((securedLoans / totalLoanCount) * 100)} strokeColor="#34d399" showInfo={false} />
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Unsecured Loans ({unsecuredLoans})</span>
                <span className="text-rose-400">{Math.round((unsecuredLoans / totalLoanCount) * 100)}%</span>
              </div>
              <Progress percent={Math.round((unsecuredLoans / totalLoanCount) * 100)} strokeColor="#fb7185" showInfo={false} />
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Business & Specialized ({businessLoans})</span>
                <span className="text-indigo-400">{Math.round((businessLoans / totalLoanCount) * 100)}%</span>
              </div>
              <Progress percent={Math.round((businessLoans / totalLoanCount) * 100)} strokeColor="#818cf8" showInfo={false} />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            className="bg-slate-900 border-slate-800 rounded-2xl shadow-lg"
            title={<span className="text-white font-bold"><UsergroupAddOutlined className="mr-2" />Account Portfolio Distribution</span>}
          >
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Savings Accounts ({savingsAccounts})</span>
                <span className="text-cyan-400">{Math.round((savingsAccounts / totalAccCount) * 100)}%</span>
              </div>
              <Progress percent={Math.round((savingsAccounts / totalAccCount) * 100)} strokeColor="#22d3ee" showInfo={false} />
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Checking Accounts ({checkingAccounts})</span>
                <span className="text-amber-400">{Math.round((checkingAccounts / totalAccCount) * 100)}%</span>
              </div>
              <Progress percent={Math.round((checkingAccounts / totalAccCount) * 100)} strokeColor="#fcd34d" showInfo={false} />
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Business Accounts ({businessAccounts})</span>
                <span className="text-purple-400">{Math.round((businessAccounts / totalAccCount) * 100)}%</span>
              </div>
              <Progress percent={Math.round((businessAccounts / totalAccCount) * 100)} strokeColor="#c084fc" showInfo={false} />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <Card className="bg-slate-900 border-slate-800 rounded-2xl text-center shadow-lg">
            <Statistic title={<span className="text-slate-400 text-xs">Total Customers</span>} value={data.customers.length} valueStyle={{ color: 'white' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="bg-slate-900 border-slate-800 rounded-2xl text-center shadow-lg">
            <Statistic title={<span className="text-slate-400 text-xs">Total Employees</span>} value={data.employees.length} valueStyle={{ color: 'white' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="bg-slate-900 border-slate-800 rounded-2xl text-center shadow-lg">
            <Statistic title={<span className="text-slate-400 text-xs">Total Active Accounts</span>} value={data.accounts.length} valueStyle={{ color: 'white' }} />
          </Card>
        </Col>
      </Row>

      <Card 
        className="bg-slate-900 border-slate-800 rounded-2xl shadow-lg overflow-hidden"
        title={<span className="text-white font-bold">Largest Network Transactions</span>}
      >
        <Table 
          dataSource={largeTransactions} 
          columns={txColumns} 
          rowKey="id" 
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default MISDashboard;
