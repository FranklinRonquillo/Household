/* ==========================================================================
   HOUSEHOLD - Financial & Proportional Math Calculations
   ========================================================================== */

/**
 * Calculates the exact proportional expense split based on monthly incomes.
 * RULE:
 * 1. Proportions are calculated from monthly incomes:
 *    Fran % = Income Fran / Total Income
 *    Yox % = Income Yox / Total Income
 * 2. Total Shared Expenses = Money ACTUALLY paid out of pocket for shared house items
 *    Total Shared = Paid by Fran + Paid by Yox
 * 3. Fair shares of money spent so far:
 *    Due Fran = Total Shared * Fran %
 *    Due Yox = Total Shared * Yox %
 * 4. Settlement Transfer:
 *    Only transfers money if one partner has physically paid more than their proportional share out of pocket.
 *    - If Fran paid > Due Fran: Yox pays Fran (Paid Fran - Due Fran)
 *    - If Yox paid > Due Yox: Fran pays Yox (Paid Yox - Due Yox)
 */
function calculateProportionalSplit(incomeA, incomeB, sharedExpenses = []) {
  const safeIncomeA = Math.max(0, incomeA || 0);
  const safeIncomeB = Math.max(0, incomeB || 0);
  const totalIncome = safeIncomeA + safeIncomeB;

  const nameA = 'Fran';
  const nameB = 'Yox';

  if (totalIncome === 0) {
    return {
      ratioA: 0.5,
      ratioB: 0.5,
      percentA: 50,
      percentB: 50,
      totalShared: 0,
      dueA: 0,
      dueB: 0,
      paidA: 0,
      paidB: 0,
      balance: 0,
      sender: null,
      receiver: null,
      settlementAmount: 0,
      settlementText: '¡Están a mano! Nadie debe nada.'
    };
  }

  const ratioA = safeIncomeA / totalIncome;
  const ratioB = safeIncomeB / totalIncome;

  let paidA = 0;
  let paidB = 0;

  // Sum out-of-pocket payments for shared expenses
  sharedExpenses.forEach(item => {
    const amount = Number(item.monto) || 0;
    if (item.tipo_gasto === 'compartido' || item.es_compartido || !item.tipo_gasto) {
      if (item.pagado_por === 'person_a') {
        paidA += amount;
      } else if (item.pagado_por === 'person_b') {
        paidB += amount;
      }
    }
  });

  // Total shared money actually spent out of pocket so far
  const totalShared = paidA + paidB;

  // Fair share of the money spent so far
  const dueA = totalShared * ratioA;
  const dueB = totalShared * ratioB;

  // Net overpayment: Paid - Due
  const diffA = paidA - dueA; // If positive, Fran overpaid. If negative, Fran underpaid.

  let sender = null;
  let receiver = null;
  let settlementAmount = Math.abs(Math.round(diffA));
  let settlementText = '';

  if (totalShared === 0 || settlementAmount < 50) {
    settlementText = '¡Están a mano! Nadie debe nada 🎉';
  } else if (diffA > 0) {
    // Fran paid more than his share -> Yox must transfer to Fran
    sender = nameB;
    receiver = nameA;
    settlementText = `👩🏻 ${nameB} debe darle ${formatCurrency(settlementAmount)} a 👨🏻 ${nameA}`;
  } else {
    // Yox paid more than her share -> Fran must transfer to Yox
    sender = nameA;
    receiver = nameB;
    settlementText = `👨🏻 ${nameA} debe darle ${formatCurrency(settlementAmount)} a 👩🏻 ${nameB}`;
  }

  return {
    ratioA,
    ratioB,
    percentA: ratioA * 100,
    percentB: ratioB * 100,
    totalShared,
    dueA: Math.round(dueA),
    dueB: Math.round(dueB),
    paidA: Math.round(paidA),
    paidB: Math.round(paidB),
    balance: diffA,
    sender,
    receiver,
    settlementAmount,
    settlementText
  };
}

/**
 * Calculates status of a category budget (Green / Yellow / Red)
 */
function getBudgetSemaphor(spent, limit) {
  if (!limit || limit <= 0) return { status: 'ok', percent: 0, class: 'badge-success', label: 'Sin límite' };
  
  const percent = (spent / limit) * 100;
  
  if (percent > 100) {
    return { status: 'danger', percent, class: 'badge-danger', label: 'Presupuesto excedido 🔴' };
  } else if (percent >= 80) {
    return { status: 'warning', percent, class: 'badge-warning', label: 'Cerca del límite 🟡' };
  } else {
    return { status: 'ok', percent, class: 'badge-success', label: 'Dentro del presupuesto 🟢' };
  }
}

/* ==========================================================================
   MONTH & DATE TIME TRAVEL / HISTORY ENGINE
   ========================================================================== */

const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Returns YYYY-MM-DD in local time
 */
