/* ==========================================================================
   HOUSEHOLD - Smart Market List Module Renderer
   Dynamic Market Checklist, Budget Tracker & Expense Conversion (Zero Burned Data)
   ========================================================================== */

function renderMarketModule(appState) {
  const { market, categoryBudgets } = appState;
  const items = market?.items || [];
  const budget = (market?.budget && market.budget > 0) ? market.budget : (categoryBudgets?.['Mercado'] || 0);
  
  const checkedItems = items.filter(item => item.checked);
  // Calculate current cart total (from checked items)
  const currentCartTotal = checkedItems
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // Total of all items in catalog/list
  const allItemsTotal = items
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const availableMarketBudget = Math.max(0, budget - currentCartTotal);
  const cartPercent = budget > 0 ? (currentCartTotal / budget) * 100 : 0;
  const finalPurchaseAmount = currentCartTotal > 0 ? currentCartTotal : allItemsTotal;

  return `
    <div class="fade-in">
      <div class="glass-card-header" style="margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h2>🛒 Lista del Mercado Inteligente</h2>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Lleven la lista al supermercado, actualicen precios y pasen sus compras a gastos</p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          ${checkedItems.length > 0 ? `
            <button class="btn btn-secondary btn-sm" onclick="uncheckAllMarketItems()" title="Desmarcar todos los productos para el próximo mercado">
              🔄 Desmarcar (${checkedItems.length})
            </button>
          ` : ''}
          <button class="btn btn-primary" onclick="openMarketModal()">+ Agregar Producto</button>
        </div>
      </div>

      <div class="market-container">
        <!-- Left: Smart Checklist -->
        <div class="glass-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <h3 style="font-size: 1.1rem; margin: 0;">🛒 Lista de Compras</h3>
              <span class="badge ${checkedItems.length > 0 ? 'badge-success' : 'badge-purple'}" style="font-size: 0.75rem;">
                ${checkedItems.length}/${items.length} en carrito
              </span>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">
              Total lista: <strong>${formatCurrency(allItemsTotal)}</strong>
            </span>
          </div>

          ${items.length === 0 ? `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🛒</div>
              <h4 style="color: var(--text-main); margin-bottom: 0.35rem;">Tu lista de mercado está vacía</h4>
              <p style="font-size: 0.85rem; max-width: 400px; margin: 0 auto;">
                Agreguen los productos que compran en el hogar. Podrán ajustar sus precios cada vez que cambien y registrar cada compra como gasto.
              </p>
              <button class="btn btn-primary btn-sm" onclick="openMarketModal()" style="margin-top: 1.25rem;">+ Agregar Primer Producto</button>
            </div>
          ` : `
            <div class="market-items-list">
              ${items.map(item => `
                <div class="market-item-row ${item.checked ? 'completed' : ''}" id="market-item-${item.id}">
                  <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0; flex: 1;">
                    <input type="checkbox" class="market-checkbox" ${item.checked ? 'checked' : ''} onchange="toggleMarketItem(${item.id})" title="Marcar como puesto en el carrito">
                    <div style="min-width: 0; flex: 1;">
                      <div class="market-item-name" style="font-weight: 600; font-size: 0.95rem; word-break: break-word;">${item.name}</div>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">${item.category || 'Varios'}</span>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 0.65rem; margin-left: 0.5rem; flex-shrink: 0;">
                    <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">
                      ${formatCurrency(item.price)}
                    </div>
                    <div style="display: flex; gap: 0.3rem;">
                      <button 
                        type="button"
                        class="btn btn-secondary btn-sm" 
                        onclick="openMarketModal(${item.id})" 
                        title="Editar precio y datos de ${item.name}" 
                        style="padding: 4px 8px; font-size: 0.75rem; border-radius: var(--radius-sm);"
                      >
                        ✏️
                      </button>
                      <button 
                        type="button"
                        class="btn btn-secondary btn-sm" 
                        onclick="deleteMarketItem(${item.id})" 
                        title="Eliminar de la lista" 
                        style="padding: 4px 8px; font-size: 0.75rem; border-radius: var(--radius-sm); color: var(--expense-color);"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Right: Live Cart Budget Summary Widget & Add to Expense CTA -->
        <div class="glass-card" style="height: fit-content;">
          <h3 style="margin-bottom: 1rem; font-size: 1.1rem;">📊 Resumen del Carrito</h3>
          
          <div style="margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.35rem;">
              <span>Presupuesto fijado:</span>
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <strong style="color: var(--text-main);">${budget > 0 ? formatCurrency(budget) : 'Sin límite fijado'}</strong>
                <button type="button" class="btn btn-secondary btn-sm" onclick="openCategoryBudgetsModal('Mercado')" title="Modificar presupuesto de mercado" style="padding: 1px 5px; font-size: 0.65rem;">✏️</button>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.35rem;">
              <span>Productos en carrito:</span>
              <strong style="color: var(--text-main);">${checkedItems.length} de ${items.length}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 700; margin-bottom: 0.35rem;">
              <span>Total del carrito:</span>
              <span style="color: var(--primary); font-size: 1.25rem;">${formatCurrency(currentCartTotal)}</span>
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

          <!-- Action: Pasar Compra a Gastos -->
          <div style="background: var(--bg-glass); border: 1px solid var(--border-accent); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-main); margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
              <span>💳</span> Registrar esta compra
            </div>
            <p style="font-size: 0.775rem; color: var(--text-muted); margin-bottom: 0.85rem; line-height: 1.35;">
              Carga este total a los <strong>Gastos del Hogar</strong> para que compute en la liquidación y cuotas de Fran y Yox.
            </p>
            <button 
              type="button"
              class="btn btn-primary" 
              style="width: 100%; padding: 0.75rem; font-size: 0.95rem; white-space: normal; text-align: center;"
              onclick="openMarketToExpenseModal()"
              ${items.length === 0 ? 'disabled' : ''}
            >
              💳 Pasar Carrito a Gastos (${formatCurrency(finalPurchaseAmount)})
            </button>
            <div style="font-size: 0.72rem; color: var(--text-muted); text-align: center; margin-top: 0.5rem;">
              ${checkedItems.length > 0 
                ? `Se cargará el total de los ${checkedItems.length} producto(s) marcados.`
                : `Se cargará el total de la lista (puedes ajustar el valor antes de guardar).`}
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.03); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">
            💡 <strong>Mercados múltiples:</strong> Pueden hacer varias compras al mes. Cada vez que vayan al super, marquen lo que compren, pasen el total a gastos y desmarquen para la siguiente visita. ¡Los precios se pueden editar con ✏️ cuando suban o bajen!
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
