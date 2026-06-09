const DB_KEY = 'apex_bank_database';

const initialData = {
  bankReserve: 12500000.00, // Bank vault capital amount
  departments: [
    { id: 'dep_1', name: 'Treasury & Vault' },
    { id: 'dep_2', name: 'Retail Banking' },
    { id: 'dep_3', name: 'Loan Operations' },
    { id: 'dep_4', name: 'Risk & Compliance' }
  ],
  employees: [
    { id: 'emp_1', name: 'Alice Smith', email: 'alice@apexbank.com', role: 'Chief Treasurer', department: 'Treasury & Vault', salary: 9500, status: 'Active' },
    { id: 'emp_2', name: 'Bob Johnson', email: 'bob@apexbank.com', role: 'Loan Specialist', department: 'Loan Operations', salary: 7200, status: 'Active' },
    { id: 'emp_3', name: 'Charlie Davis', email: 'charlie@apexbank.com', role: 'Customer Success Manager', department: 'Retail Banking', salary: 5500, status: 'Active' }
  ],
  users: [
    { id: 'usr_admin',    username: 'admin',    password: 'admin123',    role: 'admin',    createdAt: new Date().toISOString() },
    { id: 'usr_employee', username: 'employee', password: 'employee123', role: 'employee', createdAt: new Date().toISOString() },
    { id: 'usr_john',     username: 'voda',     password: 'password',    role: 'customer', accountNumber: 'BANK-10001', createdAt: new Date().toISOString() },
    { id: 'usr_jane',     username: 'hola',     password: 'password',    role: 'customer', accountNumber: 'BANK-10002', createdAt: new Date().toISOString() },
    { id: 'usr_ravi',     username: 'ravi',     password: 'password',    role: 'customer', accountNumber: 'BANK-55321', createdAt: new Date().toISOString() }
  ],
  accounts: [
    { accountNumber: 'BANK-10001', userId: 'usr_john', username: 'voda', balance: 10000.00, status: 'Active',   type: 'Savings' },
    { accountNumber: 'BANK-10002', userId: 'usr_jane', username: 'hola', balance: 12500.00, status: 'Active',   type: 'Checking' },
    { accountNumber: 'BANK-55321', userId: 'usr_ravi', username: 'ravi', balance: 25000.00, status: 'Inactive', type: 'Savings' }
  ],
  transactions: [
    { id: 'tx_1', fromAccount: 'SYSTEM', fromUsername: 'System', toAccount: 'BANK-10001', toUsername: 'voda', type: 'deposit', amount: 10000.00, description: 'Welcome Deposit', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: 'tx_2', fromAccount: 'SYSTEM', fromUsername: 'System', toAccount: 'BANK-10002', toUsername: 'hola', type: 'deposit', amount: 12500.00, description: 'Welcome Deposit', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
    { id: 'tx_3', fromAccount: 'SYSTEM', fromUsername: 'System', toAccount: 'BANK-55321', toUsername: 'ravi', type: 'deposit', amount: 25000.00, description: 'Account Opening Deposit', timestamp: new Date(Date.now() - 3600000 * 24 * 60).toISOString() }
  ],
  accountRequests: [
    { id: 'req_1', username: 'voda', type: 'Checking', initialDeposit: 500,   status: 'Approved', timestamp: new Date(Date.now() - 3600000 * 25).toISOString() },
    { id: 'req_2', username: 'hola', type: 'Savings',  initialDeposit: 1000,  status: 'Approved', timestamp: new Date(Date.now() - 3600000 * 13).toISOString() },
    { id: 'req_3', username: 'ravi', type: 'Savings',  initialDeposit: 25000, status: 'Approved', timestamp: new Date(Date.now() - 3600000 * 24 * 60).toISOString() }
  ],
  loans: [
    { id: 'loan_1', username: 'voda', amount: 5000,  term: 12, purpose: 'Home Renovation', status: 'Approved', remainingAmount: 4200,  loanType: 'Unsecured Loan', createdAt: new Date(Date.now() - 3600000 * 240).toISOString() },
    { id: 'loan_2', username: 'hola', amount: 15000, term: 24, purpose: 'Car Finance',      status: 'Pending',  remainingAmount: 15000, loanType: 'Secured Loan',   createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
    { id: 'loan_3', username: 'ravi', amount: 8000,  term: 36, purpose: 'Medical Equipment', status: 'Rejected', remainingAmount: 8000, loanType: 'Business & Specialized Loan', createdAt: new Date(Date.now() - 3600000 * 24 * 45).toISOString() }
  ],
  customers: [
    {
      id: 'cust_001',
      customerId: 'CID-10001',
      fullName: 'Voda',
      dateOfBirth: '1990-05-15',
      gender: 'Male',
      mobile: '9876543210',
      email: 'voda@example.com',
      address: '12, MG Road, Bangalore, Karnataka 560001',
      aadhaar: '123456789012',
      pan: 'ABCDE1234F',
      occupation: 'Software Engineer',
      nominee: 'Mary Prakash',
      accountType: 'Savings',
      accountNumber: 'BANK-10001',
      initialDeposit: 10000,
      branch: 'BURDWAN MAIN BRANCH',
      ifsc: 'SBIN000048',
      micr: '713002101',
      status: 'Active',
      createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString()
    },
    {
      id: 'cust_002',
      customerId: 'CID-10002',
      fullName: 'Hola',
      dateOfBirth: '1988-11-22',
      gender: 'Female',
      mobile: '9123456780',
      email: 'hola@example.com',
      address: '45, Anna Salai, Chennai, Tamil Nadu 600002',
      aadhaar: '987654321098',
      pan: 'FGHIJ5678K',
      occupation: 'Business Owner',
      nominee: 'Robert Williams',
      accountType: 'Current',
      accountNumber: 'BANK-10002',
      initialDeposit: 12500,
      branch: 'BURDWAN MAIN BRANCH',
      ifsc: 'SBIN000048',
      micr: '713002101',
      status: 'Active',
      createdAt: new Date(Date.now() - 3600000 * 24 * 15).toISOString()
    },
    {
      id: 'cust_003',
      customerId: 'CID-10003',
      fullName: 'Ravi Kumar',
      dateOfBirth: '1995-03-08',
      gender: 'Male',
      mobile: '9988776655',
      email: 'ravi.kumar@example.com',
      address: '78, Park Street, Kolkata, West Bengal 700016',
      aadhaar: '456789012345',
      pan: 'LMNOP9012Q',
      occupation: 'Doctor',
      nominee: 'Sunita Kumar',
      accountType: 'Savings',
      accountNumber: 'BANK-55321',
      initialDeposit: 25000,
      branch: 'BURDWAN MAIN BRANCH',
      ifsc: 'SBIN000048',
      micr: '713002101',
      status: 'Inactive',
      createdAt: new Date(Date.now() - 3600000 * 24 * 60).toISOString()
    }
  ]
};

// Load database
export function loadDb() {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    saveDb(initialData);
    return initialData;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse database, resetting to initialData', e);
    saveDb(initialData);
    return initialData;
  }
}

// Save database and dispatch event
export function saveDb(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('bank-store-update'));
}

