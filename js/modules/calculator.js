/* ==========================================================================
   HOUSEHOLD - Floating Scientific & History Quick Calculator
   ========================================================================== */

let calcExpression = '';
let calcHistory = [];

function toggleCalcWidget() {
  const el = document.getElementById('calc-widget-popup');
  if (el) el.classList.toggle('active');
}

function calcInput(char) {
  const exprScreen = document.getElementById('calc-expr-screen');
  const resultScreen = document.getElementById('calc-result-screen');

  if (char === 'C') {
    calcExpression = '';
    if (exprScreen) exprScreen.innerText = '';
    if (resultScreen) resultScreen.innerText = '0';
    return;
  }

  if (char === 'DEL') {
    calcExpression = calcExpression.slice(0, -1);
    updateCalcDisplay();
    return;
  }

  if (char === '=') {
    if (!calcExpression) return;
    try {
      // Standard mathematical evaluation with order of operations
      const sanitized = calcExpression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/%/g, '/100');

      const evalResult = Function(`'use strict'; return (${sanitized})`)();
      
      if (typeof evalResult === 'number' && !isNaN(evalResult) && isFinite(evalResult)) {
        const formattedResult = Number.isInteger(evalResult) 
          ? evalResult.toLocaleString('es-CO')
          : evalResult.toFixed(2);

        // Add to history
        calcHistory.unshift({
          expr: calcExpression,
          result: formattedResult,
          rawResult: evalResult
        });
        if (calcHistory.length > 5) calcHistory.pop();

        renderCalcHistory();

        if (exprScreen) exprScreen.innerText = `${calcExpression} =`;
        if (resultScreen) resultScreen.innerText = formattedResult;
        
        calcExpression = String(evalResult);
      } else {
        if (resultScreen) resultScreen.innerText = 'Error';
      }
    } catch (e) {
      if (resultScreen) resultScreen.innerText = 'Sintaxis Error';
    }
    return;
  }

  // Normal character input
  calcExpression += char;
  updateCalcDisplay();
}

function updateCalcDisplay() {
  const exprScreen = document.getElementById('calc-expr-screen');
  const resultScreen = document.getElementById('calc-result-screen');

  if (exprScreen) exprScreen.innerText = calcExpression;
  
  // Real-time preview calculation
  if (calcExpression) {
    try {
      const sanitized = calcExpression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/%/g, '/100');
      
      const prevResult = Function(`'use strict'; return (${sanitized})`)();
      if (typeof prevResult === 'number' && !isNaN(prevResult) && isFinite(prevResult)) {
        if (resultScreen) {
          resultScreen.innerText = Number.isInteger(prevResult) 
            ? prevResult.toLocaleString('es-CO') 
            : prevResult.toFixed(2);
        }
      }
    } catch (e) {
      // Ignore preview errors while typing incomplete expressions
    }
  } else {
    if (resultScreen) resultScreen.innerText = '0';
  }
}

function renderCalcHistory() {
  const historyContainer = document.getElementById('calc-history-list');
  if (!historyContainer) return;

  if (calcHistory.length === 0) {
    historyContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.75rem; text-align: center; padding: 0.3rem;">Historial vacío</div>';
    return;
  }

  historyContainer.innerHTML = calcHistory.map((item, idx) => `
    <div class="calc-history-item" onclick="useCalcHistoryResult(${idx})" title="Hacer clic para usar este resultado">
      <span style="color: var(--text-muted);">${item.expr} =</span>
      <strong style="color: var(--primary);">${item.result}</strong>
    </div>
  `).join('');
}

function useCalcHistoryResult(index) {
  const item = calcHistory[index];
  if (item) {
    calcExpression = String(item.rawResult);
    updateCalcDisplay();
  }
}

function clearCalcHistory() {
  calcHistory = [];
  renderCalcHistory();
}
