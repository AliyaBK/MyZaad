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
          html += '<div class="flow-arrow"><svg width="16" height="14" viewBox="0 0 16 14"><path d="M8 0 V10 M2 6 L8 12 L14 6" stroke="var(--emerald)" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
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

    function renderBlock(b){
      switch(b.type){
        case "eyebrow":
          return '<p class="eyebrow">' + b.text + "</p>";
        case "title":
          var tag = b.tag || "h2";
          return "<" + tag + ">" + b.text + "</" + tag + ">";
        case "iconBadge":
          return '<div class="icon-badge">' + b.icon + "</div>";
        case "slogan":
          return '<p class="slogan">' + b.text + "</p>";
        case "lede":
          return '<p class="lede"' + (b.tight ? ' style="margin-bottom:4px;"' : "") + ">" + b.text + "</p>";
        case "hint":
          return '<p class="prompt-hint" style="margin-top:4px;">' + b.text + "</p>";
        case "audioLink":
          return '<a class="audio-link" href="' + b.href + '" data-audio-link="1"><span class="audio-icon">' + (b.icon || "🎧") + '</span><span>' + b.label + '</span><span class="audio-arrow">→</span></a>';
        case "quoteCard":
          return '<div class="card">' +
            (b.ar ? '<p class="quote-ar">' + b.ar + "</p>" : "") +
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
          return '<div class="notebook-callout"><span class="icon">' + b.icon + '</span><div><p>' + b.intro + "</p>" +
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
      return '<div class="excerpt-box" id="excerpt_' + id + '"><p class="excerpt-label">Выдержка из текста</p><p class="excerpt-text">' + text + '</p><p class="excerpt-time">Тайм-код: —</p></div>';
    }

    // ---------- question-type screen renderers ----------

    var TYPES = {};

    TYPES["single-choice"] = {
      render: function(screen){
        var html = '<div class="option-list" id="widget_' + screen.id + '">';
        screen.options.forEach(function(opt){
          html += '<button class="option" data-value="' + opt.value + '"><span class="dot"></span>' + opt.label + "</button>";
        });
        html += "</div>";
        if(screen.checkable){
          html += '<button class="btn-check" id="check_' + screen.id + '">Проверить</button>';
          if(screen.excerpt) html += renderExcerptBox(screen.id, screen.excerpt);
        }
        html += '<p class="error-msg" id="err_' + screen.id + '"></p>';
        return html;
      },
      bind: function(screen){
        var container = document.getElementById("widget_" + screen.id);
        function markSelection(){
          container.querySelectorAll(".option").forEach(function(b){
            b.classList.toggle("selected", b.getAttribute("data-value") === state.answers[screen.id]);
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
          if(exc) exc.classList.add("show");
        }
        markSelection();
        container.querySelectorAll(".option").forEach(function(btn){
          btn.addEventListener("click", function(){
            state.answers[screen.id] = btn.getAttribute("data-value");
            container.querySelectorAll(".option").forEach(function(b){ b.classList.remove("selected", "correct-mark", "wrong-mark"); });
            btn.classList.add("selected");
            var exc = document.getElementById("excerpt_" + screen.id);
            if(exc) exc.classList.remove("show");
            hideError(screen.id);
            state.checked[screen.id] = false;
            save();
          });
        });
        if(screen.checkable){
          if(state.checked[screen.id]) applyFeedback();
          document.getElementById("check_" + screen.id).addEventListener("click", function(){
            if(!state.answers[screen.id]){ showError(screen.id, screen.errorRequired || MSG_REQUIRED); return; }
            hideError(screen.id);
            state.checked[screen.id] = true;
            save();
            applyFeedback();
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
              '<button class="tf-btn" data-i="' + i + '" data-val="true">Верно</button>' +
              '<button class="tf-btn" data-i="' + i + '" data-val="false">Неверно</button>' +
            "</div>" +
            (item.excerpt ? renderExcerptBox(screen.id + "_" + i, item.excerpt) : "") +
            "</div>";
        });
        html += "</div>";
        html += '<button class="btn-check" id="check_' + screen.id + '">Проверить</button>';
        html += '<p class="error-msg" id="err_' + screen.id + '"></p>';
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
        if(state.checked[screen.id]) applyFeedback();

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
            save();
          });
        });
        document.getElementById("check_" + screen.id).addEventListener("click", function(){
          if(Object.keys(answers).length < screen.items.length){ showError(screen.id, screen.errorRequired || MSG_REQUIRED); return; }
          hideError(screen.id);
          state.checked[screen.id] = true;
          save();
          applyFeedback();
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
        html += '<p class="error-msg" id="err_' + screen.id + '"></p>';
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
        });
        if(state.checked[screen.id]) applyFeedback();
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
        html += '<p class="error-msg" id="err_' + screen.id + '"></p>';
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
        });
        if(state.checked[screen.id]) applyFeedback();
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
          html += '<div class="check-item" data-i="' + i + '"><div class="check-box"><i>&#10003;</i></div><div class="check-text">' + item.label + "</div></div>";
        });
        html += "</div>";
        html += '<button class="btn-check" id="check_' + screen.id + '">Проверить</button>';
        if(screen.excerpt) html += renderExcerptBox(screen.id, screen.excerpt);
        html += '<p class="error-msg" id="err_' + screen.id + '"></p>';
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
          if(exc) exc.classList.add("show");
        }
        container.querySelectorAll(".check-item").forEach(function(div){
          var i = div.getAttribute("data-i");
          div.classList.toggle("selected", !!chosen[i]);
          div.addEventListener("click", function(){
            chosen[i] = !chosen[i];
            div.classList.toggle("selected", !!chosen[i]);
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
        });
        if(state.checked[screen.id]) applyFeedback();
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
        var html = '<div class="result-hero"><p class="eyebrow">' + screen.completedLabel + '</p><div class="result-score" id="scoreOut">0 / 0</div><p class="result-label">' + screen.resultLabel + "</p></div>";
        if(screen.note){
          var notes = Array.isArray(screen.note) ? screen.note : [screen.note];
          html += '<div class="card">' + notes.map(function(n){ return '<p class="lede" style="margin-bottom:0;">' + n + "</p>"; }).join("") + "</div>";
        }
        html += '<div class="download-row">';
        screen.downloads.forEach(function(d){
          html += '<button class="btn-download" id="download_' + d.id + '">' + d.label + "</button>";
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
      overlay.style.cssText = "position:fixed; inset:0; background:var(--bg); z-index:999; padding:20px; overflow:auto;";
      overlay.innerHTML =
        '<p style="font-size:13px; color:var(--ink-faint); margin-bottom:10px;">Скачивание недоступно в этом окне. Выделите и скопируйте текст ниже (' + filename + '):</p>' +
        '<textarea readonly style="width:100%; min-height:60vh; font-family:monospace; font-size:12.5px;"></textarea>' +
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
    var nextBtn = document.getElementById("nextBtn");
    var backBtn = document.getElementById("backBtn");

    function render(){
      screenEls.forEach(function(s, i){ s.classList.toggle("active", i === current); });
      var pct = Math.round((current / (screenEls.length - 1)) * 100);
      progressFill.style.width = pct + "%";
      stepLabel.textContent = (current + 1) + " / " + screenEls.length;
      backBtn.style.visibility = current === 0 ? "hidden" : "visible";
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
    function goBack(){ if(current === 0) return; current -= 1; render(); }

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
