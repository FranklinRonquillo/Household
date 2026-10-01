/* ==========================================================================
   HOUSEHOLD - Achievements & Trophy Case Module Renderer
   ========================================================================== */

function renderAchievementsModule(appState) {
  const { achievements, couplePoints, savingsStreak } = appState;

  return `
    <div class="fade-in">
      <div class="glass-card-header" style="margin-bottom: 1.5rem;">
        <div>
          <h2>🏆 Logros y Gamificación de Pareja</h2>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Celebren cada hito alcanzado en su historia juntos</p>
        </div>
      </div>

      <!-- Gamification Stats Overview -->
      <div class="dashboard-grid" style="margin-bottom: 2rem;">
        <div class="glass-card stat-widget">
          <span class="stat-label">❤️ Puntos de Pareja</span>
          <span class="stat-value primary">${couplePoints} pts</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Ganados por disciplina financiera</span>
        </div>

        <div class="glass-card stat-widget">
          <span class="stat-label">🔥 Racha de Ahorro</span>
          <span class="stat-value" style="color: var(--accent-gold);">${savingsStreak} Días</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Sin gastos hormiga innecesarios</span>
        </div>

        <div class="glass-card stat-widget">
          <span class="stat-label">🏅 Medallas Desbloqueadas</span>
          <span class="stat-value" style="color: var(--income-color);">${achievements.length} Trofeos</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Nivel: Pareja Experta ✨</span>
        </div>
      </div>

      <!-- Trophy Case -->
      <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">🏛️ Vitrina de Trofeos</h3>
      <div class="dashboard-grid">
        ${achievements.map(ach => `
          <div class="glass-card" style="display: flex; align-items: center; gap: 1rem;">
            <div style="font-size: 2.5rem; background: rgba(244,114,182,0.1); width: 60px; height: 60px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-accent);">
              ${ach.icon || '🏆'}
            </div>
            <div>
              <div style="font-weight: 700; font-size: 1rem; color: #ffffff;">${ach.title}</div>
              <div style="font-size: 0.8rem; color: var(--primary); font-weight: 500;">Desbloqueado: ${ach.date}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
