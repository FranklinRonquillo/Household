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
