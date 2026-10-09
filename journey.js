/*
 * Zaaduna — путь цикла.
 *
 * زاد — провизия, которую берут в дорогу, поэтому прогресс цикла показан
 * не полосой заполнения, а лодкой, идущей по тонкой линии от первого урока
 * к последнему. Это не игра: ни очков, ни наград, ни анимации сверх одного
 * сдвига. Компонент считает положение лодки из доли пройденного.
 */
(function(){
  "use strict";

  // Дау: корпус золотой, паруса синие — тот же силуэт, что на логотипе.
  var DHOW =
    '<svg class="dhow" viewBox="0 0 28 24" fill="none" ' +
    'stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path stroke="var(--gold)" d="M3.5 17.5c3.8 3 17 3 21 0"/>' +
    '<path stroke="var(--navy)" d="M14 17V3.5"/>' +
    '<path stroke="var(--navy)" d="M14 5.2 20.6 15H14z"/>' +
    "</svg>";

  function clamp(n, lo, hi){ return Math.max(lo, Math.min(hi, n)); }
  function pad(n){ return (n < 10 ? "0" : "") + n; }

  /*
   * Рисует путь цикла.
   *   el    — куда вставить
   *   opts  — { current, total, name }
   * Без общего числа уроков пути нет: лодке некуда идти, и честнее
   * не показывать шкалу вовсе.
   */
  function render(el, opts){
    if(!el) return;
    var total = Number(opts && opts.total) || 0;
    if(total < 2){ el.hidden = true; return; }

    var current = clamp(Number(opts.current) || 0, 0, total);
    var share = total > 1 ? current / total : 0;
    // Лодка не упирается в края: у неё есть своя ширина.
    var pos = (4 + share * 92).toFixed(2);

    el.hidden = false;
    el.className = "journey" + (current ? "" : " journey-start");
    el.setAttribute("role", "img");
    el.setAttribute("aria-label",
      (opts.name ? opts.name + ": " : "") +
      "пройдено " + current + " из " + total + " уроков");
    el.innerHTML =
      '<span class="journey-end">' + pad(1) + "</span>" +
      '<span class="journey-track">' +
        '<span class="journey-done" style="width:' + pos + '%"></span>' +
        '<span class="journey-boat" style="left:' + pos + '%">' + DHOW + "</span>" +
      "</span>" +
      '<span class="journey-end">' + total + "</span>";
  }

  window.ZaadunaJourney = { render: render, dhow: DHOW };
})();
