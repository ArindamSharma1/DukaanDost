export const getTodayTotal = (entries) => {
  const today = new Date().toISOString().split('T')[0];
  return entries
    .filter(e => e.date.startsWith(today) && e.type === 'sale')
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getTodayExpense = (entries) => {
  const today = new Date().toISOString().split('T')[0];
  return entries
    .filter(e => e.date.startsWith(today) && e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getMonthSales = (entries, monthYear) => {
  const monthTarget = monthYear || new Date().toISOString().slice(0, 7);
  return entries
    .filter(e => e.date.startsWith(monthTarget) && e.type === 'sale')
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getMonthExpense = (entries, monthYear) => {
  const monthTarget = monthYear || new Date().toISOString().slice(0, 7);
  return entries
    .filter(e => e.date.startsWith(monthTarget) && e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getNetProfit = (entries, monthYear) => {
  return getMonthSales(entries, monthYear) - getMonthExpense(entries, monthYear);
};

export const getTotalUdhaarPending = (customers) => {
  return customers.reduce((sum, c) => sum + (c.totalUdhaar || 0), 0);
};

export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
};
