/*
 * MyZaad — конспект главы.
 *
 * Лист собирается из того же chapterN-data.js, что ведёт саму главу, поэтому
 * новая глава получает конспект без единой правки здесь. Ответы читаются из
 * того же хранилища, что ведёт прохождение.
 */
(function(){
  "use strict";

  function esc(s){
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function el(id){ return document.getElementById(id); }

  function rule(label){
    return '<h2 class="k-rule"><span>' + label + "</span></h2>";
  }

  // ---------- схемы ----------

  // Три степени поста — лестница: каждая следующая ступень выше и уже.
  function ladder(items){
    var n = items.length;
    var h = 56 * n + 22;
    var s = '<svg class="k-ladder" viewBox="0 0 520 ' + h + '" role="img" aria-label="Три степени поста по возрастанию">';
    items.forEach(function(item, i){
      var step = n - 1 - i;              // снизу вверх
      var y = 18 + step * 56;
      var x = 10 + i * 26;
      s += '<line x1="' + x + '" y1="' + (y + 34) + '" x2="510" y2="' + (y + 34) + '" class="k-ladder-rule"/>';
      s += '<text x="' + x + '" y="' + (y + 14) + '" class="k-ladder-num">' + (i + 1) + "</text>";
      s += '<text x="' + (x + 26) + '" y="' + (y + 14) + '" class="k-ladder-text">' + esc(item) + "</text>";
    });
    s += "</svg>";
    return s;
  }

  function steps(list){
    var s = '<ol class="k-steps">';
    list.forEach(function(item){
      s += "<li><b>" + item.title + "</b>" + (item.desc ? "<span>" + item.desc + "</span>" : "") + "</li>";
    });
    return s + "</ol>";
  }

  function columns(items){
    var s = '<div class="k-cols">';
    items.forEach(function(it){
      s += '<div class="k-col"><p class="k-col-title">' + it.title + '</p><p class="k-col-sub">' + it.sub + "</p></div>";
    });
    return s + "</div>";
  }

  // ---------- блоки главы ----------

  function block(b){
    switch(b.type){
      case "title":
        return b.tag === "h1" ? "" : "<h3>" + b.text + "</h3>";
      case "lede":
        return "<p>" + b.text + "</p>";
      case "slogan":
        return '<p class="k-slogan">' + b.text + "</p>";
      case "hint":
        return '<p class="k-hint">' + b.text + "</p>";
      case "quoteCard":
        return '<div class="k-quote">' +
          (b.ar ? '<p class="k-ar" lang="ar" dir="rtl">' + b.ar + "</p>" : "") +
          (b.ru ? "<p>" + b.ru + "</p>" : "") +
          (b.src ? '<p class="k-src">' + b.src + "</p>" : "") + "</div>";
      case "listCard":
        return '<div class="k-quote"><p>' + b.intro + "</p><ul>" +
          b.items.map(function(i){ return "<li>" + i + "</li>"; }).join("") +
          '</ul><p class="k-src">' + b.src + "</p></div>";
      case "timeline":
        return steps(b.steps);
      case "principleBox":
        return '<p class="k-principle">' + b.text + "</p>";
      case "citationBox":
        return '<div class="k-quote"><p>' + b.text + '</p><p class="k-src">' + b.src + "</p></div>";
      case "triptych":
        return columns(b.items);
      case "notebookCallout":
        return '<div class="k-quote"><p>' + b.intro + "</p>" +
          (b.items ? "<ul>" + b.items.map(function(i){ return "<li>" + i + "</li>"; }).join("") + "</ul>" : "") +
          (b.outro ? "<p>" + b.outro + "</p>" : "") + "</div>";
      case "flowDiagram":
        return '<ol class="k-flow">' + (b.steps || []).map(function(st){
          return "<li>" + st.text + "</li>";
        }).join("") + "</ol>";
      case "promptCard":
        return '<div class="k-prompt">' +
          (b.title ? "<p><b>" + b.title + "</b></p>" : "") +
          (b.text ? "<p>" + b.text + "</p>" : "") +
          '<div class="k-write"><span></span><span></span><span></span></div></div>';
      default:
        return "";
    }
  }

  function blocks(list, skipLede){
    var drop = ["eyebrow", "iconBadge", "audioLink", "slogan"];
    return (list || []).filter(function(b){
      if(drop.indexOf(b.type) > -1) return false;
      if(skipLede && b.type === "lede") return false;   // лид уже стоит в шапке листа
      return true;
    }).map(block).join("");
  }

  // ---------- проверочные экраны ----------

  function answerOf(state, screen){
    var a = state.answers && state.answers[screen.id];
    if(a === undefined) return null;
    return a;
  }

  function question(screen, state){
    var head = "";
    (screen.blocks || []).forEach(function(b){
      if(b.type === "title") head = b.text;
    });
    var s = '<div class="k-q"><p class="k-q-head">' + head + "</p>";
    var mine = answerOf(state, screen);

    if(screen.type === "single-choice" && screen.correct){
      screen.options.forEach(function(o){
        var right = o.value === screen.correct;
        var chosen = mine === o.value;
        if(right || chosen){
          s += '<p class="k-a' + (right ? " right" : " wrong") + '">' +
            (right ? "Верно: " : "Ваш ответ: ") + o.label + "</p>";
        }
      });
    } else if(screen.type === "true-false"){
      s = '<div class="k-q"><p class="k-q-head">' + head + "</p>";
      screen.items.forEach(function(item, i){
        var ok = mine && mine[i] === item.answer;
        s += '<p class="k-tf' + (item.answer ? "" : " false") + '"><span class="k-tf-mark">' + (item.answer ? "верно" : "неверно") + "</span><span>" +
          item.statement + (mine && mine[i] !== undefined && !ok ? ' <i class="k-miss">— вы ответили иначе</i>' : "") + "</span></p>";
        if(item.excerpt) s += '<p class="k-exc">' + item.excerpt + "</p>";
      });
      return s + "</div>";
    } else if(screen.type === "ordering"){
      s += ladder(screen.correctOrder.map(function(v){
        var found = "";
        screen.items.forEach(function(it){ if(it.value === v) found = it.label; });
        return found;
      }));
    } else if(screen.type === "fill-blank"){
      screen.items.forEach(function(item){
        var right = "";
        item.options.forEach(function(o){ if(o.value === item.correct) right = o.label; });
        s += '<p class="k-a right">' + item.before + "<b>" + right + "</b>" + item.after + "</p>";
        if(item.excerpt) s += '<p class="k-exc">' + item.excerpt + "</p>";
      });
      if(screen.summary) s += columns(screen.summary);
      return s + "</div>";
    } else if(screen.type === "multi-select"){
      var yes = screen.items.filter(function(i){ return i.correct; }).map(function(i){ return i.label; });
      var no = screen.items.filter(function(i){ return !i.correct; }).map(function(i){ return i.label; });
      s += '<p class="k-a right">В лекции названы: ' + yes.join(", ") + ".</p>";
      s += '<p class="k-a wrong">Не названы: ' + no.join(", ") + ".</p>";
    }

    if(screen.excerpt) s += '<p class="k-exc">' + screen.excerpt + "</p>";
    return s + "</div>";
  }

  // ---------- сборка листа ----------

  function build(CHAPTER){
    var state = { answers: {}, score: 0, maxScore: 0 };
    try{
      var raw = localStorage.getItem("myzaad_" + (CHAPTER.id || "chapter"));
      if(raw) state = JSON.parse(raw);
    }catch(e){}

    var meta = CHAPTER.meta || {};
    var title = "", lede = [];
    (CHAPTER.screens[0].blocks || []).forEach(function(b){
      if(b.type === "title" && b.tag === "h1") title = b.text;
      if(b.type === "lede") lede.push(b.text);
    });

    document.title = (meta.docTitle || "MyZaad") + " — конспект";
    el("kTitle").textContent = title;
    el("kTeacher").textContent = meta.teacher || "";
    el("kDate").textContent = new Date().toLocaleDateString("ru-RU");
    el("kScore").textContent = state.maxScore ? (state.score + " из " + state.maxScore) : "глава не завершена";
    el("kLede").innerHTML = lede.join(" ");

    var out = "";
    var qs = "";

    CHAPTER.screens.forEach(function(screen, i){
      if(screen.type === "result") return;
      // Титульный экран несёт аят и перечень имён месяца — в лист они входят,
      // а заголовок с лидом уже стоят в шапке.
      if(i === 0){ out += blocks(screen.blocks, true); return; }

      var isQuiz = ["single-choice", "true-false", "ordering", "fill-blank", "multi-select"].indexOf(screen.type) > -1;
      if(isQuiz){
        if(screen.checkable === false) return;  // опрос о формате — не материал главы
        qs += question(screen, state);
        return;
      }
      if(screen.type === "reveal"){
        out += rule("Что запомнить");
        out += "<ul class=\"k-keep\">" + screen.reveal.items.map(function(x){ return "<li>" + x + "</li>"; }).join("") + "</ul>";
        if(screen.reveal.note) out += '<p class="k-hint">' + screen.reveal.note + "</p>";
        return;
      }
      out += blocks(screen.blocks);
    });

    el("kBody").innerHTML = out;
    el("kQuestions").innerHTML = qs;
    el("kFoot").textContent = (CHAPTER.screens[CHAPTER.screens.length - 1].note || []).join(" ");
  }

  window.MyZaadKonspekt = { build: build };
})();
