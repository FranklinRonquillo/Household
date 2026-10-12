/* ==========================================================================
   HOUSEHOLD - Smart Market List Module Renderer (Mobile-First Architecture)
   Dynamic Checklist, Live Budget Tracker & Instant 1-Click Expense Conversion
   ========================================================================== */

let currentMarketFilter = 'all';

function setMarketFilter(filter) {
  currentMarketFilter = filter;
  if (typeof renderApp === 'function' && typeof state !== 'undefined') {
    renderApp(state.get());
  }
}

function getMarketCategoryIcon(category) {
  switch (category) {
    case 'Despensa': return '📦';
    case 'Carnes': return '🥩';
    case 'Lácteos': return '🥛';
    case 'Verduras': return '🥦';
    case 'Aseo': return '🧴';
    case 'Varios': default: return '🛒';
  }
}

function renderMarketModule(appState) {
  const { market, categoryBudgets } = appState;
  const items = market?.items || [];
  const budget = (market?.budget && market.budget > 0) ? market.budget : (categoryBudgets?.['Mercado'] || 0);
  
  const checkedItems = items.filter(item => item.checked);
  const pendingItems = items.filter(item => !item.checked);

  // Calculate current cart total (from checked items)
  const currentCartTotal = checkedItems
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // Total of all items in catalog/list
  const allItemsTotal = items
    .reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  const availableMarketBudget = Math.max(0, budget - currentCartTotal);
  const cartPercent = budget > 0 ? (currentCartTotal / budget) * 100 : 0;
  const finalPurchaseAmount = currentCartTotal > 0 ? currentCartTotal : allItemsTotal;

  // Filter items based on current active segmented filter
  let displayedItems = items;
  if (currentMarketFilter === 'pending') {
    displayedItems = pendingItems;
  } else if (currentMarketFilter === 'checked') {
    displayedItems = checkedItems;
  }

  return `
    <div class="fade-in">
      <!-- 1. Header: Title, Live Counter & Fast Action Buttons -->
      <div class="market-view-header">
        <div class="market-title-wrap">
          <h2>🛒 Lista de Compras</h2>
          <span class="badge ${checkedItems.length > 0 ? 'badge-success' : 'badge-purple'}">
            ${checkedItems.length}/${items.length} en carrito
          </span>
        </div>
        <div class="market-subtitle">
          ${items.length === 0 
            ? 'Organiza el mercado del hogar con precios reales y registro directo en gastos' 
            : `Total estimado de la lista: <strong style="color: var(--text-main);">${formatCurrency(allItemsTotal)}</strong>`}
        </div>

        <div class="market-header-actions">
          <button class="btn btn-primary btn-sm" onclick="openMarketModal()" style="font-weight: 700;">
            + Agregar Producto
          </button>
          ${checkedItems.length > 0 ? `
            <button class="btn btn-secondary btn-sm" onclick="uncheckAllMarketItems()" title="Desmarcar todos para el próximo mercado">
              🔄 Desmarcar (${checkedItems.length})
            </button>
          ` : ''}
          ${items.length === 0 ? `
            <button class="btn btn-secondary btn-sm" onclick="loadSuggestedMarketItems()" style="background: rgba(var(--primary-rgb, 236, 72, 153), 0.15); border-color: var(--primary); color: var(--text-main);">
              📥 Cargar Lista Básica (15 productos)
            </button>
          ` : `
            <button class="btn btn-secondary btn-sm" onclick="loadSuggestedMarketItems()" title="Añadir sugeridos de la despensa">
              + Sugeridos
            </button>
          `}
        </div>
      </div>

      <!-- 2. Live Cart & Budget Unified Control Center (Mobile-First Top Center) -->
      ${items.length > 0 ? `
        <div class="market-live-cart-card">
          <!-- Top Stats: Cart Spent vs Budget -->
          <div class="market-cart-stats-grid">
            <div class="market-cart-stat-box primary">
              <span class="market-stat-lbl">🛒 En Carrito</span>
              <div class="market-stat-val ${currentCartTotal > 0 ? 'active' : ''}">
                ${formatCurrency(currentCartTotal)}
              </div>
              <span class="market-stat-sub">
                ${checkedItems.length} de ${items.length} productos
              </span>
            </div>

            <div class="market-cart-stat-box">
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span class="market-stat-lbl">🎯 Presupuesto</span>
                <button type="button" class="btn-budget-edit" onclick="openCategoryBudgetsModal('Mercado')" title="Modificar presupuesto de mercado">✏️</button>
              </div>
              <div class="market-stat-val budget">
                ${budget > 0 ? formatCurrency(budget) : 'Sin límite'}
              </div>
              <span class="market-stat-sub ${cartPercent > 100 ? 'text-danger' : 'text-income'}">
                ${budget > 0 ? `Disp: ${formatCurrency(availableMarketBudget)}` : 'Toca ✏️ para fijar límite'}
              </span>
            </div>
          </div>

          ${budget > 0 ? `
            <div class="market-budget-bar-wrap">
              <div class="progress-bar-container" style="height: 7px;">
                <div class="progress-bar-fill ${cartPercent > 100 ? 'danger' : cartPercent > 80 ? 'warning' : 'success'}" style="width: ${Math.min(100, cartPercent)}%;"></div>
              </div>
              <div class="market-budget-bar-labels">
                <span>${Math.round(cartPercent)}% consumido</span>
                <span>${formatCurrency(currentCartTotal)} de ${formatCurrency(budget)}</span>
              </div>
            </div>
          ` : ''}

          <!-- Quick 1-Click Pass to Expenses -->
          <div class="market-expense-quick-box">
            <div class="market-expense-quick-title">
              <span>💳 Pasar Mercado a Gastos</span>
              <span class="market-expense-quick-amount">
                ${formatCurrency(finalPurchaseAmount)}
              </span>
            </div>

            <div class="market-payer-buttons">
              <button 
                type="button" 
                class="btn-payer-choice fran" 
                onclick="quickAddMarketToExpenses('person_a')"
                title="Cargar a gastos: Pagó Fran"
              >
                <div style="display: flex; align-items: center; gap: 0.65rem; min-width: 0;">
                  <span class="payer-avatar">👨🏻</span>
                  <div class="payer-info">
                    <span class="payer-name">Pagó Fran</span>
                    <span class="payer-sub">Registrar compra a gastos compartidos</span>
                  </div>
                </div>
                <div class="payer-action-badge">
                  <span>1-Clic</span>
                  <span>➔</span>
                </div>
              </button>

              <button 
                type="button" 
                class="btn-payer-choice yox" 
                onclick="quickAddMarketToExpenses('person_b')"
                title="Cargar a gastos: Pagó Yox"
              >
                <div style="display: flex; align-items: center; gap: 0.65rem; min-width: 0;">
                  <span class="payer-avatar">👩🏻</span>
                  <div class="payer-info">
                    <span class="payer-name">Pagó Yox</span>
                    <span class="payer-sub">Registrar compra a gastos compartidos</span>
                  </div>
                </div>
                <div class="payer-action-badge">
                  <span>1-Clic</span>
                  <span>➔</span>
                </div>
              </button>
            </div>

            <div style="text-align: center; margin-top: 0.55rem;">
              <button 
                type="button" 
                class="market-link-btn" 
                onclick="openMarketToExpenseModal()"
                title="Ajustar monto si la factura física tuvo otro valor"
              >
                ⚙️ ¿Otro valor en caja? Ajustar tirilla física manual
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- 3. Smart Checklist Container with Mobile Filters -->
      ${items.length === 0 ? `
        <div class="glass-card" style="text-align: center; padding: 2.5rem 1.25rem;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">🛒</div>
          <h3 style="color: var(--text-main); margin-bottom: 0.5rem; font-size: 1.2rem;">Tu lista de mercado está vacía</h3>
          <p style="font-size: 0.85rem; max-width: 420px; margin: 0 auto 1.5rem; line-height: 1.45; color: var(--text-muted);">
            Carga la lista básica de la despensa en un clic con los productos más comunes del hogar (Huevos, Pollo, Arroz, Leche, etc.) o añade productos manualmente.
          </p>
          <div style="display: flex; flex-direction: column; gap: 0.65rem; max-width: 320px; margin: 0 auto;">
            <button class="btn btn-primary" onclick="loadSuggestedMarketItems()" style="font-weight: 700; padding: 0.75rem;">
              📥 Cargar Lista Básica (15 productos)
            </button>
            <button class="btn btn-secondary" onclick="openMarketModal()" style="padding: 0.75rem;">
              + Agregar Producto Manualmente
            </button>
          </div>
        </div>
      ` : `
        <div>
          <!-- Segmented Filter Pills -->
          <div class="market-filters-bar">
            <button 
              type="button" 
              class="market-filter-pill ${currentMarketFilter === 'all' ? 'active' : ''}" 
              onclick="setMarketFilter('all')"
            >
              Todos (${items.length})
            </button>
            <button 
              type="button" 
              class="market-filter-pill ${currentMarketFilter === 'pending' ? 'active' : ''}" 
              onclick="setMarketFilter('pending')"
            >
              Pendientes (${pendingItems.length})
            </button>
            <button 
              type="button" 
              class="market-filter-pill ${currentMarketFilter === 'checked' ? 'active' : ''}" 
              onclick="setMarketFilter('checked')"
            >
              En Carrito (${checkedItems.length})
            </button>
          </div>

          <!-- Product Cards List -->
          ${displayedItems.length === 0 ? `
            <div class="glass-card" style="text-align: center; padding: 2rem 1rem; color: var(--text-muted); margin-bottom: 1.5rem;">
              <div style="font-size: 2rem; margin-bottom: 0.35rem;">
                ${currentMarketFilter === 'checked' ? '🛒' : '🎉'}
              </div>
              <p style="font-weight: 600; color: var(--text-main); font-size: 0.95rem;">
                ${currentMarketFilter === 'checked' 
                  ? 'Aún no has marcado productos en el carrito' 
                  : '¡Compraste todo lo de la lista!'}
              </p>
              <p style="font-size: 0.8rem; margin-top: 0.25rem;">
                ${currentMarketFilter === 'checked' 
                  ? 'Toca cualquier producto de la lista para agregarlo a tu carrito.' 
                  : 'Pasa el total a gastos con los botones de arriba.'}
              </p>
              <button 
                type="button" 
                class="btn btn-secondary btn-sm" 
                onclick="setMarketFilter('all')" 
                style="margin-top: 0.85rem;"
              >
                Ver todos los productos
              </button>
            </div>
          ` : `
            <div class="market-items-list">
              ${displayedItems.map(item => `
                <div class="market-item-card ${item.checked ? 'completed' : ''}" id="market-item-${item.id}">
                  <!-- Row 1: Checkbox + Product Name + Price Badge -->
                  <div class="market-item-row-top">
                    <div 
                      class="market-item-clickable-area" 
                      onclick="toggleMarketItem('${item.id}')" 
                      title="${item.checked ? 'Desmarcar del carrito' : 'Marcar como puesto en el carrito'}"
                    >
                      <div class="market-check-wrapper">
                        <input 
                          type="checkbox" 
                          class="market-checkbox" 
                          ${item.checked ? 'checked' : ''} 
                          id="chk-${item.id}"
                          onclick="event.stopPropagation(); toggleMarketItem('${item.id}');"
                        >
                        <span class="market-check-custom">${item.checked ? '✓' : ''}</span>
                      </div>

                      <div class="market-item-text-wrap">
                        <div class="market-item-name">${item.name}</div>
                      </div>
                    </div>

                    <!-- Price Badge (Tap to Edit) -->
                    <div 
                      class="market-item-price-pill" 
                      onclick="openMarketModal('${item.id}')" 
                      title="Toca para cambiar el precio de ${item.name}"
                    >
                      <span>${formatCurrency(item.price)}</span>
                      <span class="price-edit-pen">✏️</span>
                    </div>
                  </div>

                  <!-- Row 2: Category Pill + Action Buttons -->
                  <div class="market-item-row-bottom">
                    <div class="market-item-category-tag">
                      <span>${getMarketCategoryIcon(item.category)}</span>
                      <span>${item.category || 'Varios'}</span>
                      ${item.checked ? '<span class="status-indicator">· En carrito</span>' : ''}
                    </div>

                    <div class="market-item-actions">
                      <button 
                        type="button" 
                        class="btn-item-action edit" 
                        onclick="openMarketModal('${item.id}')" 
                        title="Modificar precio, nombre o pasillo de ${item.name}"
                      >
                        <span>✏️</span>
                        <span>Editar</span>
                      </button>
                      <button 
                        type="button" 
                        class="btn-item-action delete" 
                        onclick="deleteMarketItem('${item.id}')" 
                        title="Eliminar ${item.name} de la lista"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          `}

          <!-- Mobile Shopping Pro-Tip -->
          <div style="background: rgba(255,255,255,0.025); padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); font-size: 0.78rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 2rem;">
            💡 <strong>Tip de compras:</strong> Marca los productos a medida que los colocas en el carrito físico para ver el total acumulado en vivo. Al pagar en caja, toca <strong>Pagó Fran</strong> o <strong>Pagó Yox</strong> para añadirlo a los gastos compartidos en un solo paso.
          </div>
        </div>
      `}
    </div>
  `;
}

function toggleMarketItem(id) {
  state.set(current => {
    const items = current.market?.items || [];
    const updatedItems = items.map(item => {
      if (String(item.id) === String(id)) {
        const nextChecked = !item.checked;
        const sb = typeof getSupabase === 'function' ? getSupabase() : null;
        if (sb) {
          const idNum = isNaN(Number(id)) ? id : Number(id);
          sb.from('market_items').update({ checked: nextChecked }).eq('id', idNum).then();
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

