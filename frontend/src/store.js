import api from './api';

// Event bus for store updates to keep UI reactivity similar to localStorage
export function triggerStoreUpdate() {
  window.dispatchEvent(new Event('bank-store-update'));
}

export function subscribeToStore(callback) {
  window.addEventListener('bank-store-update', callback);
  return () => window.removeEventListener('bank-store-update', callback);
}

export const bankStore = {
  // --- Admin Methods ---
  async getBankReserve() {
    const res = await api.get('/admin/reserve');
    return res.data.bankReserve;
  },

  async updateBankReserve(amount) {
    const res = await api.put('/admin/reserve', { amount });
    triggerStoreUpdate();
    return res.data.bankReserve;
  },

  async getEmployees() {
    const res = await api.get('/admin/employees');
    return res.data;
  },

  async addEmployee(employee) {
    const res = await api.post('/admin/employees', employee);
    triggerStoreUpdate();
    return res.data;
  },

  async updateEmployee(id, updatedFields) {
    const res = await api.put(`/admin/employees/${id}`, updatedFields);
    triggerStoreUpdate();
    return res.data;
  },

  async deleteEmployee(id) {
    await api.delete(`/admin/employees/${id}`);
    triggerStoreUpdate();
  },

  async getDepartments() {
    const res = await api.get('/admin/departments');
    return res.data;
  },

  async addDepartment(name) {
    const res = await api.post('/admin/departments', { name });
    triggerStoreUpdate();
    return res.data;
  },

  async deleteDepartment(id) {
    await api.delete(`/admin/departments/${id}`);
    triggerStoreUpdate();
  },

  // --- Customer & Account Management (Employee & Customer) ---
  async getUsers() {
    const res = await api.get('/admin/users');
    return res.data;
  },

  async getAccounts() {
    const res = await api.get('/employee/accounts');
    return res.data;
  },

  async createCustomerAccount(fullName, email, password, initialDeposit, accountType = 'Savings') {
    const res = await api.post('/employee/accounts', {
      username: fullName,
      email,
      password,
      initialDeposit,
      accountType
    });
    triggerStoreUpdate();
    return res.data; // { user, account }
  },

  async deleteAccount(accountNumber) {
    await api.delete(`/employee/accounts/${accountNumber}`);
    triggerStoreUpdate();
  },

  async adjustBalance(accountNumber, amount, type, description) {
    const res = await api.post('/employee/accounts/adjust', {
      accountNumber, amount, type, description
    });
    triggerStoreUpdate();
    return res.data;
  },

  // --- Transactions (Customer) ---
  async getTransactions(accountNumber) {
    // Admin/Employee can pass accountNumber or get all if omitted
    // Customer endpoint gets their own automatically via token
    const endpoint = accountNumber ? `/employee/transactions?accountNumber=${accountNumber}` : '/employee/transactions';
    const res = await api.get(endpoint);
    return res.data;
  },

  async depositFunds(amount, depositType = 'Demand Deposit') {
    const res = await api.post('/customer/deposit', { amount, depositType });
    triggerStoreUpdate();
    return res.data;
  },

  async withdrawFunds(amount) {
    const res = await api.post('/customer/withdraw', { amount });
    triggerStoreUpdate();
    return res.data;
  },

  async transferFunds(toAccountIdentifier, amount, description) {
    const res = await api.post('/customer/transfer', { toAccountIdentifier, amount, description });
    triggerStoreUpdate();
    return res.data;
  },

  // --- Account Opening Requests ---
  async getAccountRequests() {
    const res = await api.get('/employee/requests');
    return res.data;
  },

  async requestAccountOpening(username, type, initialDeposit) {
    const res = await api.post('/customer/requests', { type, initialDeposit });
    triggerStoreUpdate();
    return res.data;
  },

  async updateAccountRequestStatus(id, status) {
    const res = await api.put(`/employee/requests/${id}`, { status });
    triggerStoreUpdate();
    return res.data;
  },

  // --- Loan Operations ---
  async getLoans() {
    // Try to determine if it's customer or employee via endpoint, let's use employee for admin/employee
    // Wait, components might just call getLoans. If it fails due to role, we might need a better solution.
    // For now we assume this is called by admin/employee.
    const res = await api.get('/employee/loans');
    return res.data;
  },
  
  async getCustomerLoans() {
    const res = await api.get('/customer/loans');
    return res.data;
  },

  async applyForLoan(amount, term, purpose, loanType = 'Unsecured Loan') {
    const res = await api.post('/customer/loans', { amount, term, purpose, loanType });
    triggerStoreUpdate();
    return res.data;
  },

  async updateLoanStatus(id, status) {
    const res = await api.put(`/employee/loans/${id}`, { status });
    triggerStoreUpdate();
    return res.data;
  },

  async payLoanInstallment(loanId, paymentAmount) {
    const res = await api.post('/customer/loans/pay', { loanId, paymentAmount });
    triggerStoreUpdate();
    return res.data;
  },

  // --- Customer Profile Management (Admin) ---
  async getCustomers() {
    const res = await api.get('/admin/customers');
    return res.data;
  },

  async getCustomerById(id) {
    const res = await api.get('/admin/customers');
    return res.data.find(c => c.id === id);
  },

  async addCustomer(customerData) {
    const res = await api.post('/admin/customers', customerData);
    triggerStoreUpdate();
    return res.data;
  },

  async updateCustomer(id, updatedFields) {
    const res = await api.put(`/admin/customers/${id}`, updatedFields);
    triggerStoreUpdate();
    return res.data;
  },

  async deleteCustomer(id) {
    await api.delete(`/admin/customers/${id}`);
    triggerStoreUpdate();
  },

  async updateCustomerStatus(id, status) {
    const res = await api.put(`/admin/customers/${id}`, { status });
    triggerStoreUpdate();
    return res.data;
  }
};
