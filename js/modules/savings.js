/* ==========================================================================
   HOUSEHOLD - Savings, Life Goals & Achievements Module Renderer
   Dynamic Goals & Zero Burned Figures
   ========================================================================== */

function renderSavingsModule(appState) {
  const { savingsGoals = [], lifeGoals = [], achievements = [], savingsStreak = 0 } = appState;
  const couplePoints = (typeof calculateCouplePoints === 'function') ? calculateCouplePoints(appState) : 0;

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
          <span style="font-size: 0.75rem; color: var(--text-muted);">Puntos ganados por actividad</span>
        </div>

        <div class="glass-card stat-widget">
          <span class="stat-label">🔥 Racha de Ahorro</span>
          <span class="stat-value" style="color: var(--accent-gold);">${savingsStreak} Días</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Días con orden financiero</span>
        </div>

        <div class="glass-card stat-widget">
          <span class="stat-label">🏅 Medallas Ganadas</span>
          <span class="stat-value" style="color: var(--income-color);">${achievements.length} Trofeos</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Nivel de equipo ✨</span>
        </div>
      </div>

      <!-- Financial Savings Goals -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="font-size: 1.1rem;">💰 Metas Financieras de Ahorro</h3>
        <button class="btn btn-secondary btn-sm" onclick="openSavingsModal()">+ Crear Meta</button>
      </div>

      ${savingsGoals.length === 0 ? `
        <div class="glass-card" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); margin-bottom: 2rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏦</div>
          <h4 style="color: var(--text-main); margin-bottom: 0.35rem;">Aún no tienen metas de ahorro creadas</h4>
          <p style="font-size: 0.85rem; max-width: 420px; margin: 0 auto;">
            Creen su primera meta juntos (ej: Comprar casa, Viaje soñado, Fondo de emergencia) para dar seguimiento a su ahorro acumulado.
          </p>
          <button class="btn btn-primary btn-sm" onclick="openSavingsModal()" style="margin-top: 1.25rem;">+ Crear Primera Meta</button>
        </div>
      ` : `
        <div class="dashboard-grid" style="margin-bottom: 2rem;">
          ${savingsGoals.map(goal => {
            const currentVal = Number(goal.current) || 0;
            const targetVal = Number(goal.target) || 1;
            const percent = (currentVal / targetVal) * 100;
            return `
              <div class="glass-card">
                <div class="glass-card-header" style="margin-bottom: 0.5rem;">
                  <span class="glass-card-title">${goal.title}</span>
                </div>
                <div style="font-size: 1.3rem; font-weight: 700; color: var(--savings-color); margin-bottom: 0.3rem;">
                  ${formatCurrency(currentVal)} <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 400;">/ ${formatCurrency(targetVal)}</span>
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
      `}

      <!-- Non-financial Couple Life Goals -->
      <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">❤️ "Nuestros Objetivos" (Sueños Juntos)</h3>
      ${lifeGoals.length === 0 ? `
        <div class="glass-card" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); margin-bottom: 2rem;">
          <div style="font-size: 2.2rem; margin-bottom: 0.4rem;">✨</div>
          <h4 style="color: var(--text-main); margin-bottom: 0.25rem;">Espacio para sueños compartidos</h4>
          <p style="font-size: 0.85rem;">Aquí registrarán planes de vida, viajes y proyectos que no dependen solo de dinero.</p>
        </div>
      ` : `
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
      `}

      <!-- Trophy Case -->
      <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">🏛️ Vitrina de Trofeos Desbloqueados</h3>
      ${achievements.length === 0 ? `
        <div class="glass-card" style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.2rem; margin-bottom: 0.4rem;">🏆</div>
          <h4 style="color: var(--text-main); margin-bottom: 0.25rem;">Comiencen su camino de logros</h4>
          <p style="font-size: 0.85rem;">Los trofeos se irán desbloqueando a medida que registren gastos, ahorren y mantengan disciplina juntos.</p>
        </div>
      ` : `
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
      `}
    </div>
  `;
}

function addSavingsGoalPrompt() {
  openSavingsModal();
}
