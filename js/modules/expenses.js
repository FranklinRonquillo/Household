/* ==========================================================================
   HOUSEHOLD - Expenses, Weekly Summary & Debts Module Renderer
   ========================================================================== */

function renderExpensesModule(appState) {
  const { expenses, categoryBudgets, calendarPayments, debts } = appState;

  // Group expenses by category
  const categoryTotals = {};
  expenses.forEach(item => {
    categoryTotals[item.categoria] = (categoryTotals[item.categoria] || 0) + item.monto;
  });

  return `
    <div class="fade-in">
      <div class="glass-card-header" style="margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.35rem; word-break: break-word;">💸 Control de Gastos y Deudas</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Registren sus compras, verifiquen límites y controlen pagos pendientes</p>
        </div>
      </div>

      <!-- Resumen Semanal de Nuestra Semana (Lunes a Domingo) -->
      <div class="glass-card" style="margin-bottom: 2rem; background: linear-gradient(135deg, var(--bg-card), var(--bg-surface)); border: 1px solid var(--border-accent);">
        <div class="glass-card-header" style="margin-bottom: 0.5rem;">
          <span class="glass-card-title">🌙 Resumen de Nuestra Semana ❤️ (Lunes a Domingo)</span>
          <span class="badge badge-success">📈 +12% ahorro vs semana pasada</span>
        </div>
        <p style="font-size: 0.825rem; color: var(--text-muted); margin-bottom: 1rem;">
          Corte semanal independiente del mes para evaluar el ritmo de gasto de la semana actual:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.85rem; text-align: center;">
          <div style="background: var(--bg-glass); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">💰 Ingresos Semana</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--income-color);">${formatCurrency(500000)}</div>
          </div>

          <div style="background: var(--bg-glass); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">💸 Gastos Semana</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--expense-color);">${formatCurrency(280000)}</div>
          </div>

          <div style="background: var(--bg-glass); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">🐷 Ahorro Semanal</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--savings-color);">${formatCurrency(150000)}</div>
          </div>

          <div style="background: var(--bg-glass); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">🛍️ Compras Gustos</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary);">${formatCurrency(70000)}</div>
          </div>
        </div>
      </div>

      <!-- Categories & Budget Semaphores -->
      <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">📊 Presupuesto por Categoría</h3>
      <div class="dashboard-grid" style="margin-bottom: 2rem;">
        ${Object.keys(categoryBudgets).map(catName => {
          const spent = categoryTotals[catName] || 0;
          const limit = categoryBudgets[catName];
          const sem = getBudgetSemaphor(spent, limit);
          return `
            <div class="glass-card">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.5rem;">
                <span style="font-weight: 600; font-size: 0.95rem; color: var(--text-main);">${catName}</span>
                <span class="badge ${sem.class}">${sem.label}</span>
              </div>
              <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; word-break: break-all;">
                ${formatCurrency(spent)} <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 400;">/ ${formatCurrency(limit)}</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill ${sem.status}" style="width: ${Math.min(100, sem.percent)}%;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Financial Calendar & Debts Section -->
      <div class="dashboard-sections-grid" style="margin-bottom: 2rem;">
        <!-- Monthly Payment Dates Timeline -->
        <div class="glass-card">
          <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">🗓️ Fechas Clave de Pago del Mes</h3>
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${calendarPayments.map(pay => `
              <div class="unified-list-card">
                <div class="unified-card-badge">
                  <span class="num">${String(pay.day).padStart(2, '0')}</span>
                  <span class="label">DÍA</span>
                </div>
                <div class="unified-card-body">
                  <div class="unified-card-top">
                    <span class="title">${pay.title}</span>
                    ${pay.status === 'paid' ? '<span class="badge badge-success">Pagado 🟢</span>' : '<span class="badge badge-warning">Pendiente 🟡</span>'}
                  </div>
                  <div class="unified-card-bottom">
                    <span class="subtext">Fecha recurrente del mes</span>
                    <span class="amount" style="color: var(--text-main);">${formatCurrency(pay.amount)}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Pending Debts & Installments -->
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.1rem;">🧾 Deudas Pendientes</h3>
            <button class="btn btn-secondary btn-sm" onclick="addDebtPrompt()">+ Agregar</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${debts.map(debt => `
              <div class="unified-list-card">
                <div class="unified-card-badge debt">
                  <span class="num">🧾</span>
                </div>
                <div class="unified-card-body">
                  <div class="unified-card-top">
                    <span class="title">${debt.concept}</span>
                    <span class="badge badge-danger">${debt.type}</span>
                  </div>
                  <div class="unified-card-bottom">
                    <span class="subtext">Vence: ${debt.dueDate}</span>
                    <span class="amount" style="color: var(--expense-color);">${formatCurrency(debt.amount)}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Expense History Table -->
      <div class="glass-card">
        <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">🧾 Historial de Gastos del Mes</h3>
        <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
          <table style="width: 100%; min-width: 500px; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-glass); color: var(--text-muted);">
                <th style="padding: 0.75rem;">Fecha</th>
                <th style="padding: 0.75rem;">Concepto</th>
                <th style="padding: 0.75rem;">Categoría</th>
                <th style="padding: 0.75rem;">¿Quién pagó?</th>
                <th style="padding: 0.75rem;">Tipo</th>
                <th style="padding: 0.75rem; text-align: right;">Monto</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map(item => `
                <tr style="border-bottom: 1px solid var(--border-glass);">
                  <td style="padding: 0.75rem; color: var(--text-muted); text-overflow: ellipsis;">${item.fecha}</td>
                  <td style="padding: 0.75rem; font-weight: 600;">${item.descripcion}</td>
                  <td style="padding: 0.75rem;"><span class="badge badge-purple">${item.categoria}</span></td>
                  <td style="padding: 0.75rem;">${item.pagado_por === 'person_a' ? '👨🏻 Fran' : '👩🏻 Yox'}</td>
                  <td style="padding: 0.75rem; text-align: center;">
                    ${item.tipo_gasto === 'compartido' ? '<span class="badge badge-success">Compartido</span>' : '<span class="badge badge-warning">Personal</span>'}
                  </td>
                  <td style="padding: 0.75rem; text-align: right; font-weight: 700; color: var(--expense-color);">
                    -${formatCurrency(item.monto)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function openExpenseModal() {
  document.getElementById('modal-expense').classList.add('active');
}
function closeExpenseModal() {
  document.getElementById('modal-expense').classList.remove('active');
}
