/* ==========================================================================
   HOUSEHOLD - Floating Quick Calculator Widget
   ========================================================================== */

let calcExpr = '';

function toggleCalcWidget() {
  const el = document.getElementById('calc-widget-popup');
  if (el) el.classList.toggle('active');
}

function calcInput(char) {
  const display = document.getElementById('calc-display-screen');
  if (char === 'C') {
    calcExpr = '';
  } else if (char === '=') {
    try {
      calcExpr = String(eval(calcExpr.replace(/×/g, '*').replace(/÷/g, '/')));
    } catch (e) {
      calcExpr = 'Error';
    }
  } else {
    if (calcExpr === 'Error') calcExpr = '';
    calcExpr += char;
  }
  if (display) display.innerText = calcExpr || '0';
}
