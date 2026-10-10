/* ==========================================================================
   HOUSEHOLD - Calendar & Debts Module Renderer
   ========================================================================== */

function renderCalendarModule(appState) {
  const { calendarPayments = [], debts = [] } = appState;

  return `
    <div class="fade-in">
      <div class="glass-card-header" style="margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h2>📆 Calendario Financiero y Deudas</h2>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Fechas clave de pago mensual y compromisos pendientes del hogar</p>
        </div>
        <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" onclick="openCalendarPaymentModal()">+ Recordatorio de Pago</button>
          <button class="btn btn-primary btn-sm" onclick="openDebtModal()">+ Registrar Deuda / Cuota</button>
        </div>
      </div>

      <div class="dashboard-sections-grid">
        <!-- Monthly Payment Dates Timeline -->
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.1rem; margin: 0;">🗓️ Fechas Clave de Pago del Mes</h3>
            <button class="btn btn-secondary btn-sm" onclick="openCalendarPaymentModal()" style="font-size: 0.75rem; padding: 3px 8px;">+ Nuevo</button>
          </div>
          ${calendarPayments.length === 0 ? `
            <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
              <p style="font-size: 0.85rem; margin-bottom: 0.75rem;">No hay fechas de pago programadas para el mes.</p>
              <button class="btn btn-primary btn-sm" onclick="openCalendarPaymentModal()">+ Agregar Recordatorio</button>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              ${calendarPayments.map(pay => {
                const isPaid = pay.status === 'paid' || pay.status === 'pagado';
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: rgba(255,255,255,0.02); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                      <div style="width: 42px; height: 42px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; color: #fff; flex-shrink: 0;">
                        Día ${pay.day}
                      </div>
                      <div>
                        <div style="font-weight: 600; font-size: 0.95rem; text-decoration: ${isPaid ? 'line-through' : 'none'}; opacity: ${isPaid ? '0.75' : '1'};">${pay.title}</div>
                        <span style="font-size: 0.75rem; color: var(--text-muted);">Monto estimado: ${formatCurrency(pay.amount)}</span>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span 
                        class="badge ${isPaid ? 'badge-success' : 'badge-warning'}" 
                        onclick="toggleCalendarPaymentStatus('${pay.id}')"
                        title="Clic para cambiar estado"
                        style="cursor: pointer; user-select: none;"
                      >
                        ${isPaid ? 'Pagado 🟢' : 'Pendiente 🟡'}
                      </span>
                      <button 
                        class="btn btn-secondary btn-sm" 
                        onclick="deleteCalendarPayment('${pay.id}')" 
                        title="Eliminar recordatorio"
                        style="padding: 3px 6px; font-size: 0.75rem; color: var(--expense-color);"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Pending Debts & Installments -->
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.1rem; margin: 0;">🧾 Deudas y Cuotas Pendientes</h3>
            <button class="btn btn-secondary btn-sm" onclick="openDebtModal()" style="font-size: 0.75rem; padding: 3px 8px;">+ Nueva</button>
          </div>
          ${debts.length === 0 ? `
            <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
              <p style="font-size: 0.85rem; margin-bottom: 0.75rem;">¡No hay deudas ni cuotas pendientes registradas! 🎉</p>
              <button class="btn btn-primary btn-sm" onclick="openDebtModal()">+ Registrar Deuda / Cuota</button>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              ${debts.map(debt => {
                const isPaid = debt.status === 'pagado' || debt.status === 'paid';
                return `
                  <div style="padding: 0.85rem; background: rgba(255,255,255,0.02); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.3rem;">
                      <span style="font-weight: 600; font-size: 0.9rem; text-decoration: ${isPaid ? 'line-through' : 'none'}; opacity: ${isPaid ? '0.75' : '1'};">${debt.concept}</span>
                      <span style="font-weight: 700; color: ${isPaid ? 'var(--income-color)' : 'var(--expense-color)'};">${formatCurrency(debt.amount)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.4rem;">
                      <span>Vence: ${debt.dueDate || 'Sin fecha'}</span>
                      <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <span 
                          class="badge ${isPaid ? 'badge-success' : 'badge-danger'}"
                          onclick="toggleDebtStatus(${debt.id})"
                          title="Clic para alternar entre Pendiente y Pagado"
                          style="cursor: pointer; user-select: none;"
                        >
                          ${isPaid ? 'Pagado 🟢' : `${debt.type} 🟡`}
                        </span>
                        <button class="btn btn-secondary btn-sm" onclick="openDebtModal(${debt.id})" title="Editar deuda" style="padding: 3px 6px; font-size: 0.75rem;">✏️</button>
                        <button class="btn btn-secondary btn-sm" onclick="deleteDebt(${debt.id})" title="Eliminar deuda" style="padding: 3px 6px; font-size: 0.75rem; color: var(--expense-color);">🗑️</button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function addDebtPrompt() {
  openDebtModal();
}
