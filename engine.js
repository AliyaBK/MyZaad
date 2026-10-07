/*
 * MyZaad — общий движок глав.
 *
 * Один и тот же файл обслуживает любую главу. Всё содержимое (вопросы,
 * тексты, правильные ответы, тексты для скачивания) приходит извне через
 * объект CHAPTER_DATA, который задаёт файл главы (например chapter1-data.js)
 * и передаёт в MyZaadEngine.init(CHAPTER_DATA).
 *
 * Чтобы добавить главу, движок и разметку (engine.html/style.css) трогать
 * не нужно — только создать новый файл данных по образцу chapter1-data.js.
 */
(function(){
  "use strict";

  var MSG_REQUIRED = "Необходимо ответить на все вопросы.";
  var MSG_CHECK = "Нажмите «Проверить», чтобы продолжить.";

  function init(CHAPTER){
    var tg = window.Telegram && window.Telegram.WebApp;
    if(tg){ try{ tg.ready(); tg.expand(); }catch(e){} }
    if(CHAPTER.meta && CHAPTER.meta.docTitle){ document.title = CHAPTER.meta.docTitle; }

    var screens = CHAPTER.screens;
    var storageKey = "myzaad_" + (CHAPTER.id || "chapter");

    var state = { answers:{}, checked:{}, score:0, maxScore:0 };
    function save(){ try{ localStorage.setItem(storageKey, JSON.stringify(state)); }catch(e){} }
    function load(){
      try{
        var raw = localStorage.getItem(storageKey);
        if(raw){
          var parsed = JSON.parse(raw);
          state.answers = parsed.answers || {};
          state.checked = parsed.checked || {};
          state.score = parsed.score || 0;
          state.maxScore = parsed.maxScore || 0;
        }
      }catch(e){}
    }
    load();

    // Своя прокрутка: behavior:"smooth" молча не работает в части окружений,
    // включая встроенные панели, а движение здесь обязано состояться.
    function glide(distance, instant){
      var from = window.pageYOffset;
      if(instant){ window.scrollTo(0, from + distance); return; }
      var start = null, dur = 320;
      function step(now){
        if(start === null) start = now;
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3); // то же экспоненциальное замедление, что у выдержки
        window.scrollTo(0, from + distance * eased);
        if(t < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    // Скобка должна упираться в строку, которой выдержка отвечает, а не в верх колонки.
    var TIED = [];
    function tie(id, target){
      var exc = document.getElementById("excerpt_" + id);
      if(!exc || !target) return;
      var screenEl = exc.closest ? exc.closest(".screen") : null;
      if(!screenEl) return;

      if(TIED.indexOf(id) === -1) TIED.push(id);
      exc.tieTarget = target;
      // Выдержка остаётся прямым потомком экрана: внутри виджета она попала бы
      // в состав группы переключателей и читалась бы как один из её вариантов.
      if(exc.parentNode !== screenEl) screenEl.appendChild(exc);
      if(target.id || target.getAttribute("data-value") !== null || target.getAttribute("data-i") !== null){
        target.setAttribute("aria-describedby", "excerpt_" + id);
      }

      var narrow = window.matchMedia && window.matchMedia("(max-width: 899px)").matches;
      if(narrow){
        // Скобка идёт вверх по полю от выдержки к строке, которой она отвечает.
        exc.style.marginTop = "";
        var gap = exc.getBoundingClientRect().top - target.getBoundingClientRect().bottom;
        exc.style.setProperty("--tie-h", Math.max(14, Math.round(gap)) + "px");
      } else {
        exc.style.removeProperty("--tie-h");
        var offset = target.getBoundingClientRect().top - screenEl.getBoundingClientRect().top;
        exc.style.marginTop = Math.max(0, Math.round(offset)) + "px";
      }
    }

    // Привязка — измеренная величина, поэтому её пересчитывают при смене ширины.
    var retieTimer = null;
    function retie(){
      if(retieTimer) window.clearTimeout(retieTimer);
      retieTimer = window.setTimeout(function(){
        TIED.forEach(function(id){
          var exc = document.getElementById("excerpt_" + id);
          if(exc && exc.tieTarget && exc.classList.contains("show")) tie(id, exc.tieTarget);
        });
      }, 120);
    }
    window.addEventListener("resize", retie);
    if(window.matchMedia){
      var mq = window.matchMedia("(max-width: 899px)");
      if(mq.addEventListener) mq.addEventListener("change", retie);
      else if(mq.addListener) mq.addListener(retie);
    }

    // После проверки: кнопка отработала, выдержка не должна остаться за колофоном.
    function settle(id){
      var btn = document.getElementById("check_" + id);
      if(btn){ btn.disabled = true; btn.setAttribute("aria-disabled", "true"); }
      var exc = document.getElementById("excerpt_" + id);
      if(exc && window.matchMedia && window.matchMedia("(max-width: 899px)").matches){
        var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setTimeout(function(){
          var bar = document.querySelector(".colophon");
          var barTop = bar ? bar.getBoundingClientRect().top : window.innerHeight;
          var overlap = exc.getBoundingClientRect().bottom - barTop + 16;
          if(overlap <= 0) return;
          glide(overlap, reduce);
        }, 60);
      }
    }

    function showError(id, text){
      var el = document.getElementById("err_" + id);
      if(el){ el.textContent = text; el.classList.add("show"); }
    }
    function hideError(id){
      var el = document.getElementById("err_" + id);
      if(el){ el.classList.remove("show"); }
    }

    // ---------- content blocks (reusable inside any screen) ----------

    function renderFlowMarkup(flow){
      var html = "";
      if(flow.caption) html += '<p class="diagram-caption">' + flow.caption + "</p>";
      html += '<div class="flow-diagram">';
      (flow.steps || []).forEach(function(step, i){
        if(i > 0){
          html += '<div class="flow-arrow"><svg width="16" height="14" viewBox="0 0 16 14"><path d="M8 0 V10 M2 6 L8 12 L14 6" stroke="var(--rubric)" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
        }
        var cls = "flow-box" + (step.variant ? " " + step.variant : "");
        html += '<div class="' + cls + '">' + step.text + "</div>";
      });
      html += "</div>";
      return html;
    }

    function renderPromptCard(b){
      var html = '<div class="prompt-card">';
      if(b.title) html += '<p class="prompt-text" style="margin-bottom:12px;"><strong>' + b.title + "</strong></p>";
      if(b.text) html += '<p class="prompt-text">' + b.text + "</p>";
      if(b.flow) html += renderFlowMarkup(b.flow);
      html += "</div>";
      return html;
    }

    function renderTriptychMarkup(items){
      var html = '<div class="triptych">';
      items.forEach(function(it){
        html += '<div class="triptych-block ' + it.colorClass + '"><p class="triptych-title">' + it.title + '</p><p class="triptych-sub">' + it.sub + "</p></div>";
      });
      html += "</div>";
      return html;
    }

    // Рубрики-марки: рисуем, а не берём глиф. Один штрих, один вес.
    var MARKS = {
      rosette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="12" cy="12" r="3.4"/><path d="M12 2.6v4M12 17.4v4M2.6 12h4M17.4 12h4M5.3 5.3l2.9 2.9M15.8 15.8l2.9 2.9M18.7 5.3l-2.9 2.9M8.2 15.8l-2.9 2.9"/></svg>',
      pin:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 21v-7"/><path d="M7.5 3.5h9l-1.2 6.2 2.4 2.3v2H6.3v-2l2.4-2.3z"/></svg>',
      mind:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 4.2c-2.2 0-3.6 1.4-3.8 3-1.6.4-2.6 1.7-2.6 3.3 0 1 .4 1.9 1.1 2.5-.3.5-.5 1.1-.5 1.8 0 1.9 1.5 3.4 3.4 3.4.9 0 1.7-.3 2.4-.9"/><path d="M12 4.2c2.2 0 3.6 1.4 3.8 3 1.6.4 2.6 1.7 2.6 3.3 0 1-.4 1.9-1.1 2.5.3.5.5 1.1.5 1.8 0 1.9-1.5 3.4-3.4 3.4-.9 0-1.7-.3-2.4-.9"/><path d="M12 4.2V20"/></svg>',
      note:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M5.5 3.5h13v17h-13z"/><path d="M8.6 8h6.8M8.6 11.6h6.8M8.6 15.2h4.2"/></svg>',
      audio:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4.5 14.5v-2.8a7.5 7.5 0 0 1 15 0v2.8"/><path d="M4.5 13.4h2.1v5.1H5.6a1.1 1.1 0 0 1-1.1-1.1z"/><path d="M19.5 13.4h-2.1v5.1h1a1.1 1.1 0 0 0 1.1-1.1z"/></svg>',
      arrow:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 12h15M13.5 6.5 19.8 12l-6.3 5.5"/></svg>',
      down:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M12 4v15M6.5 13.5 12 19.8l5.5-6.3"/></svg>',
      tick:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m4.5 12.5 5 5 10-11"/></svg>'
    };
    function mark(name){ return MARKS[name] || MARKS.rosette; }
    function markFor(hint){
      var s = String(hint || "");
      if(s.indexOf("📌") > -1) return "pin";
      if(s.indexOf("🧠") > -1) return "mind";
      if(s.indexOf("📝") > -1 || s.indexOf("📓") > -1) return "note";
      return "rosette";
    }

    function renderBlock(b){
      switch(b.type){
        case "eyebrow":
          // Рубрика поднимается в колонтитул (см. render), над заголовком её нет.
          return "";
        case "title":
          var tag = b.tag || "h2";
          return "<" + tag + ">" + b.text + "</" + tag + ">";
        case "iconBadge":
          return '<div class="icon-badge" aria-hidden="true">' + mark(markFor(b.icon)) + "</div>";
        case "slogan":
          return '<p class="slogan">' + b.text + "</p>";
        case "lede":
          return '<p class="lede"' + (b.tight ? ' style="margin-bottom:4px;"' : "") + ">" + b.text + "</p>";
        case "hint":
          return '<p class="prompt-hint" style="margin-top:4px;">' + b.text + "</p>";
        case "audioLink":
          return '<a class="audio-link" href="' + b.href + '" data-audio-link="1"><span class="audio-icon" aria-hidden="true">' + mark("audio") + '</span><span>' + b.label + '</span><span class="audio-arrow" aria-hidden="true">' + mark("arrow") + '</span></a>';
        case "quoteCard":
          return '<div class="card">' +
            (b.ar ? '<p class="quote-ar" lang="ar" dir="rtl">' + b.ar + "</p>" : "") +
            (b.ru ? '<p class="quote-ru">' + b.ru + "</p>" : "") +
            (b.src ? '<p class="quote-src">' + b.src + "</p>" : "") +
            "</div>";
        case "listCard":
          return '<div class="card"><p class="quote-ru" style="margin-bottom:8px;">' + b.intro + '</p><ul class="quote-list">' +
            b.items.map(function(i){ return "<li>" + i + "</li>"; }).join("") +
            '</ul><p class="quote-src">' + b.src + "</p></div>";
        case "flowDiagram":
          return '<div class="card">' + renderFlowMarkup(b) + "</div>";
        case "notebookCallout":
          return '<div class="notebook-callout"><span class="icon" aria-hidden="true">' + mark(markFor(b.icon)) + '</span><div><p>' + b.intro + "</p>" +
            (b.items ? '<ul>' + b.items.map(function(i){ return "<li>" + i + "</li>"; }).join("") + "</ul>" : "") +
            (b.outro ? '<p style="margin-top:8px;">' + b.outro + "</p>" : "") +
            "</div></div>";
        case "timeline":
          return '<div class="timeline">' + b.steps.map(function(step, i){
            return '<div class="timeline-step"><div class="timeline-num">' + (i + 1) + '</div><div class="timeline-body"><p class="timeline-title">' + step.title + '</p><p class="timeline-desc">' + step.desc + "</p></div></div>";
          }).join("") + "</div>";
        case "principleBox":
          return '<div class="principle-box"><p class="principle-text">' + b.text + "</p></div>";
        case "citationBox":
          return '<div class="citation-box"><p class="citation-text">' + b.text + '</p><p class="citation-src">' + b.src + "</p></div>";
        case "promptCard":
          return renderPromptCard(b);
        case "triptych":
          return renderTriptychMarkup(b.items);
        case "html":
          return b.html;
        default:
          return "";
      }
    }

    function renderBlocks(blocks){
      return (blocks || []).map(renderBlock).join("");
    }

    function renderExcerptBox(id, text){
      return '<div class="excerpt-box" id="excerpt_' + id + '"><p class="excerpt-label">Выдержка из текста</p><p class="excerpt-text">' + text + '</p></div>';
    }

    // ---------- question-type screen renderers ----------

    var TYPES = {};

    TYPES["single-choice"] = {
      render: function(screen){
        var html = '<div class="option-list" role="radiogroup" id="widget_' + screen.id + '">';
        screen.options.forEach(function(opt){
          html += '<button class="option" type="button" role="radio" aria-checked="false" data-value="' + opt.value + '"><span class="dot" aria-hidden="true"></span>' + opt.label + "</button>";
        });
        html += "</div>";
        if(screen.checkable){
          html += '<button class="btn-check" id="check_' + screen.id + '">Проверить</button>';
          if(screen.excerpt) html += renderExcerptBox(screen.id, screen.excerpt);
        }
        html += '<p class="error-msg" role="alert" id="err_' + screen.id + '"></p>';
        return html;
      },
      bind: function(screen){
        var container = document.getElementById("widget_" + screen.id);
        function markSelection(){
          container.querySelectorAll(".option").forEach(function(b){
            var on = b.getAttribute("data-value") === state.answers[screen.id];
            b.classList.toggle("selected", on);
            b.setAttribute("aria-checked", on ? "true" : "false");
          });
        }
        function applyFeedback(){
          container.querySelectorAll(".option").forEach(function(btn){
            var v = btn.getAttribute("data-value");
            btn.classList.remove("correct-mark", "wrong-mark");
            if(v === screen.correct) btn.classList.add("correct-mark");
            else if(v === state.answers[screen.id]) btn.classList.add("wrong-mark");
          });
          var exc = document.getElementById("excerpt_" + screen.id);
          if(exc){
            // Показать до привязки: у скрытого блока нет геометрии, и скобку нечем мерить.
            exc.classList.add("show");
            tie(screen.id, container.querySelector(".option.correct-mark") || container);
          }
        }
        markSelection();
        container.querySelectorAll(".option").forEach(function(btn){
          btn.addEventListener("click", function(){
            state.answers[screen.id] = btn.getAttribute("data-value");
            container.querySelectorAll(".option").forEach(function(b){ b.classList.remove("selected", "correct-mark", "wrong-mark"); b.setAttribute("aria-checked", "false"); });
            btn.classList.add("selected");
            btn.setAttribute("aria-checked", "true");
            var exc = document.getElementById("excerpt_" + screen.id);
            if(exc) exc.classList.remove("show");
            hideError(screen.id);
            state.checked[screen.id] = false;
            save();
          });
        });
        if(screen.checkable){
          if(state.checked[screen.id]){
            applyFeedback();
            settle(screen.id);
          }
          document.getElementById("check_" + screen.id).addEventListener("click", function(){
            if(!state.answers[screen.id]){ showError(screen.id, screen.errorRequired || MSG_REQUIRED); return; }
            hideError(screen.id);
            state.checked[screen.id] = true;
            save();
            applyFeedback();
          settle(screen.id);
          });
        }
      },
      validate: function(screen){
        if(!state.answers[screen.id]){ showError(screen.id, screen.errorRequired || MSG_REQUIRED); return false; }
        if(screen.checkable && !state.checked[screen.id]){ showError(screen.id, screen.errorCheck || MSG_CHECK); return false; }
        hideError(screen.id);
        return true;
      },
      score: function(screen){
        if(screen.correct === undefined) return null;
        return { score: state.answers[screen.id] === screen.correct ? 1 : 0, max: 1 };
      }
    };

    TYPES["true-false"] = {
      render: function(screen){
        var html = '<div id="widget_' + screen.id + '">';
        screen.items.forEach(function(item, i){
          html += '<div class="tf-item" data-i="' + i + '">' +
            '<p class="tf-statement">' + item.statement + "</p>" +
            '<div class="tf-buttons">' +
              '<button class="tf-btn" type="button" aria-pressed="false" data-i="' + i + '" data-val="true">Верно</button>' +
              '<button class="tf-btn" type="button" aria-pressed="false" data-i="' + i + '" data-val="false">Неверно</button>' +
            "</div>" +
            (item.excerpt ? renderExcerptBox(screen.id + "_" + i, item.excerpt) : "") +
            "</div>";
        });
        html += "</div>";
        html += '<button class="btn-check" id="check_' + screen.id + '">Проверить</button>';
        html += '<p class="error-msg" role="alert" id="err_' + screen.id + '"></p>';
        return html;
      },
      bind: function(screen){
        var container = document.getElementById("widget_" + screen.id);
        var items = container.querySelectorAll(".tf-item");
        var answers = state.answers[screen.id] || (state.answers[screen.id] = {});

        function applyFeedback(){
          screen.items.forEach(function(item, i){
            var userVal = answers[i];
            var correct = userVal === item.answer;
            var el = items[i];
            el.classList.remove("correct", "incorrect");
            el.classList.add(correct ? "correct" : "incorrect");
            el.querySelectorAll(".tf-btn").forEach(function(btn){
              var val = btn.getAttribute("data-val") === "true";
              btn.classList.remove("right", "wrong");
              if(val === item.answer) btn.classList.add("right");
              else if(val === userVal) btn.classList.add("wrong");
            });
            var exc = el.querySelector(".excerpt-box");
            if(exc) exc.classList.add("show");
          });
        }

        items.forEach(function(el, i){
          var val = answers[i];
          if(val !== undefined){
            el.querySelectorAll(".tf-btn").forEach(function(b){
              if((b.getAttribute("data-val") === "true") === val) b.classList.add("chosen");
            });
          }
        });
        if(state.checked[screen.id]){
          applyFeedback();
          settle(screen.id);
        }

        container.querySelectorAll(".tf-btn").forEach(function(btn){
          btn.addEventListener("click", function(){
            if(state.checked[screen.id]) return;
            var i = btn.getAttribute("data-i");
            var val = btn.getAttribute("data-val") === "true";
            answers[i] = val;
            var item = btn.closest(".tf-item");
            item.classList.remove("correct", "incorrect");
            var exc = item.querySelector(".excerpt-box");
            if(exc) exc.classList.remove("show");
            item.querySelectorAll(".tf-btn").forEach(function(b){ b.classList.remove("right", "wrong", "chosen"); });
            btn.classList.add("chosen");
            item.querySelectorAll(".tf-btn").forEach(function(b){ b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
            save();
          });
        });
        document.getElementById("check_" + screen.id).addEventListener("click", function(){
          if(Object.keys(answers).length < screen.items.length){ showError(screen.id, screen.errorRequired || MSG_REQUIRED); return; }
          hideError(screen.id);
          state.checked[screen.id] = true;
          save();
          applyFeedback();
          settle(screen.id);
        });
      },
      validate: function(screen){
        var answers = state.answers[screen.id] || {};
        if(Object.keys(answers).length < screen.items.length){ showError(screen.id, screen.errorRequired || MSG_REQUIRED); return false; }
        if(!state.checked[screen.id]){ showError(screen.id, screen.errorCheck || MSG_CHECK); return false; }
        hideError(screen.id);
        return true;
      },
      score: function(screen){
        var answers = state.answers[screen.id] || {};
        var score = 0;
        screen.items.forEach(function(item, i){ if(answers[i] === item.answer) score++; });
        return { score: score, max: screen.items.length };
      }
    };

    TYPES["ordering"] = {
      render: function(screen){
        var n = screen.items.length;
        var html = '<div id="widget_' + screen.id + '">';
        for(var pos = 1; pos <= n; pos++){
          html += '<div class="order-row"><select data-pos="' + pos + '"><option value="">Место ' + pos + "</option>" +
            screen.items.map(function(it){ return '<option value="' + it.value + '">' + it.label + "</option>"; }).join("") +
            "</select></div>";
        }
        html += "</div>";
        html += '<button class="btn-check" id="check_' + screen.id + '">Проверить</button>';
        if(screen.excerpt) html += renderExcerptBox(screen.id, screen.excerpt);
        html += '<p class="error-msg" role="alert" id="err_' + screen.id + '"></p>';
        return html;
      },
      bind: function(screen){
        var container = document.getElementById("widget_" + screen.id);
        var order = state.answers[screen.id] || (state.answers[screen.id] = {});
        function applyFeedback(){
          container.querySelectorAll("select").forEach(function(sel, idx){
            sel.classList.remove("select-correct", "select-wrong");
            if(sel.value === screen.correctOrder[idx]) sel.classList.add("select-correct");
            else sel.classList.add("select-wrong");
          });
          var exc = document.getElementById("excerpt_" + screen.id);
          if(exc) exc.classList.add("show");
        }
        container.querySelectorAll("select").forEach(function(sel){
          sel.value = order[sel.getAttribute("data-pos")] || "";
          sel.addEventListener("change", function(){
            order[sel.getAttribute("data-pos")] = sel.value;
            sel.classList.remove("select-correct", "select-wrong");
            var exc = document.getElementById("excerpt_" + screen.id);
            if(exc) exc.classList.remove("show");
            state.checked[screen.id] = false;
            save();
          });
        });
        document.getElementById("check_" + screen.id).addEventListener("click", function(){
          var filled = screen.items.every(function(_, idx){ return !!order[idx + 1]; });
          if(!filled){ showError(screen.id, screen.errorRequired || MSG_REQUIRED); return; }
          hideError(screen.id);
          state.checked[screen.id] = true;
          save();
          applyFeedback();
          settle(screen.id);
        });
        if(state.checked[screen.id]){
          applyFeedback();
          settle(screen.id);
        }
      },
      validate: function(screen){
        var order = state.answers[screen.id] || {};
        var filled = screen.items.every(function(_, idx){ return !!order[idx + 1]; });
        if(!filled){ showError(screen.id, screen.errorRequired || MSG_REQUIRED); return false; }
        if(!state.checked[screen.id]){ showError(screen.id, screen.errorCheck || MSG_CHECK); return false; }
        hideError(screen.id);
        return true;
      },
      score: function(screen){
        var order = state.answers[screen.id] || {};
        var score = 0;
        screen.correctOrder.forEach(function(val, idx){ if(order[idx + 1] === val) score++; });
        return { score: score, max: screen.correctOrder.length };
      }
    };

    TYPES["fill-blank"] = {
      render: function(screen){
        var html = '<div id="widget_' + screen.id + '">';
        screen.items.forEach(function(item, i){
          var opts = '<option value="">...</option>' + item.options.map(function(o){ return '<option value="' + o.value + '">' + o.label + "</option>"; }).join("");
          html += '<div class="fill-item">' +
            '<p class="fill-sentence">' + item.before + '<select data-i="' + i + '">' + opts + "</select>" + item.after + "</p>" +
            (item.excerpt ? renderExcerptBox(screen.id + "_" + i, item.excerpt) : "") +
            "</div>";
        });
        html += "</div>";
        html += '<button class="btn-check" id="check_' + screen.id + '">Проверить</button>';
        html += '<p class="error-msg" role="alert" id="err_' + screen.id + '"></p>';
        if(screen.summary){
          html += '<div class="triptych" id="summary_' + screen.id + '" style="display:none;">';
          screen.summary.forEach(function(it){
            html += '<div class="triptych-block ' + it.colorClass + '"><p class="triptych-title">' + it.title + '</p><p class="triptych-sub">' + it.sub + "</p></div>";
          });
          html += "</div>";
        }
        return html;
      },
      bind: function(screen){
        var container = document.getElementById("widget_" + screen.id);
        var fillState = state.answers[screen.id] || (state.answers[screen.id] = {});
        var fillItems = container.querySelectorAll(".fill-item");
        function applyFeedback(){
          fillItems.forEach(function(el, i){
            var sel = el.querySelector("select");
            sel.classList.remove("select-correct", "select-wrong");
            if(sel.value === screen.items[i].correct) sel.classList.add("select-correct");
            else sel.classList.add("select-wrong");
            var exc = el.querySelector(".excerpt-box");
            if(exc) exc.classList.add("show");
          });
          var summary = document.getElementById("summary_" + screen.id);
          if(summary) summary.style.display = "block";
        }
        container.querySelectorAll("select").forEach(function(sel){
          sel.value = fillState[sel.getAttribute("data-i")] || "";
          sel.addEventListener("change", function(){
            fillState[sel.getAttribute("data-i")] = sel.value;
            sel.classList.remove("select-correct", "select-wrong");
            var exc = sel.closest(".fill-item").querySelector(".excerpt-box");
            if(exc) exc.classList.remove("show");
            var summary = document.getElementById("summary_" + screen.id);
            if(summary) summary.style.display = "none";
            state.checked[screen.id] = false;
            save();
          });
        });
        document.getElementById("check_" + screen.id).addEventListener("click", function(){
          var filled = screen.items.every(function(_, i){ return !!fillState[i]; });
          if(!filled){ showError(screen.id, screen.errorRequired || MSG_REQUIRED); return; }
          hideError(screen.id);
          state.checked[screen.id] = true;
          save();
          applyFeedback();
          settle(screen.id);
        });
        if(state.checked[screen.id]){
          applyFeedback();
          settle(screen.id);
        }
      },
      validate: function(screen){
        var fillState = state.answers[screen.id] || {};
        var filled = screen.items.every(function(_, i){ return !!fillState[i]; });
        if(!filled){ showError(screen.id, screen.errorRequired || MSG_REQUIRED); return false; }
        if(!state.checked[screen.id]){ showError(screen.id, screen.errorCheck || MSG_CHECK); return false; }
        hideError(screen.id);
        return true;
      },
      score: function(screen){
        var fillState = state.answers[screen.id] || {};
        var score = 0;
        screen.items.forEach(function(item, i){ if(fillState[i] === item.correct) score++; });
        return { score: score, max: screen.items.length };
      }
    };

    TYPES["multi-select"] = {
      render: function(screen){
        var html = '<div class="check-list" id="widget_' + screen.id + '">';
        screen.items.forEach(function(item, i){
          html += '<div class="check-item" role="checkbox" tabindex="0" aria-checked="false" data-i="' + i + '"><div class="check-box" aria-hidden="true">' + mark("tick") + '</div><div class="check-text">' + item.label + "</div></div>";
        });
        html += "</div>";
        html += '<button class="btn-check" id="check_' + screen.id + '">Проверить</button>';
        if(screen.excerpt) html += renderExcerptBox(screen.id, screen.excerpt);
        html += '<p class="error-msg" role="alert" id="err_' + screen.id + '"></p>';
        return html;
      },
      bind: function(screen){
        var container = document.getElementById("widget_" + screen.id);
        var chosen = state.answers[screen.id] || (state.answers[screen.id] = {});
        function applyFeedback(){
          screen.items.forEach(function(item, i){
            var div = container.querySelector('[data-i="' + i + '"]');
            div.classList.remove("correct-mark", "wrong-mark");
            var isChosen = !!chosen[i];
            if(item.correct) div.classList.add("correct-mark");
            else if(isChosen) div.classList.add("wrong-mark");
          });
          var exc = document.getElementById("excerpt_" + screen.id);
          if(exc){
            exc.classList.add("show");
            tie(screen.id, container.querySelector(".check-item.correct-mark") || container);
          }
        }
        container.querySelectorAll(".check-item").forEach(function(div){
          var i = div.getAttribute("data-i");
          div.classList.toggle("selected", !!chosen[i]);
          div.setAttribute("aria-checked", chosen[i] ? "true" : "false");
          div.addEventListener("keydown", function(e){
            if(e.key === " " || e.key === "Enter"){ e.preventDefault(); div.click(); }
          });
          div.addEventListener("click", function(){
            chosen[i] = !chosen[i];
            div.classList.toggle("selected", !!chosen[i]);
            div.setAttribute("aria-checked", chosen[i] ? "true" : "false");
            div.classList.remove("correct-mark", "wrong-mark");
            var exc = document.getElementById("excerpt_" + screen.id);
            if(exc) exc.classList.remove("show");
            state.checked[screen.id] = false;
            save();
          });
        });
        document.getElementById("check_" + screen.id).addEventListener("click", function(){
          var any = Object.keys(chosen).some(function(k){ return chosen[k]; });
          if(!any){ showError(screen.id, screen.errorRequired || MSG_REQUIRED); return; }
          hideError(screen.id);
          state.checked[screen.id] = true;
          save();
          applyFeedback();
          settle(screen.id);
        });
        if(state.checked[screen.id]){
          applyFeedback();
          settle(screen.id);
        }
      },
      validate: function(screen){
        var chosen = state.answers[screen.id] || {};
        var any = Object.keys(chosen).some(function(k){ return chosen[k]; });
        if(!any){ showError(screen.id, screen.errorRequired || MSG_REQUIRED); return false; }
        if(!state.checked[screen.id]){ showError(screen.id, screen.errorCheck || MSG_CHECK); return false; }
        hideError(screen.id);
        return true;
      },
      score: function(screen){
        var chosen = state.answers[screen.id] || {};
        var score = 0;
        screen.items.forEach(function(item, i){ if(!!chosen[i] === item.correct) score++; });
        return { score: score, max: screen.items.length };
      }
    };

    TYPES["reveal"] = {
      render: function(screen){
        var r = screen.reveal;
        var html = '<button class="btn-reveal" id="revealBtn_' + screen.id + '">' + r.buttonLabel + "</button>";
        html += '<div class="reveal-box" id="revealBox_' + screen.id + '">';
        html += '<ul class="reveal-list">' + r.items.map(function(i){ return "<li>" + i + "</li>"; }).join("") + "</ul>";
        if(r.note) html += '<p class="reveal-note">' + r.note + "</p>";
        if(r.banner) html += '<div class="memorize-banner">' + r.banner + "</div>";
        html += "</div>";
        return html;
      },
      bind: function(screen){
        var btn = document.getElementById("revealBtn_" + screen.id);
        var box = document.getElementById("revealBox_" + screen.id);
        btn.addEventListener("click", function(){
          box.classList.add("show");
          btn.style.display = "none";
        });
      },
      validate: function(){ return true; },
      score: function(){ return null; }
    };

    TYPES["result"] = {
      render: function(screen){
        var html = '<div class="result-hero"><h2>' + screen.completedLabel + '</h2>' +
          '<p class="result-line" role="status"><span class="result-score" id="scoreOut">0 / 0</span> ' + screen.resultLabel + "</p></div>";
        if(screen.note){
          var notes = Array.isArray(screen.note) ? screen.note : [screen.note];
          html += '<div class="card">' + notes.map(function(n){ return '<p class="lede" style="margin-bottom:0;">' + n + "</p>"; }).join("") + "</div>";
        }
        html += '<div class="download-row">';
        screen.downloads.forEach(function(d){
          html += '<button class="btn-download" id="download_' + d.id + '">' + d.label + '<span class="mk" aria-hidden="true">' + mark("down") + "</span></button>";
        });
        html += "</div>";
        return html;
      },
      bind: function(screen){
        screen.downloads.forEach(function(d){
          document.getElementById("download_" + d.id).addEventListener("click", function(){
            var text = d.lines.map(fillTemplate).join("\n");
            downloadFile(d.filename, text, tg);
          });
        });
      },
      validate: function(){ return true; },
      score: function(){ return null; }
    };

    function fillTemplate(line){
      return line
        .replace(/\{\{date\}\}/g, new Date().toLocaleDateString("ru-RU"))
        .replace(/\{\{score\}\}/g, state.score)
        .replace(/\{\{maxScore\}\}/g, state.maxScore);
    }

    function showFallback(filename, text){
      var overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed; inset:0; background:var(--night); color:var(--ink); z-index:999; padding:20px; overflow:auto;";
      overlay.innerHTML =
        '<p style="font-size:13px; color:var(--ink-3); letter-spacing:.02em; margin-bottom:10px;">Скачивание недоступно в этом окне. Выделите и скопируйте текст ниже (' + filename + '):</p>' +
        '<textarea readonly style="width:100%; min-height:60vh; background:var(--night-raise); color:var(--ink); border:1px solid var(--rule); border-radius:2px; padding:12px; font-family:var(--app); font-size:13px; line-height:1.55;"></textarea>' +
        '<button class="btn-download" style="margin-top:12px; width:100%;">Закрыть</button>';
      overlay.querySelector("textarea").value = text;
      overlay.querySelector("button").addEventListener("click", function(){ document.body.removeChild(overlay); });
      document.body.appendChild(overlay);
      overlay.querySelector("textarea").focus();
      overlay.querySelector("textarea").select();
    }

    function downloadFile(filename, text, tg){
      if(tg && typeof tg.downloadFile === "function"){
        try{
          var dataUrl = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
          tg.downloadFile({ url: dataUrl, file_name: filename }, function(accepted){
            if(!accepted) showFallback(filename, text);
          });
          return;
        }catch(e){}
      }
      try{
        var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url; a.download = filename; a.style.display = "none";
        document.body.appendChild(a); a.click();
        setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 1500);
        if(tg){ setTimeout(function(){ showFallback(filename, text); }, 800); }
      }catch(e){
        showFallback(filename, text);
      }
    }

    // ---------- screen assembly ----------

    function renderScreenInner(screen){
      var header = renderBlocks(screen.blocks);
      var type = TYPES[screen.type];
      return header + (type ? type.render(screen) : "");
    }

    var app = document.getElementById("app");
    var screenEls = screens.map(function(screen, idx){
      var section = document.createElement("section");
      section.className = "screen" + (idx === 0 ? " active" : "");
      section.setAttribute("data-screen", idx);
      section.innerHTML = renderScreenInner(screen);
      app.appendChild(section);
      return section;
    });

    screens.forEach(function(screen){
      var type = TYPES[screen.type];
      if(type && type.bind) type.bind(screen);
    });

    document.querySelectorAll("[data-audio-link]").forEach(function(a){
      a.addEventListener("click", function(e){
        if(tg && typeof tg.openTelegramLink === "function"){
          e.preventDefault();
          try{ tg.openTelegramLink(a.getAttribute("href")); }catch(err){ window.open(a.getAttribute("href"), "_blank"); }
        }
      });
    });

    function validateStep(idx){
      var screen = screens[idx];
      var type = TYPES[screen.type];
      if(type && type.validate) return type.validate(screen);
      return true;
    }

    function calculateScore(){
      var score = 0, max = 0;
      screens.forEach(function(screen){
        var type = TYPES[screen.type];
        if(type && type.score){
          var r = type.score(screen);
          if(r){ score += r.score; max += r.max; }
        }
      });
      state.score = score; state.maxScore = max;
      save();
    }

    // ---------- navigation ----------

    var current = 0;
    var progressFill = document.getElementById("progressFill");
    var stepLabel = document.getElementById("stepLabel");
    var stepTotal = document.getElementById("stepTotal");
    var runhead = document.getElementById("runhead");
    var chainEl = document.getElementById("chain");

    // Иснад: откуда пришло знание. Стоит на каждом экране главы.
    if(chainEl){
      var chain = (CHAPTER.meta && CHAPTER.meta.chain) || [];
      chainEl.textContent = chain.join(" → ");
    }
    if(stepTotal){ stepTotal.textContent = pad(screens.length); }

    function pad(n){ return (n < 10 ? "0" : "") + n; }

    // Рубрика экрана поднимается в колонтитул, а не стоит над заголовком.
    function rubricOf(screen){
      var blocks = screen.blocks || [];
      for(var i = 0; i < blocks.length; i++){
        if(blocks[i].type === "eyebrow") return blocks[i].text;
      }
      return "";
    }
    var nextBtn = document.getElementById("nextBtn");
    var backBtn = document.getElementById("backBtn");

    function render(){
      screenEls.forEach(function(s, i){ s.classList.toggle("active", i === current); });
      var pct = Math.round((current / (screenEls.length - 1)) * 100);
      progressFill.style.transform = "scaleX(" + (pct / 100) + ")";
      stepLabel.textContent = pad(current + 1);
      if(runhead) runhead.textContent = rubricOf(screens[current]);
      if(current === 0){
        backBtn.textContent = "Оглавление";
        backBtn.style.visibility = "visible";
      } else {
        backBtn.textContent = "Назад";
        backBtn.style.visibility = "visible";
      }
      if(current === screenEls.length - 1){
        calculateScore();
        nextBtn.textContent = "Готово";
        var scoreOut = document.getElementById("scoreOut");
        if(scoreOut) scoreOut.textContent = state.score + " / " + state.maxScore;
        if(tg){ try{ tg.MainButton.hide(); }catch(e){} }
      } else if(current === 0){
        nextBtn.textContent = "Начать";
      } else {
        nextBtn.textContent = "Далее";
      }
      if(tg){
        try{
          if(current === screenEls.length - 1){ tg.MainButton.hide(); }
          else { tg.MainButton.setText(nextBtn.textContent); tg.MainButton.show(); }
        }catch(e){}
      }
      window.scrollTo(0, 0);
    }

    function goNext(){
      if(current === screenEls.length - 1){
        if(tg){ try{ tg.close(); }catch(e){} }
        return;
      }
      if(!validateStep(current)){ render(); return; }
      current = Math.min(current + 1, screenEls.length - 1);
      render();
    }
    function goBack(){
      if(current === 0){ window.location.href = "index.html"; return; }
      current -= 1;
      render();
    }

    nextBtn.addEventListener("click", goNext);
    backBtn.addEventListener("click", goBack);
    if(tg){
      try{
        tg.MainButton.onClick(goNext);
        tg.BackButton.onClick(function(){ if(current > 0){ goBack(); } });
        tg.BackButton.show();
      }catch(e){}
    }

    render();
  }

  window.MyZaadEngine = { init: init };
})();
