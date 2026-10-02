/* ==========================================================================
   HOUSEHOLD - Financial & Proportional Math Calculations
   ========================================================================== */

/**
 * Calculates the exact proportional expense split based on monthly incomes.
 * Rule: Expenses are proportional to monthly income.
 * If Fran earns 60% and Yox earns 40%, shared expenses of $1,000,000 mean:
 * - Fran's fair share: $600,000
 * - Yox's fair share: $400,000
 * Settlement calculates who paid more out of pocket and who must transfer how much to whom.
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

  // Difference: paidA - dueA
  // Positive: Person A paid more than his share -> Person B must transfer to Person A
  // Negative: Person A paid less than his share -> Person A must transfer to Person B
  const diffA = paidA - dueA;

  let sender = null;
  let receiver = null;
  let settlementAmount = Math.abs(Math.round(diffA));
  let settlementText = '';

  if (settlementAmount < 100) {
    settlementText = '¡Están a mano! Nadie le debe a nadie 🎉';
  } else if (diffA > 0) {
    sender = nameB; // Yox must pay
    receiver = nameA; // Fran receives
    settlementText = `👩🏻 ${nameB} debe darle ${formatCurrency(settlementAmount)} a 👨🏻 ${nameA}`;
  } else {
    sender = nameA; // Fran must pay
    receiver = nameB; // Yox receives
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
