/*
 * MyZaad — выбор между ночью и днём.
 *
 * Ночь остаётся тем, что видно по умолчанию: это и есть мир приложения.
 * День — тот же мир на бумаге, для чтения при свете. Выбор делает читатель,
 * не система: на одном устройстве светлая тема стоит круглые сутки, а главу
 * читают вечером, и наоборот.
 *
 * Сама тема ставится раньше этого файла — крошечной вставкой в <head>,
 * иначе страница успела бы моргнуть ночью перед тем, как стать днём.
 * Здесь остаётся кнопка и память о выборе.
 */
(function(){
  "use strict";

  var KEY = "myzaad_theme";
  var PAINT = { day: "#F7F1E1", night: "#0B1E2E" };

  function apply(theme){
    var day = theme === "day";
    var root = document.documentElement;

    if(day) root.setAttribute("data-theme", "day");
    else root.removeAttribute("data-theme");

    // Телефон красит свою полосу вокруг страницы по этому значению.
    var meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute("content", day ? PAINT.day : PAINT.night);

    var btn = document.getElementById("themeSwitch");
    if(btn){
      // Надпись называет не нынешнее состояние, а то, что получишь, нажав.
      var label = day ? "Включить ночную тему" : "Включить светлую тему";
      btn.textContent = day ? "Ночь" : "День";
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", label);
    }
  }

  function stored(){
    try{ return localStorage.getItem(KEY) === "day" ? "day" : "night"; }
    catch(e){ return "night"; }
  }

  function init(){
    apply(stored());
    var btn = document.getElementById("themeSwitch");
    if(!btn) return;
    btn.addEventListener("click", function(){
      var next = stored() === "day" ? "night" : "day";
      try{ localStorage.setItem(KEY, next); }catch(e){}
      apply(next);
    });
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
