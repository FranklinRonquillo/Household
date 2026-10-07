/* ==========================================================================
   HOUSEHOLD - Dashboard Module Renderer ("Nuestra Casa")
   ========================================================================== */

function renderDashboardModule(appState) {
  const { userA, userB, expenses, savingsGoals, quote, savingsStreak, couplePoints } = appState;
  
  // Math calculations
  const split = calculateProportionalSplit(userA.income, userB.income, expenses);
  const totalIncome = userA.income + userB.income;
  
  // Total Expenses
  const totalExpenses = expenses.reduce((sum, item) => sum + item.monto, 0);
  
  // Personal Expenses Breakdown
  const personalA = expenses.filter(i => i.tipo_gasto === 'personal_a').reduce((sum, i) => sum + i.monto, 0);
  const personalB = expenses.filter(i => i.tipo_gasto === 'personal_b').reduce((sum, i) => sum + i.monto, 0);

  // Free Individual Disposable Money
  const freeMoneyA = Math.max(0, userA.income - split.dueA - personalA);
  const freeMoneyB = Math.max(0, userB.income - split.dueB - personalB);

  // Total Savings this month
  const mainGoal = savingsGoals[0] || { current: 0, target: 10000000 };
  const monthlySavings = 400000;
  
  // Available Money = Total Income - Total Expenses - Monthly Savings
  const availableMoney = Math.max(0, totalIncome - totalExpenses - monthlySavings);
  
  // Spend Percentage
  const spendPercent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  
  return `
    <div class="fade-in">
      <!-- Top Quote & Motivation Banner -->
      <div class="glass-card split-card" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="badge badge-purple">✨ Frase de Hoy</span>
          <h3 style="margin-top: 0.5rem; font-size: 1.15rem; color: var(--text-main);">"${quote}"</h3>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center;">
          <div style="text-align: right;">
            <div style="font-size: 0.8rem; color: var(--text-muted);">🔥 Racha de Ahorro</div>
            <div style="font-weight: 700; color: var(--accent-gold); font-size: 1.1rem;">${savingsStreak} Días</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.8rem; color: var(--text-muted);">❤️ Puntos Pareja</div>
            <div style="font-weight: 700; color: var(--primary); font-size: 1.1rem;">${couplePoints} pts</div>
          </div>
        </div>
      </div>

      <!-- Main Financial Summary Grid -->
      <div class="dashboard-grid">
        <div class="glass-card stat-widget">
          <span class="stat-label">💰 Disponible este mes</span>
          <span class="stat-value primary">${formatCurrency(availableMoney)}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Restante seguro para el hogar</span>
        </div>

        <div class="glass-card stat-widget" style="cursor: pointer; position: relative;" onclick="openIncomeModal()" title="Haz clic para modificar los ingresos de Fran y Yox">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="stat-label">📥 Ingresos Totales</span>
            <button class="btn btn-secondary btn-sm" style="padding: 2px 7px; font-size: 0.7rem; gap: 3px;" onclick="event.stopPropagation(); openIncomeModal()">
              ✏️ Modificar
            </button>
          </div>
          <span class="stat-value income">${formatCurrency(totalIncome)}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Fran: ${formatCurrency(userA.income)} · Yox: ${formatCurrency(userB.income)}</span>
        </div>

        <div class="glass-card stat-widget">
          <span class="stat-label">🏠 Gastos Registrados</span>
          <span class="stat-value expense">${formatCurrency(totalExpenses)}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${formatPercent(spendPercent)} del ingreso consumido</span>
        </div>

        <div class="glass-card stat-widget">
          <span class="stat-label">💵 Ahorro acumulado</span>
          <span class="stat-value savings">${formatCurrency(mainGoal.current)}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Meta Casa: ${formatCurrency(mainGoal.target)}</span>
        </div>
      </div>

      <!-- Individual Personal Money Separation Widget -->
      <div class="glass-card" style="margin-bottom: 1.5rem; background: linear-gradient(135deg, var(--bg-card), var(--bg-surface));">
        <div class="glass-card-header" style="margin-bottom: 0.5rem;">
          <span class="glass-card-title">💰 Dinero Libre Individual (Post-Obligaciones)</span>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <span class="badge badge-success">Sin Mezclar</span>
            <button class="btn btn-secondary btn-sm" onclick="openIncomeModal()" style="font-size: 0.7rem; padding: 0.2rem 0.55rem;">
              ✏️ Sueldos
            </button>
          </div>
        </div>
        <p style="font-size: 0.825rem; color: var(--text-muted); margin-bottom: 0.85rem;">
          Dinero personal libre de cada uno tras cubrir la cuota proporcional de la casa:
        </p>
        <div style="display: flex; justify-content: space-around; gap: 1rem; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 140px; background: var(--bg-glass); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); text-align: center;">
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">👨🏻 Dinero Libre de Fran</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--primary); margin-top: 0.2rem;">${formatCurrency(freeMoneyA)}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">Sus gustos y hobbies</div>
          </div>
          <div style="flex: 1; min-width: 140px; background: var(--bg-glass); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); text-align: center;">
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">👩🏻 Dinero Libre de Yox</div>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--secondary); margin-top: 0.2rem;">${formatCurrency(freeMoneyB)}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">Sus compras personales</div>
          </div>
        </div>
      </div>

      <!-- Proportional Split & Monthly Comparison Grid -->
      <div class="dashboard-sections-grid" style="margin-bottom: 1.5rem;">
        <!-- Left: Proportional Split Widget -->
        <div class="glass-card">
          <div class="glass-card-header">
            <span class="glass-card-title">⚖️ Aportes Proporcionales (Según Sueldos)</span>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              <span class="badge badge-purple">Automatizado</span>
              <button class="btn btn-secondary btn-sm" onclick="openIncomeModal()" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;">
                💰 Ajustar Sueldos
              </button>
            </div>
          </div>

          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem;">
            Los gastos compartidos se dividen según el % de salario de cada uno (Fran ${formatPercent(split.percentA)} / Yox ${formatPercent(split.percentB)}):
          </p>

          <div class="split-users-comparison">
            <div class="split-user-box">
              <div class="split-user-name">👨🏻 Fran</div>
              <div class="split-user-income">${formatCurrency(userA.income)}</div>
              <div class="split-user-share">Cuota (${formatPercent(split.percentA)}): ${formatCurrency(split.dueA)}</div>
            </div>
            <div style="align-self: center; font-size: 1.2rem; color: var(--text-muted);">vs</div>
            <div class="split-user-box">
              <div class="split-user-name">👩🏻 Yox</div>
              <div class="split-user-income">${formatCurrency(userB.income)}</div>
              <div class="split-user-share">Cuota (${formatPercent(split.percentB)}): ${formatCurrency(split.dueB)}</div>
            </div>
          </div>

          <div style="background: var(--bg-glass); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
              <span>Total Gastos Compartidos:</span>
              <strong style="color: var(--text-main);">${formatCurrency(split.totalShared)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-size: 0.85rem; color: var(--text-muted);">
              <span>Fran ha pagado del bolsillo: ${formatCurrency(split.paidA)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.85rem; color: var(--text-muted);">
              <span>Yox ha pagado del bolsillo: ${formatCurrency(split.paidB)}</span>
            </div>
            <hr style="border-color: var(--border-glass); margin-bottom: 0.75rem;">
            <div style="padding: 0.75rem; background: rgba(245, 158, 11, 0.1); border-radius: var(--radius-sm); border: 1px solid var(--accent-gold);">
              <div style="font-size: 0.8rem; color: var(--accent-gold); font-weight: 700; margin-bottom: 0.2rem;">🤝 PARA QUEDAR A PAR (COMPENSACIÓN):</div>
              <div style="font-size: 1.05rem; font-weight: 800; color: var(--text-main);">
                ${split.settlementText}
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Monthly Historical Comparison -->
        <div class="glass-card">
          <div class="glass-card-header">
            <span class="glass-card-title">📈 Comparativa de Meses</span>
            <span class="badge badge-success">📉 -12% este mes</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="padding: 0.75rem; background: var(--bg-glass); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600;">
                <span>Septiembre 2026 (Actual)</span>
                <span style="color: var(--expense-color);">${formatCurrency(totalExpenses)}</span>
              </div>
              <div class="progress-bar-container" style="margin-top: 0.4rem;">
                <div class="progress-bar-fill warning" style="width: 65%;"></div>
              </div>
            </div>

            <div style="padding: 0.75rem; background: var(--bg-glass); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600;">
                <span>Agosto 2026</span>
                <span style="color: var(--text-muted);">${formatCurrency(2470000)}</span>
              </div>
              <div class="progress-bar-container" style="margin-top: 0.4rem;">
                <div class="progress-bar-fill danger" style="width: 78%;"></div>
              </div>
            </div>

            <div style="padding: 0.75rem; background: var(--bg-glass); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600;">
                <span>Julio 2026</span>
                <span style="color: var(--text-muted);">${formatCurrency(2650000)}</span>
              </div>
              <div class="progress-bar-container" style="margin-top: 0.4rem;">
                <div class="progress-bar-fill danger" style="width: 84%;"></div>
              </div>
            </div>

            <div style="font-size: 0.8rem; color: var(--income-color); font-weight: 600; text-align: center; margin-top: 0.25rem;">
              📉 ¡Este mes gastaron $250.000 menos que el anterior! 🎉
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