// Subscriptions Hook Helper (used to re-render React components)
export function subscribeToStore(callback) {
  window.addEventListener('bank-store-update', callback);
  return () => window.removeEventListener('bank-store-update', callback);
}

// Database Operations
export const bankStore = {
  // --- Admin Methods ---
  getBankReserve() {
    const data = loadDb();
    return data.bankReserve;
  },

  updateBankReserve(amount) {
    const data = loadDb();
    data.bankReserve = parseFloat(amount.toFixed(2));
    saveDb(data);
    return data.bankReserve;
  },

  getEmployees() {
    const data = loadDb();
    return data.employees || [];
  },

  addEmployee(employee) {
    const data = loadDb();
    const newEmp = {
      id: 'emp_' + Math.random().toString(36).substr(2, 9),
      status: 'Active',
      ...employee
    };
    data.employees.push(newEmp);
    saveDb(data);
    return newEmp;
  },

  updateEmployee(id, updatedFields) {
    const data = loadDb();
    data.employees = data.employees.map(emp => emp.id === id ? { ...emp, ...updatedFields } : emp);
    saveDb(data);
  },

  deleteEmployee(id) {
    const data = loadDb();
    data.employees = data.employees.filter(emp => emp.id !== id);
    saveDb(data);
  },

  getDepartments() {
    const data = loadDb();
    return data.departments || [];
  },

  addDepartment(name) {
    const data = loadDb();
    if (data.departments.some(d => d.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Department name already exists');
    }
    const newDep = {
      id: 'dep_' + Math.random().toString(36).substr(2, 9),
      name
    };
    data.departments.push(newDep);
    saveDb(data);
    return newDep;
  },

  deleteDepartment(id) {
    const data = loadDb();
    data.departments = data.departments.filter(d => d.id !== id);
    saveDb(data);
  },

  // --- Customer & Account Management (Employee & Customer) ---
  getUsers() {
    const data = loadDb();
    return data.users;
  },

  getUserByUsername(username) {
    const data = loadDb();
    return data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  getAccounts() {
    const data = loadDb();
    return data.accounts;
  },

  getAccountByNumber(accountNumber) {
    const data = loadDb();
    return data.accounts.find(a => a.accountNumber === accountNumber);
  },

  getAccountByUserId(userId) {
    const data = loadDb();
    return data.accounts.find(a => a.userId === userId);
  },

  // Employee: Create Customer Account
  createCustomerAccount(username, password, initialDeposit, accountType = 'Savings') {
    const data = loadDb();
    
    if (data.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username already exists');
    }

    const userId = 'usr_' + Math.random().toString(36).substr(2, 9);
    let accountNumber = '';
    while (true) {
      const rand = Math.floor(10000 + Math.random() * 90000);
      accountNumber = `BANK-${rand}`;
      if (!data.accounts.some(a => a.accountNumber === accountNumber)) {
        break;
      }
    }

    const newUser = {
      id: userId,
      username,
      password,
      role: 'customer',
      accountNumber,
      createdAt: new Date().toISOString()
    };

    const newAccount = {
      accountNumber,
      userId,
      username,
      balance: parseFloat(initialDeposit) || 0,
      status: 'Active',
      type: accountType
    };

    data.users.push(newUser);
    data.accounts.push(newAccount);

    if (initialDeposit > 0) {
      const tx = {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        fromAccount: 'SYSTEM',
        fromUsername: 'System',
        toAccount: accountNumber,
        toUsername: username,
        type: 'deposit',
        amount: parseFloat(initialDeposit),
        description: 'Account Opening Deposit',
        timestamp: new Date().toISOString()
      };
      data.transactions.push(tx);
      data.bankReserve += parseFloat(initialDeposit);
    }

    saveDb(data);
    return { user: newUser, account: newAccount };
  },

  // Employee: Delete/Close Account
  deleteAccount(accountNumber) {
    const data = loadDb();
    const account = data.accounts.find(a => a.accountNumber === accountNumber);
    if (!account) throw new Error('Account not found');
    
    // Deduct remaining balance from bank reserves if customer takes cash
    data.bankReserve -= account.balance;

    // Filter out account and delete user associated if they are a customer
    data.accounts = data.accounts.filter(a => a.accountNumber !== accountNumber);
    data.users = data.users.filter(u => u.id !== account.userId);
    
    saveDb(data);
  },

  // Employee: Debit/Credit from Account
  adjustBalance(accountNumber, amount, type, description) {
    const data = loadDb();
    const account = data.accounts.find(a => a.accountNumber === accountNumber);
    if (!account) throw new Error('Account not found');

    const floatAmount = parseFloat(amount);
    if (isNaN(floatAmount) || floatAmount <= 0) throw new Error('Invalid amount');

    if (type === 'debit') {
      if (account.balance < floatAmount) throw new Error('Insufficient balance');
      account.balance = parseFloat((account.balance - floatAmount).toFixed(2));
      data.bankReserve -= floatAmount; // Bank pays out cash
    } else if (type === 'credit') {
      account.balance = parseFloat((account.balance + floatAmount).toFixed(2));
      data.bankReserve += floatAmount; // Bank takes cash
    } else {
      throw new Error('Invalid adjustment type');
    }

    const tx = {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      fromAccount: type === 'debit' ? accountNumber : 'SYSTEM',
      fromUsername: type === 'debit' ? account.username : 'System',
      toAccount: type === 'credit' ? accountNumber : 'SYSTEM',
      toUsername: type === 'credit' ? account.username : 'System',
      type: type === 'debit' ? 'withdraw' : 'deposit',
      amount: floatAmount,
      description: description || `Employee Manual ${type.toUpperCase()}`,
      timestamp: new Date().toISOString()
    };

    data.transactions.push(tx);
    saveDb(data);
    return account;
  },

  // --- Transactions (Customer) ---
  getTransactions(accountNumber) {
    const data = loadDb();
    return data.transactions
      .filter(tx => tx.fromAccount === accountNumber || tx.toAccount === accountNumber)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  depositFunds(userId, amount, depositType = 'Demand Deposit') {
    const data = loadDb();
    const floatAmount = parseFloat(amount);
    if (isNaN(floatAmount) || floatAmount <= 0) throw new Error('Invalid amount');

    const account = data.accounts.find(a => a.userId === userId);
    if (!account) throw new Error('Account not found');

    account.balance = parseFloat((account.balance + floatAmount).toFixed(2));
    data.bankReserve += floatAmount;

    const tx = {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      fromAccount: 'SYSTEM',
      fromUsername: 'System',
      toAccount: account.accountNumber,
      toUsername: account.username,
      type: 'deposit',
      amount: floatAmount,
      description: `Customer ${depositType} Deposit`,
      timestamp: new Date().toISOString()
    };

    data.transactions.push(tx);
    saveDb(data);
    return { balance: account.balance, transaction: tx };
  },

  withdrawFunds(userId, amount) {
    const data = loadDb();
    const floatAmount = parseFloat(amount);
    if (isNaN(floatAmount) || floatAmount <= 0) throw new Error('Invalid amount');

    const account = data.accounts.find(a => a.userId === userId);
    if (!account) throw new Error('Account not found');

    if (account.balance < floatAmount) throw new Error('Insufficient balance');

    account.balance = parseFloat((account.balance - floatAmount).toFixed(2));
    data.bankReserve -= floatAmount;

    const tx = {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      fromAccount: account.accountNumber,
      fromUsername: account.username,
      toAccount: 'SYSTEM',
      toUsername: 'System',
      type: 'withdraw',
      amount: floatAmount,
      description: 'Customer Cash Withdrawal',
      timestamp: new Date().toISOString()
    };

    data.transactions.push(tx);
    saveDb(data);
    return { balance: account.balance, transaction: tx };
  },

  transferFunds(fromUserId, toAccountIdentifier, amount, description) {
    const data = loadDb();
    const floatAmount = parseFloat(amount);
    if (isNaN(floatAmount) || floatAmount <= 0) throw new Error('Invalid amount');

    const sender = data.users.find(u => u.id === fromUserId);
    const senderAccount = data.accounts.find(a => a.userId === fromUserId);
    if (!senderAccount) throw new Error('Sender account not found');
    if (senderAccount.balance < floatAmount) throw new Error('Insufficient balance');

    // Find recipient
    let recipientAccount = null;
    if (toAccountIdentifier.startsWith('BANK-')) {
      recipientAccount = data.accounts.find(a => a.accountNumber === toAccountIdentifier);
    } else {
      const recipientUser = data.users.find(u => u.username.toLowerCase() === toAccountIdentifier.toLowerCase());
      if (recipientUser) {
        recipientAccount = data.accounts.find(a => a.userId === recipientUser.id);
      }
    }

    if (!recipientAccount) throw new Error('Recipient account or username not found');
    if (senderAccount.accountNumber === recipientAccount.accountNumber) {
      throw new Error('Cannot transfer to yourself');
    }

    senderAccount.balance = parseFloat((senderAccount.balance - floatAmount).toFixed(2));
    recipientAccount.balance = parseFloat((recipientAccount.balance + floatAmount).toFixed(2));

    const tx = {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      fromAccount: senderAccount.accountNumber,
      fromUsername: sender.username,
      toAccount: recipientAccount.accountNumber,
      toUsername: recipientAccount.username,
      type: 'transfer',
      amount: floatAmount,
      description: description || `Transfer to ${recipientAccount.username}`,
      timestamp: new Date().toISOString()
    };

    data.transactions.push(tx);
    saveDb(data);
    return tx;
  },

  // --- Account Opening Requests ---
  getAccountRequests() {
    const data = loadDb();
    return data.accountRequests || [];
  },

  requestAccountOpening(username, type, initialDeposit) {
    const data = loadDb();
    const newReq = {
      id: 'req_' + Math.random().toString(36).substr(2, 9),
      username,
      type,
      initialDeposit: parseFloat(initialDeposit) || 0,
      status: 'Pending',
      timestamp: new Date().toISOString()
    };
    if (!data.accountRequests) data.accountRequests = [];
    data.accountRequests.push(newReq);
    saveDb(data);
    return newReq;
  },

  updateAccountRequestStatus(id, status) {
    const data = loadDb();
    const req = data.accountRequests.find(r => r.id === id);
    if (!req) throw new Error('Request not found');
    
    req.status = status;

    if (status === 'Approved') {
      // If approved, create the user account automatically (if not already existing)
      // Note: for existing users requesting extra accounts, we just approve it or create the account details
      try {
        const user = data.users.find(u => u.username.toLowerCase() === req.username.toLowerCase());
        if (user) {
          // Add extra account to customer
          let accountNumber = '';
          while (true) {
            const rand = Math.floor(10000 + Math.random() * 90000);
            accountNumber = `BANK-${rand}`;
            if (!data.accounts.some(a => a.accountNumber === accountNumber)) {
              break;
            }
          }
          const newAccount = {
            accountNumber,
            userId: user.id,
            username: user.username,
            balance: req.initialDeposit,
            status: 'Active',
            type: req.type
          };
          data.accounts.push(newAccount);
          if (req.initialDeposit > 0) {
            const tx = {
              id: 'tx_' + Math.random().toString(36).substr(2, 9),
              fromAccount: 'SYSTEM',
              fromUsername: 'System',
              toAccount: accountNumber,
              toUsername: user.username,
              type: 'deposit',
              amount: req.initialDeposit,
              description: `Initial Deposit - New ${req.type} Account`,
              timestamp: new Date().toISOString()
            };
            data.transactions.push(tx);
            data.bankReserve += req.initialDeposit;
          }
        } else {
          // If register request approved (first account opening)
          // Default temporary password
          this.createCustomerAccount(req.username, 'password123', req.initialDeposit, req.type);
        }
      } catch (err) {
        console.error('Failed to create approved account', err);
      }
    }
    
    saveDb(data);
  },

  // --- Loan Operations ---
  getLoans() {
    const data = loadDb();
    return data.loans || [];
  },

  applyForLoan(username, amount, term, purpose, loanType = 'Unsecured Loan') {
    const data = loadDb();
    const floatAmount = parseFloat(amount);
    const intTerm = parseInt(term);
    if (isNaN(floatAmount) || floatAmount <= 0) throw new Error('Invalid loan amount');

    const newLoan = {
      id: 'loan_' + Math.random().toString(36).substr(2, 9),
      username,
      amount: floatAmount,
      term: intTerm,
      purpose,
      loanType,
      status: 'Pending',
      remainingAmount: floatAmount,
      createdAt: new Date().toISOString()
    };
    if (!data.loans) data.loans = [];
    data.loans.push(newLoan);
    saveDb(data);
    return newLoan;
  },

  updateLoanStatus(id, status) {
    const data = loadDb();
    const loan = data.loans.find(l => l.id === id);
    if (!loan) throw new Error('Loan not found');

    loan.status = status;

    if (status === 'Approved') {
      // Deposit loan amount directly into customer account
      const user = data.users.find(u => u.username.toLowerCase() === loan.username.toLowerCase());
      if (user) {
        const account = data.accounts.find(a => a.userId === user.id);
        if (account) {
          account.balance = parseFloat((account.balance + loan.amount).toFixed(2));
          // Deduct from bank reserves to pay out loan
          data.bankReserve -= loan.amount;

          const tx = {
            id: 'tx_' + Math.random().toString(36).substr(2, 9),
            fromAccount: 'SYSTEM',
            fromUsername: 'System',
            toAccount: account.accountNumber,
            toUsername: user.username,
            type: 'deposit',
            amount: loan.amount,
            description: `Approved Loan Credit: ${loan.purpose}`,
            timestamp: new Date().toISOString()
          };
          data.transactions.push(tx);
        }
      }
    }
    saveDb(data);
  },

  payLoanInstallment(loanId, paymentAmount) {
    const data = loadDb();
    const loan = data.loans.find(l => l.id === loanId);
    if (!loan) throw new Error('Loan not found');

    const floatPayment = parseFloat(paymentAmount);
    if (isNaN(floatPayment) || floatPayment <= 0) throw new Error('Invalid payment amount');

    const user = data.users.find(u => u.username.toLowerCase() === loan.username.toLowerCase());
    if (!user) throw new Error('User not found');

    const account = data.accounts.find(a => a.userId === user.id);
    if (!account) throw new Error('Account not found');

    if (account.balance < floatPayment) throw new Error('Insufficient balance in checking/savings account');

    // Pay loan
    const actualPay = Math.min(loan.remainingAmount, floatPayment);
    loan.remainingAmount = parseFloat((loan.remainingAmount - actualPay).toFixed(2));
    account.balance = parseFloat((account.balance - actualPay).toFixed(2));
    
    // Add back to reserves + interest (reserves increases by cash returned)
    data.bankReserve += actualPay;

    if (loan.remainingAmount <= 0) {
      loan.status = 'Paid';
    }

    const tx = {
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      fromAccount: account.accountNumber,
      fromUsername: user.username,
      toAccount: 'SYSTEM',
      toUsername: 'System',
      type: 'withdraw',
      amount: actualPay,
      description: `Loan Repayment (Loan ID: ${loanId.substring(5, 9)})`,
      timestamp: new Date().toISOString()
    };
    data.transactions.push(tx);

    saveDb(data);
    return loan;
  },

  // --- Customer Profile Management (Admin) ---
  getCustomers() {
    const data = loadDb();
    return data.customers || [];
  },

  getCustomerById(id) {
    const data = loadDb();
    return (data.customers || []).find(c => c.id === id);
  },

  addCustomer(customerData) {
    const data = loadDb();
    if (!data.customers) data.customers = [];

    // Prevent duplicates on email, mobile, aadhaar, pan
    if (data.customers.some(c => c.email.toLowerCase() === customerData.email.toLowerCase())) {
      throw new Error('A customer with this email already exists.');
    }
    if (data.customers.some(c => c.mobile === customerData.mobile)) {
      throw new Error('A customer with this mobile number already exists.');
    }
    if (data.customers.some(c => c.aadhaar === customerData.aadhaar)) {
      throw new Error('A customer with this Aadhaar number already exists.');
    }
    if (data.customers.some(c => c.pan.toUpperCase() === customerData.pan.toUpperCase())) {
      throw new Error('A customer with this PAN already exists.');
    }

    // Auto-generate Customer ID
    const maxId = data.customers.reduce((max, c) => {
      const num = parseInt(c.customerId.replace('CID-', ''), 10);
      return num > max ? num : max;
    }, 10000);
    const customerId = 'CID-' + (maxId + 1);

    // Use provided account number (optional) OR auto-generate a 5-digit one
    let accountNumber = '';
    if (customerData.accountNumber && customerData.accountNumber.trim()) {
      accountNumber = customerData.accountNumber.trim().toUpperCase();
      if (data.accounts.some(a => a.accountNumber === accountNumber) ||
          data.customers.some(c => c.accountNumber === accountNumber)) {
        throw new Error('Account number already exists. Please use a different one.');
      }
    } else {
      while (true) {
        const rand = Math.floor(10000 + Math.random() * 90000);
        accountNumber = `BANK-${rand}`;
        if (!data.accounts.some(a => a.accountNumber === accountNumber) &&
            !data.customers.some(c => c.accountNumber === accountNumber)) break;
      }
    }

    const newCustomer = {
      id: 'cust_' + Math.random().toString(36).substr(2, 9),
      customerId,
      accountNumber,
      status: 'Active',
      createdAt: new Date().toISOString(),
      ...customerData,
    };

    data.customers.push(newCustomer);
    saveDb(data);
    return newCustomer;
  },

  updateCustomer(id, updatedFields) {
    const data = loadDb();
    if (!data.customers) throw new Error('No customers found');
    const idx = data.customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Customer not found');

    // Duplicate checks (excluding current customer)
    const others = data.customers.filter(c => c.id !== id);
    if (updatedFields.email && others.some(c => c.email.toLowerCase() === updatedFields.email.toLowerCase())) {
      throw new Error('A customer with this email already exists.');
    }
    if (updatedFields.mobile && others.some(c => c.mobile === updatedFields.mobile)) {
      throw new Error('A customer with this mobile number already exists.');
    }
    if (updatedFields.aadhaar && others.some(c => c.aadhaar === updatedFields.aadhaar)) {
      throw new Error('A customer with this Aadhaar number already exists.');
    }
    if (updatedFields.pan && others.some(c => c.pan.toUpperCase() === updatedFields.pan.toUpperCase())) {
      throw new Error('A customer with this PAN already exists.');
    }

    data.customers[idx] = { ...data.customers[idx], ...updatedFields, updatedAt: new Date().toISOString() };
    saveDb(data);
    return data.customers[idx];
  },

  deleteCustomer(id) {
    const data = loadDb();
    if (!data.customers) throw new Error('No customers found');
    const customer = data.customers.find(c => c.id === id);
    if (!customer) throw new Error('Customer not found');
    data.customers = data.customers.filter(c => c.id !== id);
    saveDb(data);
    return customer;
  },

  updateCustomerStatus(id, status) {
    const data = loadDb();
    if (!data.customers) throw new Error('No customers found');
    const customer = data.customers.find(c => c.id === id);
    if (!customer) throw new Error('Customer not found');
    customer.status = status;
    saveDb(data);
    return customer;
  }
};
