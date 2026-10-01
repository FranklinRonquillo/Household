/* ==========================================================================
   HOUSEHOLD - Savings & Life Goals Module Renderer
   ========================================================================== */

function renderSavingsModule(appState) {
  const { savingsGoals, lifeGoals } = appState;

  return `
    <div class="fade-in">
      <div class="glass-card-header" style="margin-bottom: 1.5rem;">
        <div>
          <h2>🏦 Ahorros y Objetivos de Pareja</h2>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Metas financieras y sueños compartidos para construir nuestro futuro</p>
        </div>
        <button class="btn btn-primary" onclick="addSavingsGoalPrompt()">+ Crear Nueva Meta</button>
      </div>

      <!-- Financial Savings Goals -->
      <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">💰 Metas Financieras</h3>
      <div class="dashboard-grid" style="margin-bottom: 2rem;">
        ${savingsGoals.map(goal => {
          const percent = (goal.current / goal.target) * 100;
          return `
            <div class="glass-card">
              <div class="glass-card-header" style="margin-bottom: 0.5rem;">
                <span class="glass-card-title">${goal.title}</span>
              </div>
              <div style="font-size: 1.4rem; font-weight: 700; color: var(--savings-color); margin-bottom: 0.3rem;">
                ${formatCurrency(goal.current)} <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 400;">/ ${formatCurrency(goal.target)}</span>
              </div>
              <div style="font-size: 0.8rem; color: var(--primary); font-weight: 600; margin-bottom: 0.5rem;">
                ${formatPercent(percent)} completado
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${Math.min(100, percent)}%;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Non-financial Couple Life Goals -->
      <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">❤️ "Nuestros Objetivos" (Sueños Juntos)</h3>
      <div class="dashboard-grid">
        ${lifeGoals.map(life => `
          <div class="glass-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-weight: 600; font-size: 1rem;">${life.title}</span>
              ${life.completed ? '<span class="badge badge-success">Logrado 🎉</span>' : '<span class="badge badge-purple">En Progreso 🚀</span>'}
            </div>
            ${life.completed ? `
              <div style="font-size: 0.8rem; color: var(--text-muted);">Cumplido en: ${life.date}</div>
            ` : `
              <div class="progress-bar-container" style="margin-top: 0.75rem;">
                <div class="progress-bar-fill warning" style="width: ${life.progress || 20}%;"></div>
              </div>
            `}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function addSavingsGoalPrompt() {
  const title = prompt('Nombre de la meta (ej: Viaje a la playa ✈️):');
  if (!title) return;
  const targetStr = prompt('Monto objetivo en COP:', '5000000');
  const target = parseInt(targetStr) || 1000000;
  
  state.set(current => ({
    ...current,
    savingsGoals: [
      ...current.savingsGoals,
      { id: Date.now(), title, current: 0, target, icon: '🎯' }
    ]
  }));
}
