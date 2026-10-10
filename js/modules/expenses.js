/* ==========================================================================
   HOUSEHOLD - Expenses, Weekly Summary & Debts Module Renderer
   Dynamic Month Filtering & Real Weekly Math (Zero Hardcoded Figures)
   ========================================================================== */

function renderExpensesModule(appState) {
  const { expenses, categoryBudgets, calendarPayments, debts, userA, userB } = appState;

  // Month determination
  const currentRealKey = (typeof getCurrentMonthKey === 'function') ? getCurrentMonthKey() : '2026-10';
  const selectedMonthKey = appState.selectedMonth || currentRealKey;
  const monthLabel = (typeof getMonthLabel === 'function') ? getMonthLabel(selectedMonthKey) : 'Octubre 2026';
  const isViewingCurrentMonth = selectedMonthKey === currentRealKey;

  // Filter expenses strictly by selected month
  const monthExpenses = (typeof filterExpensesByMonth === 'function')
    ? filterExpensesByMonth(expenses, selectedMonthKey)
    : (expenses || []);

  const totalMonthExpenses = monthExpenses.reduce((sum, item) => sum + (Number(item.monto) || 0), 0);

  // Group expenses by category for the selected month
  const categoryTotals = {};
  monthExpenses.forEach(item => {
    categoryTotals[item.categoria] = (categoryTotals[item.categoria] || 0) + (Number(item.monto) || 0);
  });

  // Calculate dynamic weekly summary for current calendar week (Monday to Sunday)
  const weekSummary = (typeof calculateThisWeekSummary === 'function')
    ? calculateThisWeekSummary(expenses, userA.income, userB.income)
    : { weekExpenses: 0, weeklyEstimatedIncome: 0, weeklySavings: 0, weeklyPersonal: 0, expenseCount: 0, dateRangeLabel: '' };

  return `
    <div class="fade-in">
      <div class="glass-card-header" style="margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h2 style="font-size: 1.35rem; word-break: break-word;">💸 Control de Gastos y Deudas</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem;">
            Consultando: <strong style="color: var(--primary);">${monthLabel}</strong> ${isViewingCurrentMonth ? '(Mes actual)' : '(Histórico)'}
          </p>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm" onclick="navigateMonth(-1)" title="Ver mes anterior">◀ Mes Ant.</button>
          ${!isViewingCurrentMonth ? '<button class="btn btn-primary btn-sm" onclick="goToCurrentMonth()">⚡ Mes Actual</button>' : ''}
          <button class="btn btn-secondary btn-sm" onclick="navigateMonth(1)" title="Ver mes siguiente">Mes Sig. ▶</button>
          <button class="btn btn-primary btn-sm" onclick="openExpenseModal()">+ Registrar Gasto</button>
        </div>
      </div>

      <!-- Resumen Semanal Dinámico (Lunes a Domingo) -->
      <div class="glass-card" style="margin-bottom: 2rem; background: linear-gradient(135deg, var(--bg-card), var(--bg-surface)); border: 1px solid var(--border-accent);">
        <div class="glass-card-header" style="margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
          <span class="glass-card-title">🌙 Resumen de Nuestra Semana Actual ❤️</span>
          <span class="badge ${weekSummary.weekExpenses > 0 ? 'badge-purple' : 'badge-success'}">
            ${weekSummary.dateRangeLabel || 'Esta semana'}
          </span>
        </div>
        <p style="font-size: 0.825rem; color: var(--text-muted); margin-bottom: 1rem;">
          Corte semanal en vivo de lunes a domingo para seguir el ritmo de gasto de la semana en curso:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.85rem; text-align: center;">
          <div style="background: var(--bg-glass); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">💰 Ingreso Estimado Sem.</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--income-color);">${formatCurrency(weekSummary.weeklyEstimatedIncome)}</div>
          </div>

          <div style="background: var(--bg-glass); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">💸 Gastos Esta Semana</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: ${weekSummary.weekExpenses > 0 ? 'var(--expense-color)' : 'var(--text-muted)'};">${formatCurrency(weekSummary.weekExpenses)}</div>
          </div>

          <div style="background: var(--bg-glass); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">🐷 Saldo / Ahorro Sem.</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--savings-color);">${formatCurrency(weekSummary.weeklySavings)}</div>
          </div>

          <div style="background: var(--bg-glass); padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
            <div style="font-size: 0.75rem; color: var(--text-muted);">🛍️ Compras Gustos</div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary);">${formatCurrency(weekSummary.weeklyPersonal)}</div>
          </div>
        </div>
      </div>

      <!-- Categories & Budget Semaphores for the Selected Month -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
          <h3 style="font-size: 1.1rem; margin: 0;">📊 Presupuesto por Categoría (${monthLabel})</h3>
          <button 
            type="button" 
            class="btn btn-secondary btn-sm" 
            onclick="openCategoryBudgetsModal()" 
            style="font-size: 0.72rem; padding: 3px 9px; gap: 4px;"
            title="Ajustar límites de gasto por categoría o agregar nuevas categorías"
          >
            ✏️ Modificar Presupuestos
          </button>
        </div>
        <span style="font-size: 0.8rem; color: var(--text-muted);">
          Total gastado: <strong style="color: var(--expense-color);">${formatCurrency(totalMonthExpenses)}</strong>
        </span>
      </div>

      <div class="dashboard-grid" style="margin-bottom: 2rem;">
        ${Object.keys(categoryBudgets).map(catName => {
          const spent = categoryTotals[catName] || 0;
          const limit = categoryBudgets[catName];
          const sem = getBudgetSemaphor(spent, limit);
          return `
            <div class="glass-card" style="position: relative;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                  <span style="font-weight: 600; font-size: 0.95rem; color: var(--text-main);">${catName}</span>
                  <button 
                    type="button" 
                    onclick="openCategoryBudgetsModal('${catName}')" 
                    title="Editar presupuesto de ${catName}" 
                    style="background: transparent; border: none; cursor: pointer; font-size: 0.75rem; opacity: 0.7; padding: 0 3px; transition: opacity 0.2s;"
                    onmouseover="this.style.opacity='1'" 
                    onmouseout="this.style.opacity='0.7'"
                  >
                    ✏️
                  </button>
                </div>
                <span class="badge ${sem.class}">${sem.label}</span>
              </div>
              <div 
                style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; word-break: break-all; cursor: pointer;"
                onclick="openCategoryBudgetsModal('${catName}')"
                title="Haz clic para modificar el presupuesto de ${catName}"
              >
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
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <h3 style="font-size: 1.1rem; margin: 0;">🗓️ Fechas Clave de Pago del Mes</h3>
            <button class="btn btn-secondary btn-sm" onclick="openCalendarPaymentModal()">+ Recordatorio</button>
          </div>
          ${(!calendarPayments || calendarPayments.length === 0) ? `
            <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
              <div style="font-size: 2rem; margin-bottom: 0.4rem;">🗓️</div>
              <p style="font-size: 0.85rem;">No hay recordatorios de pago recurrentes para este mes.</p>
              <button class="btn btn-primary btn-sm" onclick="openCalendarPaymentModal()" style="margin-top: 0.75rem;">+ Agregar Primer Recordatorio</button>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              ${calendarPayments.map(pay => `
                <div class="unified-list-card">
                  <div class="unified-card-badge" onclick="toggleCalendarPaymentStatus('${pay.id}')" style="cursor: pointer;" title="Clic para alternar Pagado / Pendiente">
                    <span class="num">${String(pay.day).padStart(2, '0')}</span>
                    <span class="label">${(pay.status === 'paid' || pay.status === 'pagado') ? 'LISTO' : 'DÍA'}</span>
                  </div>
                  <div class="unified-card-body" style="flex: 1;">
                    <div class="unified-card-top" style="display: flex; justify-content: space-between; align-items: center;">
                      <span class="title" style="${(pay.status === 'paid' || pay.status === 'pagado') ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${pay.title}</span>
                      <div style="display: flex; align-items: center; gap: 0.35rem;">
                        <span class="badge ${(pay.status === 'paid' || pay.status === 'pagado') ? 'badge-success' : 'badge-warning'}" onclick="toggleCalendarPaymentStatus('${pay.id}')" style="cursor: pointer;" title="Cambiar estado">
                          ${(pay.status === 'paid' || pay.status === 'pagado') ? 'Pagado 🟢' : 'Pendiente 🟡'}
                        </span>
                        <button class="btn btn-secondary btn-sm" onclick="deleteCalendarPayment('${pay.id}')" title="Eliminar recordatorio" style="padding: 2px 6px; font-size: 0.7rem; color: var(--expense-color);">
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div class="unified-card-bottom" style="display: flex; justify-content: space-between; align-items: center;">
                      <span class="subtext">Día ${pay.day} de cada mes</span>
                      <span class="amount" style="color: ${pay.status === 'paid' ? 'var(--income-color)' : 'var(--text-main)'}; font-weight: 700;">
                        ${formatCurrency(pay.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Pending Debts & Installments -->
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <h3 style="font-size: 1.1rem; margin: 0;">🧾 Deudas y Compromisos</h3>
            <button class="btn btn-secondary btn-sm" onclick="openDebtModal()">+ Agregar Deuda</button>
          </div>
          ${(!debts || debts.length === 0) ? `
            <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
              <div style="font-size: 2rem; margin-bottom: 0.4rem;">🎉</div>
              <p style="font-weight: 600; color: var(--income-color); font-size: 0.9rem;">¡Están al día!</p>
              <p style="font-size: 0.8rem; margin-top: 0.2rem;">Sin deudas o cuotas pendientes registradas.</p>
              <button class="btn btn-secondary btn-sm" onclick="openDebtModal()" style="margin-top: 0.75rem;">+ Registrar Compromiso</button>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 0.85rem;">
              ${debts.map(debt => `
                <div class="unified-list-card">
                  <div class="unified-card-badge debt" onclick="toggleDebtStatus(${debt.id})" style="cursor: pointer;" title="Clic para alternar Pagado / Pendiente">
                    <span class="num">${debt.status === 'pagado' ? '✅' : '🧾'}</span>
                  </div>
                  <div class="unified-card-body" style="flex: 1;">
                    <div class="unified-card-top" style="display: flex; justify-content: space-between; align-items: center;">
                      <span class="title" style="${debt.status === 'pagado' ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${debt.concept}</span>
                      <div style="display: flex; align-items: center; gap: 0.35rem;">
                        <span class="badge ${debt.status === 'pagado' ? 'badge-success' : 'badge-danger'}" onclick="toggleDebtStatus(${debt.id})" style="cursor: pointer;" title="Cambiar estado">
                          ${debt.status === 'pagado' ? 'Pagada 🎉' : debt.type}
                        </span>
                        <button class="btn btn-secondary btn-sm" onclick="openDebtModal(${debt.id})" title="Editar deuda" style="padding: 2px 6px; font-size: 0.7rem;">✏️</button>
                        <button class="btn btn-secondary btn-sm" onclick="deleteDebt(${debt.id})" title="Eliminar deuda" style="padding: 2px 6px; font-size: 0.7rem; color: var(--expense-color);">🗑️</button>
                      </div>
                    </div>
                    <div class="unified-card-bottom" style="display: flex; justify-content: space-between; align-items: center;">
                      <span class="subtext">Vence: ${debt.dueDate}</span>
                      <span class="amount" style="color: ${debt.status === 'pagado' ? 'var(--income-color)' : 'var(--expense-color)'}; font-weight: 700;">
                        ${formatCurrency(debt.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>

      <!-- Expense History Table for Selected Month -->
      <div class="glass-card">
        <div class="glass-card-header" style="margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 style="font-size: 1.1rem;">🧾 Gastos de ${monthLabel}</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">
              ${monthExpenses.length} gasto(s) registrado(s) · Total: <strong style="color: var(--expense-color);">${formatCurrency(totalMonthExpenses)}</strong>
            </span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="openExpenseModal()">+ Nuevo Gasto</button>
        </div>

        ${monthExpenses.length === 0 ? `
          <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">💸</div>
            <h4 style="color: var(--text-main); margin-bottom: 0.35rem;">Sin gastos registrados en ${monthLabel}</h4>
            <p style="font-size: 0.85rem; max-width: 420px; margin: 0 auto;">
              ${isViewingCurrentMonth 
                ? 'Aún no han registrado gastos en este mes. Empiecen guardando la primera compra para ver el cálculo proporcional.'
                : 'No se encontraron gastos registrados en este periodo histórico.'}
            </p>
            <div style="margin-top: 1.25rem; display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
              <button class="btn btn-primary btn-sm" onclick="openExpenseModal()">+ Registrar Primer Gasto</button>
              ${!isViewingCurrentMonth ? '<button class="btn btn-secondary btn-sm" onclick="goToCurrentMonth()">⚡ Volver al Mes Actual</button>' : ''}
            </div>
          </div>
        ` : `
          <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
            <table style="width: 100%; min-width: 600px; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-glass); color: var(--text-muted);">
                  <th style="padding: 0.75rem;">Fecha</th>
                  <th style="padding: 0.75rem;">Concepto</th>
                  <th style="padding: 0.75rem;">Categoría</th>
                  <th style="padding: 0.75rem;">¿Quién pagó?</th>
                  <th style="padding: 0.75rem; text-align: center;">Tipo</th>
                  <th style="padding: 0.75rem; text-align: right;">Monto</th>
                  <th style="padding: 0.75rem; text-align: center;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${monthExpenses.map(item => `
                  <tr style="border-bottom: 1px solid var(--border-glass);">
                    <td style="padding: 0.75rem; color: var(--text-muted); font-size: 0.85rem; white-space: nowrap;">${item.fecha}</td>
                    <td style="padding: 0.75rem; font-weight: 600;">${item.descripcion}</td>
                    <td style="padding: 0.75rem;"><span class="badge badge-purple">${item.categoria}</span></td>
                    <td style="padding: 0.75rem;">${item.pagado_por === 'person_a' ? '👨🏻 Fran' : '👩🏻 Yox'}</td>
                    <td style="padding: 0.75rem; text-align: center;">
                      ${item.tipo_gasto === 'compartido' ? '<span class="badge badge-success">Compartido</span>' : '<span class="badge badge-warning">Personal</span>'}
                    </td>
                    <td style="padding: 0.75rem; text-align: right; font-weight: 700; color: var(--expense-color);">
                      -${formatCurrency(item.monto)}
                    </td>
                    <td style="padding: 0.75rem; text-align: center; white-space: nowrap;">
                      <button class="btn btn-secondary btn-sm" onclick="openExpenseModal(${item.id})" title="Editar gasto" style="padding: 3px 6px; font-size: 0.75rem;">✏️</button>
                      <button class="btn btn-secondary btn-sm" onclick="deleteExpense(${item.id})" title="Eliminar gasto" style="padding: 3px 6px; font-size: 0.75rem; color: var(--expense-color);">🗑️</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="border-top: 2px solid var(--border-glass); font-weight: 700;">
                  <td colspan="5" style="padding: 0.85rem; text-align: right; color: var(--text-main);">
                    Total Gastos en ${monthLabel}:
                  </td>
                  <td style="padding: 0.85rem; text-align: right; color: var(--expense-color); font-size: 1.05rem;">
                    -${formatCurrency(totalMonthExpenses)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}
