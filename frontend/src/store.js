const DB_KEY = 'sbi_bank_database_v2';

const initialData = {
  bankReserve: 12500000.00, // Bank vault capital amount
  departments: [],
  employees: [],
  users: [],
  accounts: [],
  transactions: [],
  accountRequests: [],
  loans: [],
  customers: []
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

    const newUser = {
      id: newEmp.id,
      username: employee.name,
      emailOrPhone: employee.email,
      password: employee.email,
      role: 'employee',
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);

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
    data.users = data.users.filter(u => u.id !== id);
    saveDb(data);
  },

  addAdmin(fullName, identifier, password) {
    const data = loadDb();
    const newUser = {
      id: 'adm_' + Math.random().toString(36).substr(2, 9),
      username: identifier, // Admin username acts as ID
      emailOrPhone: '',
      password: password,
      role: 'admin',
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    saveDb(data);
    return newUser;
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

  getUserByIdentifier(identifier) {
    const data = loadDb();
    const lowerId = identifier.toLowerCase();
    return data.users.find(u => 
      u.username.toLowerCase() === lowerId || 
      (u.emailOrPhone && u.emailOrPhone.toLowerCase() === lowerId) ||
      (u.accountNumber && u.accountNumber.toLowerCase() === lowerId)
    );
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
  createCustomerAccount(fullName, emailOrPhone, password, initialDeposit, accountType = 'Savings') {
    const data = loadDb();
    
    if (data.users.some(u => 
      u.username.toLowerCase() === fullName.toLowerCase() || 
      (u.emailOrPhone && u.emailOrPhone.toLowerCase() === emailOrPhone.toLowerCase()) ||
      u.username.toLowerCase() === emailOrPhone.toLowerCase()
    )) {
      throw new Error('User or Email/Phone already exists');
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
      username: fullName,
      emailOrPhone,
      password: emailOrPhone, // Force password to be the email address
      role: 'customer',
      accountNumber,
      createdAt: new Date().toISOString()
    };

    const newAccount = {
      accountNumber,
      userId,
      username: fullName,
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
        toUsername: fullName,
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