function formatDateToISO(d = new Date()) {
  const dateObj = (d instanceof Date) ? d : new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns YYYY-MM in local time
 */
function formatMonthKey(d = new Date()) {
  const dateObj = (d instanceof Date) ? d : new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Returns current month key e.g. "2026-10"
 */
function getCurrentMonthKey() {
  return formatMonthKey(new Date());
}

/**
 * Formats a monthKey (YYYY-MM) into a human readable Spanish string (e.g. "Octubre 2026")
 */
function getMonthLabel(monthKey) {
  if (!monthKey || typeof monthKey !== 'string') return getMonthLabel(getCurrentMonthKey());
  const parts = monthKey.split('-');
  if (parts.length < 2) return monthKey;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return monthKey;
  return `${MONTH_NAMES_ES[month - 1]} ${year}`;
}

/**
 * Shifts a monthKey by step (+1 or -1 months)
 */
function shiftMonthKey(monthKey, step = 1) {
  const safeKey = monthKey || getCurrentMonthKey();
  const parts = safeKey.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1 + step, 1);
  return formatMonthKey(date);
}

/**
 * Generates an array of available month keys (current + recent past 12 months + any recorded months)
 */
function getAvailableMonthKeys(expenses = [], maxPastMonths = 12) {
  const currentKey = getCurrentMonthKey();
  const set = new Set();
  set.add(currentKey);

  // Add recorded months from expenses
  (expenses || []).forEach(item => {
    if (item && item.fecha && typeof item.fecha === 'string' && item.fecha.length >= 7) {
      set.add(item.fecha.substring(0, 7));
    }
  });

  // Add last maxPastMonths
  let runner = currentKey;
  for (let i = 0; i < maxPastMonths; i++) {
    runner = shiftMonthKey(runner, -1);
    set.add(runner);
  }

  // Convert to array and sort descending (newest first)
  return Array.from(set).sort().reverse();
}

/**
 * Filters expenses by a specific monthKey (YYYY-MM)
 */
function filterExpensesByMonth(expenses = [], monthKey) {
  if (!monthKey) return expenses || [];
  return (expenses || []).filter(item => {
    if (!item || !item.fecha) return false;
    return String(item.fecha).startsWith(monthKey);
  });
}

/**
 * Returns the Monday and Sunday date range for current week
 */
function getWeeklyDateRange(d = new Date()) {
  const curr = new Date(d);
  const dayOfWeek = curr.getDay(); // 0 Sunday, 1 Monday, ...
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDay = monday.getDate();
  const endDay = sunday.getDate();
  const monthName = MONTH_NAMES_ES[monday.getMonth()];
  const year = monday.getFullYear();

  return {
    mondayISO: formatDateToISO(monday),
    sundayISO: formatDateToISO(sunday),
    label: `Semana del ${startDay} al ${endDay} de ${monthName} ${year}`
  };
}

/**
 * Calculates dynamic weekly summary for current week (Lunes a Domingo)
 */
function calculateThisWeekSummary(expenses = [], incomeA = 0, incomeB = 0) {
  const range = getWeeklyDateRange(new Date());
  const weeklyExpensesList = (expenses || []).filter(item => {
    if (!item || !item.fecha) return false;
    const f = String(item.fecha).substring(0, 10);
    return f >= range.mondayISO && f <= range.sundayISO;
  });

  const weekExpenses = weeklyExpensesList.reduce((sum, item) => sum + (Number(item.monto) || 0), 0);
  const totalMonthlyIncome = (Number(incomeA) || 0) + (Number(incomeB) || 0);
  
  // Weekly pro-rated income equivalent (Monthly / 4.33 weeks)
  const weeklyEstimatedIncome = Math.round(totalMonthlyIncome / 4.33);
  
  // Weekly personal expenses ("gustos")
  const weeklyPersonal = weeklyExpensesList
    .filter(item => item.tipo_gasto === 'personal_a' || item.tipo_gasto === 'personal_b')
    .reduce((sum, item) => sum + (Number(item.monto) || 0), 0);

  // Weekly savings/net balance
  const weeklySavings = Math.max(0, weeklyEstimatedIncome - weekExpenses);

  return {
    weekExpenses,
    weeklyEstimatedIncome,
    weeklySavings,
    weeklyPersonal,
    expenseCount: weeklyExpensesList.length,
    dateRangeLabel: range.label
  };
}

/**
 * Calculates dynamic gamification points without hardcoded values
 */
function calculateCouplePoints(appState) {
  if (!appState) return 0;
  const expensesPts = (appState.expenses || []).length * 10;
  const marketPts = (appState.market?.items || []).filter(i => i.checked).length * 5;
  const savingsPts = (appState.savingsGoals || []).filter(g => (g.current || 0) > 0).length * 25;
  const memoriesPts = (appState.memories || []).length * 20;
  return expensesPts + marketPts + savingsPts + memoriesPts;
}

