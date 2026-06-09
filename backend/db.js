import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  BankConfig, User, Account, Transaction,
  AccountRequest, Loan, Employee, Department
} from './models/index.js';

// ─── Connect & Seed ──────────────────────────────────────────────────────────
export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sbibank';

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB:', uri);

  await seedIfEmpty();
}

// ─── Seed initial data if collections are empty ───────────────────────────────
async function seedIfEmpty() {
  const userCount = await User.countDocuments();
  if (userCount > 0) return; // Already seeded

  console.log('🌱 Seeding initial data into MongoDB...');

  // BankConfig
  await BankConfig.create({ bankReserve: 12500000.00 });

  // Departments
  await Department.insertMany([
    { id: 'dep_1', name: 'Treasury & Vault' },
    { id: 'dep_2', name: 'Retail Banking' },
    { id: 'dep_3', name: 'Loan Operations' },
    { id: 'dep_4', name: 'Risk & Compliance' }
  ]);

  // Employees
  await Employee.insertMany([
    { id: 'emp_1', name: 'Alice Smith',   email: 'alice@sbi.co.in',   role: 'Chief Treasurer',          department: 'Treasury & Vault', salary: 9500, status: 'Active' },
    { id: 'emp_2', name: 'Bob Johnson',   email: 'bob@sbi.co.in',     role: 'Loan Specialist',           department: 'Loan Operations',  salary: 7200, status: 'Active' },
    { id: 'emp_3', name: 'Charlie Davis', email: 'charlie@sbi.co.in', role: 'Customer Success Manager', department: 'Retail Banking',   salary: 5500, status: 'Active' }
  ]);

  // Users (hashed passwords)
  const users = [
    { id: 'usr_admin',    username: 'sbibwn',    password: bcrypt.hashSync('sbiadmin@1949',    10), role: 'admin',    accountNumber: '',           createdAt: new Date().toISOString() },
    { id: 'usr_employee', username: 'employee', password: bcrypt.hashSync('employee123', 10), role: 'employee', accountNumber: '',           createdAt: new Date().toISOString() },
    { id: 'usr_john',     username: 'john',     password: bcrypt.hashSync('password',    10), role: 'customer', accountNumber: 'BANK-10001', createdAt: new Date().toISOString() },
    { id: 'usr_jane',     username: 'jane',     password: bcrypt.hashSync('password',    10), role: 'customer', accountNumber: 'BANK-10002', createdAt: new Date().toISOString() }
  ];
  await User.insertMany(users);

  // Accounts
  await Account.insertMany([
    { accountNumber: 'BANK-10001', userId: 'usr_john', username: 'john', balance: 10000.00, status: 'Active', type: 'Savings' },
    { accountNumber: 'BANK-10002', userId: 'usr_jane', username: 'jane', balance: 12500.00, status: 'Active', type: 'Checking' }
  ]);

  // Transactions
  const now = Date.now();
  await Transaction.insertMany([
    { id: 'tx_1', fromAccount: 'SYSTEM', fromUsername: 'System', toAccount: 'BANK-10001', toUsername: 'john', type: 'deposit', amount: 10000.00, description: 'Welcome Deposit', timestamp: new Date(now - 3600000 * 24).toISOString() },
    { id: 'tx_2', fromAccount: 'SYSTEM', fromUsername: 'System', toAccount: 'BANK-10002', toUsername: 'jane', type: 'deposit', amount: 12500.00, description: 'Welcome Deposit', timestamp: new Date(now - 3600000 * 12).toISOString() }
  ]);

  // Account Requests
  await AccountRequest.insertMany([
    { id: 'req_1', username: 'john', type: 'Checking', initialDeposit: 500,  status: 'Approved', timestamp: new Date(now - 3600000 * 25).toISOString() },
    { id: 'req_2', username: 'jane', type: 'Savings',  initialDeposit: 1000, status: 'Approved', timestamp: new Date(now - 3600000 * 13).toISOString() }
  ]);

  // Loans
  await Loan.insertMany([
    { id: 'loan_1', username: 'john', amount: 5000,  term: 12, purpose: 'Home Renovation', status: 'Approved', remainingAmount: 4200,  createdAt: new Date(now - 3600000 * 240).toISOString() },
    { id: 'loan_2', username: 'jane', amount: 15000, term: 24, purpose: 'Car Finance',      status: 'Pending',  remainingAmount: 15000, createdAt: new Date(now - 3600000 * 4).toISOString() }
  ]);

  console.log('✅ Seed complete.');
}
