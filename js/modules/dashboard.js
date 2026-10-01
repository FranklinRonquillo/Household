/* ==========================================================================
   HOUSEHOLD - Dashboard Module Renderer
   ========================================================================== */

function renderDashboardModule(appState) {
  const { userA, userB, expenses, savingsGoals, quote, savingsStreak, couplePoints } = appState;
  
  // Math calculations
  const split = calculateProportionalSplit(userA.income, userB.income, expenses);
  const totalIncome = userA.income + userB.income;
  
  // Total Expenses
  const totalExpenses = expenses.reduce((sum, item) => sum + item.monto, 0);
  
  // Total Savings this month
  const mainGoal = savingsGoals[0] || { current: 0, target: 10000000 };
  const monthlySavings = 400000; // Simulated monthly savings contribution
  
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
          <span style="font-size: 0.75rem; color: var(--text-muted);">Restante seguro para gastar</span>
        </div>

        <div class="glass-card stat-widget">
          <span class="stat-label">📥 Ingresos Totales</span>
          <span class="stat-value income">${formatCurrency(totalIncome)}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Fran: ${formatCurrency(userA.income)} · Yox: ${formatCurrency(userB.income)}</span>
        </div>

        <div class="glass-card stat-widget">
          <span class="stat-label">🏠 Gastos Registrados</span>
          <span class="stat-value expense">${formatCurrency(totalExpenses)}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${formatPercent(spendPercent)} del ingreso total</span>
        </div>

        <div class="glass-card stat-widget">
          <span class="stat-label">💵 Ahorro acumulado</span>
          <span class="stat-value savings">${formatCurrency(mainGoal.current)}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Meta: ${formatCurrency(mainGoal.target)}</span>
        </div>
      </div>

      <!-- Proportional Split & Recent Expenses Grid -->
      <div class="dashboard-sections-grid">
        <!-- Left: Proportional Split Widget -->
        <div class="glass-card">
          <div class="glass-card-header">
            <span class="glass-card-title">⚖️ Aportes Proporcionales (Según Sueldos)</span>
            <span class="badge badge-purple">Automatizado</span>
          </div>

          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1rem;">
            Los gastos compartidos se dividen según los ingresos reales de cada uno este mes:
          </p>

          <div class="split-users-comparison">
            <div class="split-user-box">
              <div class="split-user-name">👨🏻 Fran</div>
              <div class="split-user-income">${formatCurrency(userA.income)}</div>
              <div class="split-user-share">Aporta el ${formatPercent(split.percentA)}</div>
            </div>
            <div style="align-self: center; font-size: 1.2rem; color: var(--text-muted);">vs</div>
            <div class="split-user-box">
              <div class="split-user-name">👩🏻 Yox</div>
              <div class="split-user-income">${formatCurrency(userB.income)}</div>
              <div class="split-user-share">Aporta el ${formatPercent(split.percentB)}</div>
            </div>
          </div>

          <div style="background: var(--bg-glass); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); margin-top: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
              <span>Total Gastos Compartidos:</span>
              <strong style="color: var(--text-main);">${formatCurrency(split.totalShared)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-muted);">
              <span>Fran ha pagado: ${formatCurrency(split.paidA)} (le corresponde ${formatCurrency(split.dueA)})</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.85rem; color: var(--text-muted);">
              <span>Yox ha pagado: ${formatCurrency(split.paidB)} (le corresponde ${formatCurrency(split.dueB)})</span>
            </div>
            <hr style="border-color: var(--border-glass); margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--accent-gold); font-weight: 700; font-size: 0.95rem;">
              <span>🤝 Para quedar iguales:</span>
              <span>${split.debtorName === 'Empatados' ? '¡Están totalmente al día!' : `${split.debtorName === 'Tú' ? 'Fran' : 'Yox'} debe aportar ${formatCurrency(split.settlementAmount)}`}</span>
            </div>
          </div>
        </div>

        <!-- Right: Recent Expenses Quick List -->
        <div class="glass-card">
          <div class="glass-card-header">
            <span class="glass-card-title">💸 Últimos Gastos</span>
            <button class="btn btn-secondary btn-sm" onclick="appState.activeTab = 'gastos'; state.notify();">Ver todos</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${expenses.slice(0, 5).map(item => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.8rem; background: var(--bg-glass); border-radius: var(--radius-sm); border: 1px solid var(--border-glass);">
                <div>
                  <div style="font-weight: 600; font-size: 0.875rem;">${item.descripcion}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${item.categoria} · Pagó: ${item.pagado_por === 'person_a' ? 'Fran' : 'Yox'}</div>
                </div>
                <div style="font-weight: 700; color: var(--expense-color); font-size: 0.9rem;">
                  -${formatCurrency(item.monto)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
