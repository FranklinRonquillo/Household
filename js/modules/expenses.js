/* ==========================================================================
   HOUSEHOLD - Expenses & Debts Module Renderer
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
      <div class="glass-card-header" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div style="flex: 1; min-width: 220px;">
          <h2 style="font-size: 1.35rem; word-break: break-word;">💸 Control de Gastos y Deudas</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Registren sus compras, verifiquen límites y controlen pagos pendientes</p>
        </div>
        <button class="btn btn-primary" onclick="openExpenseModal()">+ Registrar Gasto</button>
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
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: var(--bg-glass); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
                <div style="display: flex; align-items: center; gap: 0.85rem;">
                  <div style="width: 40px; height: 40px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; color: #ffffff;">
                    Día ${pay.day}
                  </div>
                  <div>
                    <div style="font-weight: 600; font-size: 0.95rem;">${pay.title}</div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Monto est: ${formatCurrency(pay.amount)}</span>
                  </div>
                </div>
                <div>
                  ${pay.status === 'paid' ? '<span class="badge badge-success">Pagado 🟢</span>' : '<span class="badge badge-warning">Pendiente 🟡</span>'}
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
              <div style="padding: 0.85rem; background: var(--bg-glass); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.3rem;">
                  <span style="font-weight: 600; font-size: 0.9rem;">${debt.concept}</span>
                  <span style="font-weight: 700; color: var(--expense-color);">${formatCurrency(debt.amount)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted);">
                  <span>Vence: ${debt.dueDate}</span>
                  <span class="badge badge-danger">${debt.type}</span>
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
