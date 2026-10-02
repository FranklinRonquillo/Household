/* ==========================================================================
   HOUSEHOLD - Smart Market List Module Renderer
   ========================================================================== */

function renderMarketModule(appState) {
  const { market } = appState;
  
  // Calculate current cart total
  const currentCartTotal = market.items
    .filter(item => item.checked)
    .reduce((sum, item) => sum + item.price, 0);

  const availableMarketBudget = Math.max(0, market.budget - currentCartTotal);
  const cartPercent = market.budget > 0 ? (currentCartTotal / market.budget) * 100 : 0;

  return `
    <div class="fade-in">
      <div class="glass-card-header" style="margin-bottom: 1.5rem;">
        <div>
          <h2>🛒 Lista del Mercado Inteligente</h2>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Lleven la lista al supermercado y controlen el carrito en vivo</p>
        </div>
        <button class="btn btn-primary" onclick="openMarketModal()">+ Agregar Producto</button>
      </div>

      <div class="market-container">
        <!-- Left: Smart Checklist -->
        <div class="glass-card">
          <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">🛒 Mercado de esta semana</h3>
          <div class="market-items-list">
            ${market.items.map(item => `
              <div class="market-item-row ${item.checked ? 'completed' : ''}">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <input type="checkbox" class="market-checkbox" ${item.checked ? 'checked' : ''} onchange="toggleMarketItem(${item.id})">
                  <div>
                    <div style="font-weight: 600; font-size: 0.95rem;">${item.name}</div>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${item.category}</span>
                  </div>
                </div>
                <div style="font-weight: 700; color: #ffffff;">
                  ${formatCurrency(item.price)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right: Live Cart Budget Summary Widget -->
        <div class="glass-card" style="height: fit-content;">
          <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">📊 Resumen del Carrito</h3>
          
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.3rem;">
              <span>Presupuesto total:</span>
              <strong style="color: #ffffff;">${formatCurrency(market.budget)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.3rem;">
              <span>Carrito actual:</span>
              <span style="color: var(--primary);">${formatCurrency(currentCartTotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem;">
              <span>Disponible restante:</span>
              <span style="color: var(--income-color);">${formatCurrency(availableMarketBudget)}</span>
            </div>

            <div class="progress-bar-container">
              <div class="progress-bar-fill ${cartPercent > 100 ? 'danger' : cartPercent > 80 ? 'warning' : 'success'}" style="width: ${Math.min(100, cartPercent)}%;"></div>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.03); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); font-size: 0.8rem; color: var(--text-muted);">
            💡 <strong>Tip inteligente:</strong> Marcar los productos mientras compran les asegura no superar los ${formatCurrency(market.budget)} asignados.
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleMarketItem(id) {
  state.set(current => {
    const updatedItems = current.market.items.map(item => {
      if (item.id === id) return { ...item, checked: !item.checked };
      return item;
    });
    return { ...current, market: { ...current.market, items: updatedItems } };
  });
}

function addMarketItemPrompt() {
  openMarketModal();
}
