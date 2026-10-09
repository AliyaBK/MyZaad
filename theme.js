/*
 * Zaaduna — светлая и тёмная тема.
 *
 * Без сохранённого выбора тему задаёт система: так страница совпадает
 * с тем, как у человека настроено всё остальное. Кнопка в шапке — это
 * перекрытие: нажал один раз, и дальше выбор твой, пока не передумаешь.
 *
 * Атрибут data-theme ставится раньше этого файла, крошечной вставкой
 * в <head>, иначе страница успела бы моргнуть чужим цветом. Здесь —
 * кнопка, память о выборе и подмена логотипа.
 */
(function(){
  "use strict";

  var KEY = "zaaduna_theme";
  var dark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function stored(){
    try{
      var v = localStorage.getItem(KEY);
      return (v === "light" || v === "dark") ? v : null;
    }catch(e){ return null; }
  }

  function system(){ return dark && dark.matches ? "dark" : "light"; }
  function current(){ return stored() || system(); }

  /*
   * Пока выбор не сделан, нужный логотип подставляет <picture> сам, и
   * второй файл не скачивается. Как только выбор есть, media-запрос
   * начинает врать — тогда <source> убирается, и картинкой правит src.
   */
  function logo(theme){
    var img = document.getElementById("brandLogo");
    if(!img) return;
    var src = img.parentNode && img.parentNode.querySelector("source");
    if(src) src.parentNode.removeChild(src);
    var base = img.getAttribute("src").replace(/-dark\.png$/, ".png");
    img.setAttribute("src", theme === "dark" ? base.replace(/\.png$/, "-dark.png") : base);
  }

  function apply(theme, explicit){
    var root = document.documentElement;
    if(explicit) root.setAttribute("data-theme", theme);
    else root.removeAttribute("data-theme");

    if(explicit) logo(theme);

    var btn = document.getElementById("themeSwitch");
    if(btn){
      // Положение бегунка рисует CSS; скрипту остаётся назвать состояние
      // словами — у тумблера нет подписи, и без этого он нем для чтеца.
      var isDark = theme === "dark";
      var label = isDark ? "Тёмная тема включена" : "Тёмная тема выключена";
      btn.setAttribute("aria-checked", isDark ? "true" : "false");
      btn.setAttribute("aria-label", label);
      btn.setAttribute("title", isDark ? "Включить светлую тему" : "Включить тёмную тему");
    }
  }

  function init(){
    apply(current(), !!stored());

    // Пока читатель не выбрал сам, идём за системой, если она переключится.
    if(dark && dark.addEventListener){
      dark.addEventListener("change", function(){
        if(!stored()) apply(system(), false);
      });
    }

    var btn = document.getElementById("themeSwitch");
    if(!btn) return;
    btn.addEventListener("click", function(){
      var next = current() === "dark" ? "light" : "dark";
      try{ localStorage.setItem(KEY, next); }catch(e){}
      apply(next, true);
    });
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
