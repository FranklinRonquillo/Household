/* ==========================================================================
   HOUSEHOLD - Smart Market List Module Renderer
   Dynamic Market Checklist & Budget Tracker (Zero Burned Data)
   ========================================================================== */

function renderMarketModule(appState) {
  const { market } = appState;
  const items = market?.items || [];
  const budget = market?.budget || 0;
  
  // Calculate current cart total
  const currentCartTotal = items
    .filter(item => item.checked)
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const availableMarketBudget = Math.max(0, budget - currentCartTotal);
  const cartPercent = budget > 0 ? (currentCartTotal / budget) * 100 : 0;

  return `
    <div class="fade-in">
      <div class="glass-card-header" style="margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h2>🛒 Lista del Mercado Inteligente</h2>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Lleven la lista al supermercado y controlen el carrito en vivo</p>
        </div>
        <button class="btn btn-primary" onclick="openMarketModal()">+ Agregar Producto</button>
      </div>

      <div class="market-container">
        <!-- Left: Smart Checklist -->
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.1rem;">🛒 Lista de Compras</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${items.length} producto(s)</span>
          </div>

          ${items.length === 0 ? `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🛒</div>
              <h4 style="color: var(--text-main); margin-bottom: 0.35rem;">Tu lista de mercado está vacía</h4>
              <p style="font-size: 0.85rem; max-width: 400px; margin: 0 auto;">
                Agreguen los productos que planean comprar para estimar el total del carrito antes de llegar a la caja.
              </p>
              <button class="btn btn-primary btn-sm" onclick="openMarketModal()" style="margin-top: 1.25rem;">+ Agregar Primer Producto</button>
            </div>
          ` : `
            <div class="market-items-list">
              ${items.map(item => `
                <div class="market-item-row ${item.checked ? 'completed' : ''}">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <input type="checkbox" class="market-checkbox" ${item.checked ? 'checked' : ''} onchange="toggleMarketItem(${item.id})">
                    <div>
                      <div style="font-weight: 600; font-size: 0.95rem;">${item.name}</div>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">${item.category}</span>
                    </div>
                  </div>
                  <div style="font-weight: 700; color: var(--text-main);">
                    ${formatCurrency(item.price)}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Right: Live Cart Budget Summary Widget -->
        <div class="glass-card" style="height: fit-content;">
          <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">📊 Resumen del Carrito</h3>
          
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.3rem;">
              <span>Presupuesto asignado:</span>
              <strong style="color: var(--text-main);">${budget > 0 ? formatCurrency(budget) : 'Sin límite fijado'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.3rem;">
              <span>Carrito actual:</span>
              <span style="color: var(--primary);">${formatCurrency(currentCartTotal)}</span>
            </div>
            ${budget > 0 ? `
              <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem;">
                <span>Disponible restante:</span>
                <span style="color: var(--income-color);">${formatCurrency(availableMarketBudget)}</span>
              </div>

              <div class="progress-bar-container">
                <div class="progress-bar-fill ${cartPercent > 100 ? 'danger' : cartPercent > 80 ? 'warning' : 'success'}" style="width: ${Math.min(100, cartPercent)}%;"></div>
              </div>
            ` : ''}
          </div>

          <div style="background: rgba(255,255,255,0.03); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); font-size: 0.8rem; color: var(--text-muted);">
            💡 <strong>Tip inteligente:</strong> Marcar los productos a medida que los colocan en el carrito físico les asegura controlar el total en tiempo real.
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleMarketItem(id) {
  state.set(current => {
    const items = current.market?.items || [];
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const nextChecked = !item.checked;
        const sb = typeof getSupabase === 'function' ? getSupabase() : null;
        if (sb) {
          sb.from('market_items').update({ checked: nextChecked }).eq('id', id).then();
        }
        return { ...item, checked: nextChecked };
      }
      return item;
    });
    return { ...current, market: { ...current.market, items: updatedItems } };
  });
}

function addMarketItemPrompt() {
  openMarketModal();
}
