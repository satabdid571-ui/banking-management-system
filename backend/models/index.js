import mongoose from 'mongoose';

const { Schema } = mongoose;

// ─── BankConfig (single document for bankReserve) ───────────────────────────
const bankConfigSchema = new Schema({
  bankReserve: { type: Number, default: 12500000.00 }
});
export const BankConfig = mongoose.model('BankConfig', bankConfigSchema);

// ─── User ────────────────────────────────────────────────────────────────────
const userSchema = new Schema({
  id:            { type: String, required: true, unique: true },
  username:      { type: String, required: true, unique: true },
  password:      { type: String, required: true },
  role:          { type: String, enum: ['admin', 'employee', 'customer'], default: 'customer' },
  accountNumber: { type: String, default: '' },
  createdAt:     { type: String, default: () => new Date().toISOString() }
});
export const User = mongoose.model('User', userSchema);

// ─── Account ─────────────────────────────────────────────────────────────────
const accountSchema = new Schema({
  accountNumber: { type: String, required: true, unique: true },
  userId:        { type: String, required: true },
  username:      { type: String, required: true },
  balance:       { type: Number, default: 0 },
  status:        { type: String, default: 'Active' },
  type:          { type: String, default: 'Savings' }
});
export const Account = mongoose.model('Account', accountSchema);

// ─── Transaction ─────────────────────────────────────────────────────────────
const transactionSchema = new Schema({
  id:           { type: String, required: true, unique: true },
  fromAccount:  { type: String },
  fromUsername: { type: String },
  toAccount:    { type: String },
  toUsername:   { type: String },
  type:         { type: String },
  amount:       { type: Number },
  description:  { type: String },
  timestamp:    { type: String, default: () => new Date().toISOString() }
});
export const Transaction = mongoose.model('Transaction', transactionSchema);

// ─── AccountRequest ───────────────────────────────────────────────────────────
const accountRequestSchema = new Schema({
  id:             { type: String, required: true, unique: true },
  username:       { type: String },
  type:           { type: String },
  initialDeposit: { type: Number, default: 0 },
  status:         { type: String, default: 'Pending' },
  timestamp:      { type: String, default: () => new Date().toISOString() }
});
export const AccountRequest = mongoose.model('AccountRequest', accountRequestSchema);

// ─── Loan ─────────────────────────────────────────────────────────────────────
const loanSchema = new Schema({
  id:              { type: String, required: true, unique: true },
  username:        { type: String },
  amount:          { type: Number },
  term:            { type: Number },
  purpose:         { type: String },
  status:          { type: String, default: 'Pending' },
  remainingAmount: { type: Number },
  createdAt:       { type: String, default: () => new Date().toISOString() }
});
export const Loan = mongoose.model('Loan', loanSchema);

// ─── Employee ─────────────────────────────────────────────────────────────────
const employeeSchema = new Schema({
  id:         { type: String, required: true, unique: true },
  name:       { type: String },
  email:      { type: String },
  role:       { type: String },
  department: { type: String },
  salary:     { type: Number, default: 0 },
  status:     { type: String, default: 'Active' }
});
export const Employee = mongoose.model('Employee', employeeSchema);

// ─── Department ───────────────────────────────────────────────────────────────
const departmentSchema = new Schema({
  id:   { type: String, required: true, unique: true },
  name: { type: String, required: true }
});
export const Department = mongoose.model('Department', departmentSchema);
