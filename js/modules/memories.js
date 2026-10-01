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
        <button class="btn btn-primary" onclick="addMemoryPrompt()">+ Guardar Nuevo Recuerdo</button>
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
  const title = prompt('Título del recuerdo (ej: Primer viaje juntos ✈️):');
  if (!title) return;
  const desc = prompt('Pequeña descripción o dedicatoria:', 'Un día inolvidable guardado para siempre.');
  const imageUrl = prompt('URL de la foto (o de la imagen subida):', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80');

  state.set(current => ({
    ...current,
    memories: [
      { id: Date.now(), title, date: 'Hoy', desc, image: imageUrl || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80' },
      ...current.memories
    ]
  }));
}
