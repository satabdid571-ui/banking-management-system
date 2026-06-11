import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDB } from './db.js';
import {
  BankConfig, User, Account, Transaction,
  AccountRequest, Loan, Employee, Department
} from './models/index.js';

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'sbi_bank_super_secret_jwt_key_2026';

// Middleware
app.use(cors());
app.use(express.json());

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Fallback for simulated local storage JSON tokens
      try {
        const parsedToken = JSON.parse(token);
        if (parsedToken && parsedToken.role) {
          req.user = parsedToken;
          return next();
        }
      } catch (e) {
        // Not a JSON token, proceed to return error
      }
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Role Authorization Middleware
function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
}

// ─── Helper: generate unique account number ───────────────────────────────────
async function generateAccountNumber() {
  while (true) {
    const rand = Math.floor(10000 + Math.random() * 90000);
    const accountNumber = `BANK-${rand}`;
    const exists = await Account.findOne({ accountNumber });
    if (!exists) return accountNumber;
  }
}

// ─── Helper: strip password from user object ─────────────────────────────────
function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj._id;
  delete obj.__v;
  return obj;
}

// ─── Auth Routes ─────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const userId = 'usr_' + Math.random().toString(36).substr(2, 9);
    const accountNumber = await generateAccountNumber();

    const newUser = await User.create({
      id: userId,
      username,
      password: bcrypt.hashSync(password, 10),
      role: 'customer',
      accountNumber,
      createdAt: new Date().toISOString()
    });

    const newAccount = await Account.create({
      accountNumber,
      userId,
      username,
      balance: 1000.00,
      status: 'Active',
      type: 'Savings'
    });

    const tx = await Transaction.create({
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      fromAccount: 'SYSTEM',
      fromUsername: 'System',
      toAccount: accountNumber,
      toUsername: username,
      type: 'deposit',
      amount: 1000.00,
      description: 'Welcome Deposit',
      timestamp: new Date().toISOString()
    });

    await BankConfig.updateOne({}, { $inc: { bankReserve: 1000.00 } });

    const tokenPayload = { id: userId, username, role: 'customer' };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(newUser),
      account: newAccount.toObject()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    console.log(`[LOGIN ATTEMPT] username: "${username}", password: "${password}"`);
    
    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (!user) {
      console.log(`[LOGIN FAILED] User not found for username: "${username}"`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      console.log(`[LOGIN FAILED] Invalid password for username: "${username}"`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    console.log(`[LOGIN SUCCESS] User: "${username}"`);

    const tokenPayload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    const account = user.role === 'customer'
      ? await Account.findOne({ userId: user.id })
      : null;

    res.json({
      success: true,
      token,
      user: sanitizeUser(user),
      account: account ? account.toObject() : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const account = user.role === 'customer'
      ? await Account.findOne({ userId: user.id })
      : null;

    res.json({
      user: sanitizeUser(user),
      account: account ? account.toObject() : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Customer Routes ──────────────────────────────────────────────────────────

app.get('/api/customer/account', authenticateToken, requireRole(['customer']), async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.user.id });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json({ account: account.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/customer/transactions', authenticateToken, requireRole(['customer']), async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.user.id });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const txs = await Transaction.find({
      $or: [
        { fromAccount: account.accountNumber },
        { toAccount: account.accountNumber }
      ]
    }).sort({ timestamp: -1 });

    res.json(txs.map(t => t.toObject()));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/customer/deposit', authenticateToken, requireRole(['customer']), async (req, res) => {
  try {
    const { amount } = req.body;
    const floatAmount = parseFloat(amount);
    if (isNaN(floatAmount) || floatAmount <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount' });
    }

    const account = await Account.findOne({ userId: req.user.id });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    account.balance = parseFloat((account.balance + floatAmount).toFixed(2));
    await account.save();
    await BankConfig.updateOne({}, { $inc: { bankReserve: floatAmount } });

    const tx = await Transaction.create({
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      fromAccount: 'SYSTEM',
      fromUsername: 'System',
      toAccount: account.accountNumber,
      toUsername: account.username,
      type: 'deposit',
      amount: floatAmount,
      description: 'Customer Cash Deposit',
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, balance: account.balance, transaction: tx.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/customer/withdraw', authenticateToken, requireRole(['customer']), async (req, res) => {
  try {
    const { amount } = req.body;
    const floatAmount = parseFloat(amount);
    if (isNaN(floatAmount) || floatAmount <= 0) {
      return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    const account = await Account.findOne({ userId: req.user.id });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    if (account.balance < floatAmount) {
      return res.status(400).json({ message: 'Insufficient account balance' });
    }

    account.balance = parseFloat((account.balance - floatAmount).toFixed(2));
    await account.save();
    await BankConfig.updateOne({}, { $inc: { bankReserve: -floatAmount } });

    const tx = await Transaction.create({
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      fromAccount: account.accountNumber,
      fromUsername: account.username,
      toAccount: 'SYSTEM',
      toUsername: 'System',
      type: 'withdraw',
      amount: floatAmount,
      description: 'Customer Cash Withdrawal',
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, balance: account.balance, transaction: tx.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/customer/transfer', authenticateToken, requireRole(['customer']), async (req, res) => {
  try {
    const { recipient, amount, description } = req.body;
    const floatAmount = parseFloat(amount);
    if (isNaN(floatAmount) || floatAmount <= 0) {
      return res.status(400).json({ message: 'Invalid transfer amount' });
    }

    const senderAccount = await Account.findOne({ userId: req.user.id });
    if (!senderAccount) return res.status(404).json({ message: 'Sender account not found' });

    if (senderAccount.balance < floatAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Find recipient by account number or username
    let recipientAccount = null;
    if (recipient.startsWith('BANK-')) {
      recipientAccount = await Account.findOne({ accountNumber: recipient });
    } else {
      const recipientUser = await User.findOne({ username: { $regex: new RegExp(`^${recipient}$`, 'i') } });
      if (recipientUser) {
        recipientAccount = await Account.findOne({ userId: recipientUser.id });
      }
    }

    if (!recipientAccount) {
      return res.status(404).json({ message: 'Recipient account or username not found' });
    }

    if (senderAccount.accountNumber === recipientAccount.accountNumber) {
      return res.status(400).json({ message: 'Cannot transfer funds to yourself' });
    }

    senderAccount.balance = parseFloat((senderAccount.balance - floatAmount).toFixed(2));
    recipientAccount.balance = parseFloat((recipientAccount.balance + floatAmount).toFixed(2));
    await senderAccount.save();
    await recipientAccount.save();

    const tx = await Transaction.create({
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      fromAccount: senderAccount.accountNumber,
      fromUsername: req.user.username,
      toAccount: recipientAccount.accountNumber,
      toUsername: recipientAccount.username,
      type: 'transfer',
      amount: floatAmount,
      description: description || `Transfer to ${recipientAccount.username}`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, transaction: tx.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/customer/loans', authenticateToken, requireRole(['customer']), async (req, res) => {
  try {
    const { amount, term, purpose } = req.body;
    const floatAmount = parseFloat(amount);
    const intTerm = parseInt(term);
    if (isNaN(floatAmount) || floatAmount <= 0) {
      return res.status(400).json({ message: 'Invalid loan amount' });
    }

    const newLoan = await Loan.create({
      id: 'loan_' + Math.random().toString(36).substr(2, 9),
      username: req.user.username,
      amount: floatAmount,
      term: intTerm,
      purpose,
      status: 'Pending',
      remainingAmount: floatAmount,
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, loan: newLoan.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/customer/loans', authenticateToken, requireRole(['customer']), async (req, res) => {
  try {
    const loans = await Loan.find({ username: { $regex: new RegExp(`^${req.user.username}$`, 'i') } });
    res.json(loans.map(l => l.toObject()));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/customer/loans/pay', authenticateToken, requireRole(['customer']), async (req, res) => {
  try {
    const { loanId, amount } = req.body;
    const floatPayment = parseFloat(amount);
    if (isNaN(floatPayment) || floatPayment <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const loan = await Loan.findOne({ id: loanId });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    const account = await Account.findOne({ userId: req.user.id });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    if (account.balance < floatPayment) {
      return res.status(400).json({ message: 'Insufficient balance in checking/savings account' });
    }

    const actualPay = Math.min(loan.remainingAmount, floatPayment);
    loan.remainingAmount = parseFloat((loan.remainingAmount - actualPay).toFixed(2));
    account.balance = parseFloat((account.balance - actualPay).toFixed(2));

    if (loan.remainingAmount <= 0) {
      loan.status = 'Paid';
    }

    await loan.save();
    await account.save();
    await BankConfig.updateOne({}, { $inc: { bankReserve: actualPay } });

    await Transaction.create({
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      fromAccount: account.accountNumber,
      fromUsername: req.user.username,
      toAccount: 'SYSTEM',
      toUsername: 'System',
      type: 'withdraw',
      amount: actualPay,
      description: `Loan Repayment (Loan ID: ${loanId.substring(5, 9)})`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, loan: loan.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/customer/requests', authenticateToken, requireRole(['customer']), async (req, res) => {
  try {
    const { type, initialDeposit } = req.body;
    const floatDeposit = parseFloat(initialDeposit) || 0;

    const newReq = await AccountRequest.create({
      id: 'req_' + Math.random().toString(36).substr(2, 9),
      username: req.user.username,
      type,
      initialDeposit: floatDeposit,
      status: 'Pending',
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, request: newReq.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/customer/requests', authenticateToken, requireRole(['customer']), async (req, res) => {
  try {
    const reqs = await AccountRequest.find({ username: { $regex: new RegExp(`^${req.user.username}$`, 'i') } });
    res.json(reqs.map(r => r.toObject()));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Employee Routes ──────────────────────────────────────────────────────────

app.get('/api/employee/accounts', authenticateToken, requireRole(['employee', 'admin']), async (req, res) => {
  try {
    const accounts = await Account.find();
    res.json(accounts.map(a => a.toObject()));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/employee/accounts', authenticateToken, requireRole(['employee', 'admin']), async (req, res) => {
  try {
    const { username, password, initialDeposit, accountType } = req.body;
    const floatDeposit = parseFloat(initialDeposit) || 0;

    const existing = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (existing) return res.status(400).json({ message: 'Username already exists' });

    const userId = 'usr_' + Math.random().toString(36).substr(2, 9);
    const accountNumber = await generateAccountNumber();

    const newUser = await User.create({
      id: userId,
      username,
      password: bcrypt.hashSync(password, 10),
      role: 'customer',
      accountNumber,
      createdAt: new Date().toISOString()
    });

    const newAccount = await Account.create({
      accountNumber,
      userId,
      username,
      balance: floatDeposit,
      status: 'Active',
      type: accountType || 'Savings'
    });

    if (floatDeposit > 0) {
      await Transaction.create({
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        fromAccount: 'SYSTEM',
        fromUsername: 'System',
        toAccount: accountNumber,
        toUsername: username,
        type: 'deposit',
        amount: floatDeposit,
        description: 'Account Opening Deposit',
        timestamp: new Date().toISOString()
      });
      await BankConfig.updateOne({}, { $inc: { bankReserve: floatDeposit } });
    }

    res.json({ success: true, user: sanitizeUser(newUser), account: newAccount.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/employee/accounts/:accountNumber', authenticateToken, requireRole(['employee', 'admin']), async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const account = await Account.findOne({ accountNumber });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    await BankConfig.updateOne({}, { $inc: { bankReserve: -account.balance } });
    await User.deleteOne({ id: account.userId });
    await Account.deleteOne({ accountNumber });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/employee/accounts/adjust', authenticateToken, requireRole(['employee', 'admin']), async (req, res) => {
  try {
    const { accountNumber, amount, type, description } = req.body;
    const floatAmount = parseFloat(amount);
    if (isNaN(floatAmount) || floatAmount <= 0) {
      return res.status(400).json({ message: 'Invalid adjustment amount' });
    }

    const account = await Account.findOne({ accountNumber });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    if (type === 'debit') {
      if (account.balance < floatAmount) {
        return res.status(400).json({ message: 'Insufficient account balance' });
      }
      account.balance = parseFloat((account.balance - floatAmount).toFixed(2));
      await BankConfig.updateOne({}, { $inc: { bankReserve: -floatAmount } });
    } else if (type === 'credit') {
      account.balance = parseFloat((account.balance + floatAmount).toFixed(2));
      await BankConfig.updateOne({}, { $inc: { bankReserve: floatAmount } });
    } else {
      return res.status(400).json({ message: 'Invalid adjustment type' });
    }

    await account.save();

    await Transaction.create({
      id: 'tx_' + Math.random().toString(36).substr(2, 9),
      fromAccount: type === 'debit' ? accountNumber : 'SYSTEM',
      fromUsername: type === 'debit' ? account.username : 'System',
      toAccount: type === 'credit' ? accountNumber : 'SYSTEM',
      toUsername: type === 'credit' ? account.username : 'System',
      type: type === 'debit' ? 'withdraw' : 'deposit',
      amount: floatAmount,
      description: description || `Employee Manual ${type.toUpperCase()}`,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, account: account.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/employee/requests', authenticateToken, requireRole(['employee', 'admin']), async (req, res) => {
  try {
    const reqs = await AccountRequest.find();
    res.json(reqs.map(r => r.toObject()));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/employee/requests/:id', authenticateToken, requireRole(['employee', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reqItem = await AccountRequest.findOne({ id });
    if (!reqItem) return res.status(404).json({ message: 'Request not found' });

    reqItem.status = status;

    if (status === 'Approved') {
      const user = await User.findOne({ username: { $regex: new RegExp(`^${reqItem.username}$`, 'i') } });
      if (user) {
        const accountNumber = await generateAccountNumber();
        const newAccount = await Account.create({
          accountNumber,
          userId: user.id,
          username: user.username,
          balance: reqItem.initialDeposit,
          status: 'Active',
          type: reqItem.type
        });

        if (reqItem.initialDeposit > 0) {
          await Transaction.create({
            id: 'tx_' + Math.random().toString(36).substr(2, 9),
            fromAccount: 'SYSTEM',
            fromUsername: 'System',
            toAccount: accountNumber,
            toUsername: user.username,
            type: 'deposit',
            amount: reqItem.initialDeposit,
            description: `Initial Deposit - New ${reqItem.type} Account`,
            timestamp: new Date().toISOString()
          });
          await BankConfig.updateOne({}, { $inc: { bankReserve: reqItem.initialDeposit } });
        }
      }
    }

    await reqItem.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/employee/loans', authenticateToken, requireRole(['employee', 'admin']), async (req, res) => {
  try {
    const loans = await Loan.find();
    res.json(loans.map(l => l.toObject()));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/employee/loans/:id', authenticateToken, requireRole(['employee', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const loan = await Loan.findOne({ id });
    if (!loan) return res.status(404).json({ message: 'Loan application not found' });

    loan.status = status;

    if (status === 'Approved') {
      const user = await User.findOne({ username: { $regex: new RegExp(`^${loan.username}$`, 'i') } });
      if (user) {
        const account = await Account.findOne({ userId: user.id });
        if (account) {
          account.balance = parseFloat((account.balance + loan.amount).toFixed(2));
          await account.save();
          await BankConfig.updateOne({}, { $inc: { bankReserve: -loan.amount } });

          await Transaction.create({
            id: 'tx_' + Math.random().toString(36).substr(2, 9),
            fromAccount: 'SYSTEM',
            fromUsername: 'System',
            toAccount: account.accountNumber,
            toUsername: user.username,
            type: 'deposit',
            amount: loan.amount,
            description: `Approved Loan Credit: ${loan.purpose}`,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    await loan.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Admin Routes ─────────────────────────────────────────────────────────────

app.get('/api/admin/reserve', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const config = await BankConfig.findOne();
    res.json({ bankReserve: config ? config.bankReserve : 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/reserve', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { amount } = req.body;
    const floatAmount = parseFloat(amount);
    if (isNaN(floatAmount)) {
      return res.status(400).json({ message: 'Invalid reserve amount' });
    }

    await BankConfig.updateOne({}, { bankReserve: parseFloat(floatAmount.toFixed(2)) }, { upsert: true });
    res.json({ success: true, bankReserve: floatAmount });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/employees', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees.map(e => e.toObject()));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/employees', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, department, role, salary, password } = req.body;
    const empId = 'emp_' + Math.random().toString(36).substr(2, 9);
    
    const newEmp = await Employee.create({
      id: empId,
      name,
      email,
      department,
      role,
      salary: parseFloat(salary) || 0,
      status: 'Active'
    });

    const finalPasswordStr = password ? password : (email ? email : (name + '123'));
    const empPassword = await bcrypt.hash(finalPasswordStr, 10);
    const uniqueUsername = email ? email : (name.toLowerCase().replace(/\s/g, '') + Math.floor(Math.random() * 1000));
    
    await User.create({
      id: empId,
      username: uniqueUsername,
      password: empPassword,
      role: 'employee',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ success: true, employee: newEmp.toObject() });
  } catch (err) {
    console.error('Employee creation error:', err);
    res.status(400).json({ message: err.message || 'Server error' });
  }
});

app.put('/api/admin/employees/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await Employee.findOne({ id });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    // Exclude password from employee object update since Employee schema doesn't store it
    const { password, ...empData } = req.body;
    Object.assign(emp, empData);
    await emp.save();

    // Optionally update user name and password if they changed
    const userUpdate = {};
    if (empData.name) userUpdate.username = empData.name;
    if (password && password.trim().length > 0) {
      userUpdate.password = await bcrypt.hash(password, 10);
    }
    
    if (Object.keys(userUpdate).length > 0) {
      await User.updateOne({ id }, userUpdate);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/employees/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await Employee.deleteOne({ id });
    await User.deleteOne({ id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/departments', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments.map(d => d.toObject()));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/departments', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name is required' });

    const exists = await Department.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) return res.status(400).json({ message: 'Department name already exists' });

    const newDep = await Department.create({
      id: 'dep_' + Math.random().toString(36).substr(2, 9),
      name
    });

    res.status(201).json({ success: true, department: newDep.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/departments/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await Department.deleteOne({ id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/departments/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name is required' });

    const dep = await Department.findOne({ id });
    if (!dep) return res.status(404).json({ message: 'Department not found' });

    const exists = await Department.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, id: { $ne: id } });
    if (exists) return res.status(400).json({ message: 'Department name already exists' });

    dep.name = name;
    await dep.save();
    res.json({ success: true, department: dep.toObject() });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 State Bank of India Backend running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
