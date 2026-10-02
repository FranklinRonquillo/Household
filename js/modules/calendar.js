/* ==========================================================================
   HOUSEHOLD - Calendar & Debts Module Renderer
   ========================================================================== */

function renderCalendarModule(appState) {
  const { calendarPayments, debts } = appState;

  return `
    <div class="fade-in">
      <div class="glass-card-header" style="margin-bottom: 1.5rem;">
        <div>
          <h2>📆 Calendario Financiero y Deudas</h2>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Fechas clave de pago mensual y compromisos pendientes</p>
        </div>
        <button class="btn btn-primary" onclick="openDebtModal()">+ Registrar Deuda / Cuota</button>
      </div>

      <div class="dashboard-sections-grid">
        <!-- Monthly Payment Dates Timeline -->
        <div class="glass-card">
          <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">🗓️ Fechas de Pago del Mes</h3>
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${calendarPayments.map(pay => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: rgba(255,255,255,0.02); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <div style="width: 42px; height: 42px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem;">
                    Día ${pay.day}
                  </div>
                  <div>
                    <div style="font-weight: 600; font-size: 0.95rem;">${pay.title}</div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Monto estimado: ${formatCurrency(pay.amount)}</span>
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
          <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">🧾 Deudas y Cuotas Pendientes</h3>
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${debts.map(debt => `
              <div style="padding: 0.85rem; background: rgba(255,255,255,0.02); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
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
    </div>
  `;
}

function addDebtPrompt() {
  openDebtModal();
}
