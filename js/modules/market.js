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
      <!-- Header with direct Action Buttons -->
      <div class="glass-card-header" style="margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <h2>🛒 Lista del Mercado Inteligente</h2>
          <p style="color: var(--text-muted); font-size: 0.875rem;">Precios editables por producto · Carga directa a gastos en un solo clic</p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          ${finalPurchaseAmount > 0 ? `
            <button class="btn btn-primary btn-sm" onclick="quickAddMarketToExpenses('person_a')" title="Añadir total directamente a gastos">
              💳 + Añadir Total a Gastos (${formatCurrency(finalPurchaseAmount)})
            </button>
          ` : ''}
          ${checkedItems.length > 0 ? `
            <button class="btn btn-secondary btn-sm" onclick="uncheckAllMarketItems()" title="Desmarcar todos los productos para el próximo mercado">
              🔄 Desmarcar (${checkedItems.length})
            </button>
          ` : ''}
          ${items.length === 0 ? `
            <button class="btn btn-secondary btn-sm" onclick="loadSuggestedMarketItems()" style="background: rgba(var(--primary-rgb, 236, 72, 153), 0.15); border-color: var(--primary); color: var(--text-main);" title="Cargar 15 productos básicos del hogar">
              📥 Cargar Lista Básica
            </button>
          ` : ''}
          <button class="btn btn-primary btn-sm" onclick="openMarketModal()">+ Agregar Producto</button>
        </div>
      </div>

      <!-- ⚡ QUICK ADD BANNER: Añadir a Gastos en 1 Clic (Sin llenar formularios largos) -->
      ${items.length > 0 ? `
        <div class="market-quick-banner">
          <div>
            <div class="market-quick-banner-title">
              💳 Registrar Mercado en Gastos (Sin formularios)
            </div>
            <div class="market-quick-banner-amount">
              ${formatCurrency(finalPurchaseAmount)}
              <span class="market-quick-banner-sub">
                ${checkedItems.length > 0 ? `(${checkedItems.length} producto(s) marcados en carrito)` : `(Total de los ${items.length} productos de la lista)`}
              </span>
            </div>
          </div>
          <div class="market-quick-banner-actions">
            <button 
              type="button" 
              class="btn btn-primary" 
              onclick="quickAddMarketToExpenses('person_a')" 
              style="padding: 0.65rem 1.1rem; font-weight: 700; font-size: 0.9rem;"
              title="Añadir a gastos compartidos: Pagó Fran"
            >
              👨🏻 Pagó Fran ➔ Añadir a Gastos
            </button>
            <button 
              type="button" 
              class="btn btn-secondary" 
              onclick="quickAddMarketToExpenses('person_b')" 
              style="padding: 0.65rem 1.1rem; font-weight: 700; font-size: 0.9rem; background: rgba(139, 92, 246, 0.25); border: 1px solid var(--secondary); color: #ffffff;"
              title="Añadir a gastos compartidos: Pagó Yox"
            >
              👩🏻 Pagó Yox ➔ Añadir a Gastos
            </button>
            <button 
              type="button" 
              class="btn btn-secondary btn-sm" 
              onclick="openMarketToExpenseModal()" 
              style="padding: 0.65rem 0.8rem; font-size: 0.8rem;"
              title="Ajustar monto si la factura o tirilla física tuvo otro valor exacto"
            >
              ⚙️ Ajustar detalle
            </button>
          </div>
        </div>
      ` : ''}

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
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 0.8rem; color: var(--text-muted);">
                Total lista: <strong style="color: var(--text-main);">${formatCurrency(allItemsTotal)}</strong>
              </span>
              ${items.length > 0 ? `
                <button type="button" class="btn btn-secondary btn-sm" onclick="loadSuggestedMarketItems()" style="padding: 3px 8px; font-size: 0.7rem;" title="Añadir más productos sugeridos">
                  + Sugeridos
                </button>
              ` : ''}
            </div>
          </div>

          ${items.length === 0 ? `
            <div style="text-align: center; padding: 3rem 1.5rem; color: var(--text-muted); background: var(--bg-glass); border-radius: var(--radius-md); border: 1px dashed var(--border-glass);">
              <div style="font-size: 3rem; margin-bottom: 0.5rem;">🛒</div>
              <h4 style="color: var(--text-main); margin-bottom: 0.5rem; font-size: 1.15rem;">Tu lista de mercado aún no tiene productos</h4>
              <p style="font-size: 0.875rem; max-width: 460px; margin: 0 auto 1.25rem; line-height: 1.45;">
                Carga la lista básica de la despensa en un clic para tener los productos más comunes del hogar (Huevos, Pollo, Arroz, Leche, etc.) con precios que puedes editar con el botón <strong>✏️ Editar</strong>.
              </p>
              <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="loadSuggestedMarketItems()" style="font-weight: 700; padding: 0.65rem 1.25rem;">
                  📥 Cargar Lista Básica del Hogar (15 productos)
                </button>
                <button class="btn btn-secondary" onclick="openMarketModal()">
                  + Agregar Producto Manualmente
                </button>
              </div>
            </div>
          ` : `
            <div class="market-items-list">
              ${items.map(item => `
                <div class="market-item-row ${item.checked ? 'completed' : ''}" id="market-item-${item.id}">
                  <!-- Checkbox & Product Name -->
                  <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 0; flex: 1;">
                    <input 
                      type="checkbox" 
                      class="market-checkbox" 
                      ${item.checked ? 'checked' : ''} 
                      onchange="toggleMarketItem('${item.id}')" 
                      title="Marcar como puesto en el carrito"
                    >
                    <div style="min-width: 0; flex: 1;">
                      <div class="market-item-name" style="font-weight: 600; font-size: 0.95rem; word-break: break-word;">${item.name}</div>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">${item.category || 'Varios'}</span>
                    </div>
                  </div>

                  <!-- Price & Explicit Action Buttons -->
                  <div style="display: flex; align-items: center; gap: 0.65rem; margin-left: 0.5rem; flex-shrink: 0;">
                    <!-- Clickable Price Badge -->
                    <button 
                      type="button" 
                      class="market-price-badge" 
                      onclick="openMarketModal('${item.id}')" 
                      title="Clic para cambiar el precio de ${item.name}"
                    >
                      <span>${formatCurrency(item.price)}</span>
                      <span style="font-size: 0.75rem; color: var(--primary);">✏️</span>
                    </button>

                    <!-- Explicit Edit Button with Text & Icon -->
                    <div style="display: flex; gap: 0.35rem;">
                      <button 
                        type="button"
                        class="btn btn-secondary btn-sm" 
                        onclick="openMarketModal('${item.id}')" 
                        title="Modificar precio, nombre o categoría de ${item.name}" 
                        style="padding: 4px 10px; font-size: 0.775rem; font-weight: 600; display: inline-flex; align-items: center; gap: 3px;"
                      >
                        <span>✏️</span>
                        <span>Editar</span>
                      </button>
                      <button 
                        type="button"
                        class="btn btn-secondary btn-sm" 
                        onclick="deleteMarketItem('${item.id}')" 
                        title="Eliminar ${item.name} de la lista" 
                        style="padding: 4px 8px; font-size: 0.75rem; color: var(--expense-color);"
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

        <!-- Right: Live Cart Budget Summary Widget & Quick Expense Triggers -->
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

          <!-- Action: Pasar Compra a Gastos en 1 Clic -->
          <div style="background: var(--bg-glass); border: 1px solid var(--border-accent); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
            <div style="font-size: 0.875rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.4rem;">
              <span>💳</span> Pasar este total a Gastos
            </div>
            <p style="font-size: 0.775rem; color: var(--text-muted); margin-bottom: 0.85rem; line-height: 1.35;">
              Añade directamente los <strong>${formatCurrency(finalPurchaseAmount)}</strong> a los gastos compartidos sin tener que llenar formularios:
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <button 
                type="button"
                class="btn btn-primary" 
                style="width: 100%; padding: 0.65rem; font-size: 0.9rem; font-weight: 700; text-align: center;"
                onclick="quickAddMarketToExpenses('person_a')"
                ${items.length === 0 ? 'disabled' : ''}
              >
                👨🏻 Pagó Fran ➔ Añadir a Gastos
              </button>
              <button 
                type="button"
                class="btn btn-secondary" 
                style="width: 100%; padding: 0.65rem; font-size: 0.9rem; font-weight: 700; text-align: center; background: rgba(139, 92, 246, 0.25); border: 1px solid var(--secondary); color: #fff;"
                onclick="quickAddMarketToExpenses('person_b')"
                ${items.length === 0 ? 'disabled' : ''}
              >
                👩🏻 Pagó Yox ➔ Añadir a Gastos
              </button>
              <button 
                type="button"
                class="btn btn-outline btn-sm" 
                style="width: 100%; font-size: 0.75rem; margin-top: 0.25rem; text-align: center;"
                onclick="openMarketToExpenseModal()"
                ${items.length === 0 ? 'disabled' : ''}
              >
                ⚙️ Ajustar factura manual
              </button>
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.03); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-glass); font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">
            💡 <strong>Mercados múltiples:</strong> Pueden hacer varios mercados en el mes. Cada vez que vayan al super, marquen lo que compren, pasen el total a gastos con un clic y la lista se desmarcará para la siguiente visita. ¡Pueden editar los precios con <strong>✏️ Editar</strong> cada vez que cambien!
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
