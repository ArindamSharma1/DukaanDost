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

export const getMonthSales = (entries) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return entries
    .filter(e => e.date.startsWith(currentMonth) && e.type === 'sale')
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getMonthExpense = (entries) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return entries
    .filter(e => e.date.startsWith(currentMonth) && e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
};

export const getNetProfit = (entries) => {
  return getMonthSales(entries) - getMonthExpense(entries);
};

export const getTotalUdhaarPending = (customers) => {
  return customers.reduce((sum, c) => sum + (c.totalUdhaar || 0), 0);
};
