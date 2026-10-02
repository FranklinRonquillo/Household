/* ==========================================================================
   HOUSEHOLD - Memories Album Module Renderer ("Memorias de Nuestra Casa")
   ========================================================================== */

function renderMemoriesModule(appState) {
  const { memories } = appState;

  return `
    <div class="fade-in">
      <div class="glass-card-header" style="margin-bottom: 1.5rem;">
        <div>
          <h2>📸 Memorias de Nuestra Casa</h2>
          <p style="color: var(--text-muted); font-size: 0.875rem;">El diario íntimo y álbum de fotos de nuestro hogar</p>
        </div>
        <button class="btn btn-primary" onclick="openMemoryModal()">+ Guardar Nuevo Recuerdo</button>
      </div>

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
    </div>
  `;
}

function addMemoryPrompt() {
  openMemoryModal();
}
