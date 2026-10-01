/* ==========================================================================
   HOUSEHOLD - Financial & Proportional Math Calculations
   ========================================================================== */

/**
 * Calculates the exact proportional expense split based on monthly incomes
 * @param {number} incomeA - Income of Person A (e.g. Franklin)
 * @param {number} incomeB - Income of Person B (Partner)
 * @param {Array} sharedExpenses - Array of shared expense items
 * @returns {Object} Proportional split breakdown
 */
function calculateProportionalSplit(incomeA, incomeB, sharedExpenses = []) {
  const safeIncomeA = Math.max(0, incomeA || 0);
  const safeIncomeB = Math.max(0, incomeB || 0);
  const totalIncome = safeIncomeA + safeIncomeB;

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
      debtorName: 'Nadie',
      settlementAmount: 0
    };
  }

  const ratioA = safeIncomeA / totalIncome;
  const ratioB = safeIncomeB / totalIncome;

  let totalShared = 0;
  let paidA = 0;
  let paidB = 0;

  sharedExpenses.forEach(item => {
    const amount = Number(item.monto) || 0;
    if (item.tipo_gasto === 'compartido' || item.es_compartido) {
      totalShared += amount;
      if (item.pagado_por === 'person_a') {
        paidA += amount;
      } else if (item.pagado_por === 'person_b') {
        paidB += amount;
      }
    }
  });

  const dueA = totalShared * ratioA;
  const dueB = totalShared * ratioB;

  // Compensation balance: Positive means Person B owes Person A
  const balance = paidA - dueA; 

  let debtorName = 'Empatados';
  let settlementAmount = 0;

  if (balance > 0) {
    debtorName = 'Ella';
    settlementAmount = balance;
  } else if (balance < 0) {
    debtorName = 'Tú';
    settlementAmount = Math.abs(balance);
  }

  return {
    ratioA,
    ratioB,
    percentA: ratioA * 100,
    percentB: ratioB * 100,
    totalShared,
    dueA,
    dueB,
    paidA,
    paidB,
    balance,
    debtorName,
    settlementAmount
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
