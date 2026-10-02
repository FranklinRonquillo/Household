/* ==========================================================================
   HOUSEHOLD - Savings, Life Goals & Achievements Module Renderer
   ========================================================================== */

function renderSavingsModule(appState) {
  const { savingsGoals, lifeGoals, achievements, couplePoints, savingsStreak } = appState;

  return `
    <div class="fade-in">
      <div class="glass-card-header" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h2>🏦 Metas y Logros de Pareja</h2>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Ahorros, sueños compartidos y trofeos alcanzados juntos</p>
        </div>
        <button class="btn btn-primary" onclick="openSavingsModal()">+ Nueva Meta</button>
      </div>

      <!-- Gamification Overview Row -->
      <div class="dashboard-grid" style="margin-bottom: 2rem;">
        <div class="glass-card stat-widget">
          <span class="stat-label">❤️ Puntos Pareja</span>
          <span class="stat-value primary">${couplePoints} pts</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Ganados por disciplina</span>
        </div>

        <div class="glass-card stat-widget">
          <span class="stat-label">🔥 Racha de Ahorro</span>
          <span class="stat-value" style="color: var(--accent-gold);">${savingsStreak} Días</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Sin gastos innecesarios</span>
        </div>

        <div class="glass-card stat-widget">
          <span class="stat-label">🏅 Medallas Ganadas</span>
          <span class="stat-value" style="color: var(--income-color);">${achievements.length} Trofeos</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Nivel: Pareja Experta ✨</span>
        </div>
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
              <div style="font-size: 1.3rem; font-weight: 700; color: var(--savings-color); margin-bottom: 0.3rem;">
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
      <div class="dashboard-grid" style="margin-bottom: 2rem;">
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

      <!-- Trophy Case -->
      <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">🏛️ Vitrina de Trofeos Desbloqueados</h3>
      <div class="dashboard-grid">
        ${achievements.map(ach => `
          <div class="glass-card" style="display: flex; align-items: center; gap: 1rem;">
            <div style="font-size: 2.2rem; background: var(--primary-glow); width: 56px; height: 56px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-accent); flex-shrink: 0;">
              ${ach.icon || '🏆'}
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">${ach.title}</div>
              <div style="font-size: 0.8rem; color: var(--primary); font-weight: 500;">Conseguido: ${ach.date}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function addSavingsGoalPrompt() {
  openSavingsModal();
}
