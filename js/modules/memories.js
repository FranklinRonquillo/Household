/* ==========================================================================
   HOUSEHOLD - Memories Album Module Renderer ("Memorias de Nuestra Casa")
   ========================================================================== */

function renderMemoriesModule(appState) {
  const { memories = [] } = appState;

  return `
    <div class="fade-in">
      <div class="glass-card-header" style="margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h2>📸 Memorias de Nuestra Casa</h2>
          <p style="color: var(--text-muted); font-size: 0.875rem;">El diario íntimo y álbum de fotos de nuestro hogar</p>
        </div>
        <button class="btn btn-primary" onclick="openMemoryModal()">+ Guardar Nuevo Recuerdo</button>
      </div>

      ${memories.length === 0 ? `
        <div class="glass-card" style="text-align: center; padding: 3.5rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">📸</div>
          <h4 style="color: var(--text-main); margin-bottom: 0.35rem;">Aún no han guardado recuerdos</h4>
          <p style="font-size: 0.85rem; max-width: 420px; margin: 0 auto;">
            Suban fotos o momentos inolvidables de su hogar (primer mercado, compras para el apto, celebraciones).
          </p>
          <button class="btn btn-primary btn-sm" onclick="openMemoryModal()" style="margin-top: 1.25rem;">+ Guardar Primer Recuerdo</button>
        </div>
      ` : `
        <div class="memories-grid">
          ${memories.map(mem => `
            <div class="memory-card">
              <img src="${mem.image}" alt="${mem.title}" class="memory-img-wrapper" loading="lazy">
              <div class="memory-body">
                <div class="memory-title">${mem.title}</div>
                <div class="memory-date">🗓️ ${mem.date}</div>
                <p class="memory-desc">${mem.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

function addMemoryPrompt() {
  openMemoryModal();
}
