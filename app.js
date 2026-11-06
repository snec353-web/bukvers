(function () {
  'use strict';
  var BV = window.BV;
  var F = BV.formats;
  var main = document.getElementById('main');

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function store(key, val) {
    try {
      if (val === undefined) { var v = localStorage.getItem('bv:' + key); return v ? JSON.parse(v) : null; }
      localStorage.setItem('bv:' + key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3200);
  }
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }
  function paras(list, cls) { return list.map(function (p) { return '<p' + (cls ? ' class="' + cls + '"' : '') + '>' + esc(p) + '</p>'; }).join(''); }

  var ICONS = {
    tales: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    choice: '<path d="M6 3v6a6 6 0 0 0 6 6h6"/><path d="M6 21v-4"/><path d="M15 12l3 3-3 3"/>',
    short: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/>',
    serials: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>'
  };
  var ARROW_L = '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>';

  function motif(kind, bg) {
    if (kind === 'tales') return '<svg viewBox="0 0 300 400" aria-hidden="true"><circle cx="220" cy="80" r="34" fill="#F2B45A"/><circle cx="234" cy="70" r="31" fill="' + bg + '"/><circle cx="60" cy="60" r="3" fill="#F3EBDD"/><circle cx="120" cy="110" r="2" fill="#F3EBDD"/><circle cx="170" cy="40" r="2.5" fill="#F3EBDD"/><circle cx="270" cy="160" r="2" fill="#F3EBDD"/><path d="M0 230 Q80 180 150 215 T300 200 V400 H0z" fill="rgba(0,0,0,.18)"/></svg>';
    if (kind === 'choice') return '<svg viewBox="0 0 300 400" aria-hidden="true"><path d="M150 400 V250 Q150 200 90 170 M150 250 Q150 200 210 170" fill="none" stroke="rgba(243,235,221,.55)" stroke-width="6" stroke-linecap="round"/><circle cx="90" cy="170" r="10" fill="#F2B45A"/><circle cx="210" cy="170" r="10" fill="rgba(243,235,221,.7)"/></svg>';
    if (kind === 'short') return '<svg viewBox="0 0 300 400" aria-hidden="true"><circle cx="220" cy="90" r="46" fill="none" stroke="rgba(243,235,221,.55)" stroke-width="6"/><path d="M220 62v28l16 14" fill="none" stroke="#F2B45A" stroke-width="6" stroke-linecap="round"/></svg>';
    return '<svg viewBox="0 0 300 400" aria-hidden="true"><path d="M150 230V150l60-44 60 44v80z" fill="rgba(0,0,0,.2)"/><rect x="196" y="160" width="28" height="32" fill="#F2B45A"/></svg>';
  }
  function bcard(o) {
    var tag = o.soon ? '<span class="tag soon">Скоро</span>' : (o.tag ? '<span class="tag">' + esc(o.tag) + '</span>' : '');
    var inner = '<div class="cv" style="background:' + o.color + '">' + motif(o.kind, o.color) + tag + '<b>' + esc(o.title) + '</b></div><span class="meta">' + esc(o.meta) + '</span>';
    if (o.soon) return '<button type="button" class="bcard soon" data-soon="' + esc(o.title) + '">' + inner + '</button>';
    return '<a class="bcard" href="' + o.href + '">' + inner + '</a>';
  }

  /* ---------- reader settings ---------- */
  function rset() { return store('reader') || { fs: 19, dark: false }; }
  function readerShell(backHref, title, body) {
    var s = rset();
    return '<div class="reader' + (s.dark ? ' dark' : '') + '" style="--fs:' + s.fs + 'px">' +
      '<div class="reader-bar"><div class="wrap">' +
      '<a class="ic" href="' + backHref + '" aria-label="Назад">' + ARROW_L + '</a>' +
      '<span class="rb-title">' + esc(title) + '</span>' +
      '<div class="r-tools"><button type="button" class="ic" data-fs="-1" aria-label="Уменьшить текст">A−</button>' +
      '<button type="button" class="ic" data-fs="1" aria-label="Увеличить текст">A+</button>' +
      '<button type="button" class="ic" data-theme aria-label="Сменить тему"><svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg></button></div>' +
      '</div></div><article class="page">' + body + '</article></div>';
  }

  /* ---------- home ---------- */
  function homeArt(k) {
    var f = F[k];
    if (k === 'tales') {
      return '<div class="art"><div class="art-cover" style="background:' + f.color + '">' + motif('tales', f.color) +
        '<div><span class="eyebrow" style="color:#F2B45A">Сказка для Марка, 6 лет</span><b>' + esc(f.examples[0]) + '</b><span style="color:' + f.soft + '">Тема: драконы и волшебство</span></div></div></div>';
    }
    if (k === 'choice') {
      var st = BV.stories[0], n = st.nodes.start;
      return '<div class="art"><div class="paper"><span class="eyebrow" style="color:' + f.color + '">' + esc(st.title) + '</span>' +
        '<p>' + esc(n.text[1]) + '</p><span class="eyebrow" style="color:' + f.color + ';font-size:12px">Что ты сделаешь?</span>' +
        '<span class="opt on">А. ' + esc(n.choices[0].text) + '</span><span class="opt">Б. ' + esc(n.choices[1].text) + '</span></div></div>';
    }
    if (k === 'short') {
      var b = BV.books[0];
      return '<div class="art"><div class="listcard"><div style="aspect-ratio:16/9;border-radius:14px;background:' + f.color + ';display:flex;align-items:flex-end;padding:16px;position:relative;overflow:hidden">' +
        '<b class="disp" style="font-size:26px;line-height:1.08;position:relative">' + esc(b.title) + '</b></div>' +
        '<span style="color:var(--dim);font-size:14px">' + b.minutes + ' минут · ' + b.chapters.length + ' главы · ' + esc(b.category) + '</span>' +
        b.chapters.map(function (c, i) { return '<div class="li"><span>' + (i + 1) + '. ' + esc(c.title) + '</span><span>' + c.minutes + ' мин</span></div>'; }).join('') +
        '<div class="li" style="color:' + f.accent + ';font-weight:600"><span>Шпаргалка и задание</span><span style="color:inherit">1 мин</span></div></div></div>';
    }
    var s = BV.serials[0];
    return '<div class="art"><div class="listcard"><b class="disp" style="font-size:28px;line-height:1.1">' + esc(s.title) + '</b>' +
      '<span style="color:var(--dim);font-size:14px">' + esc(s.genre) + ' · новая глава каждый день в ' + s.releaseHour + ':00</span>' +
      '<div style="background:' + f.color + ';border-radius:14px;padding:14px 16px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><b>Глава ' + (s.chapters.length + 1) + '</b><span>выйдет сегодня в ' + s.releaseHour + ':00</span></div>' +
      s.chapters.slice().reverse().map(function (c, i) { return '<div class="li"><span>Глава ' + (s.chapters.length - i) + '. ' + esc(c.title) + '</span><span>' + (i === 0 ? 'Новая' : '') + '</span></div>'; }).join('') + '</div></div>';
  }

  function viewHome() {
    var tiles = ['tales', 'choice', 'short', 'serials'].map(function (k) {
      var f = F[k];
      return '<a class="tile" href="#/' + k + '" style="background:' + f.color + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + '</svg><b>' + esc(f.name) + '</b><span>' + esc(f.title) + '</span></a>';
    }).join('');

    var secs = ['tales', 'choice', 'short', 'serials'].map(function (k, i) {
      var f = F[k];
      return '<section class="fsec' + (i % 2 ? ' rev' : '') + '" id="sec-' + k + '" style="background:' + f.deep + ';--dot:' + f.accent + '"><div class="wrap fsec-in">' +
        '<div class="fsec-text"><span class="eyebrow" style="color:' + f.accent + '">' + esc(f.name) + '</span>' +
        '<h2 class="h2">' + esc(f.title) + '</h2>' +
        '<div style="display:flex;flex-direction:column;gap:10px">' + paras(f.short, 'lead" style="color:' + f.soft) + '</div>' +
        '<span class="sub-label">' + esc(f.featuresTitle) + '</span><ul class="feat">' + f.features.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
        '<span class="sub-label">' + esc(f.examplesTitle) + '</span><div class="chips">' + f.examples.map(function (x) { return '<span class="chip">' + esc(x) + '</span>'; }).join('') + '</div>' +
        '<div class="row" style="margin-top:6px"><a class="btn btn-main" href="#/' + k + '">' + esc(f.button) + '</a></div>' +
        '<span class="caption" style="color:' + f.soft + '">' + esc(f.caption) + '</span></div>' +
        '<div class="fsec-art">' + homeArt(k) + '</div></div></section>';
    }).join('');

    var c = BV.closing;
    return '<section class="wrap hero"><div class="hero-text"><span class="eyebrow" style="color:var(--amber)">Одна подписка — четыре формата</span>' +
      '<h1>Букверс — больше, чем книги</h1>' +
      '<p class="lead">Сказки, где главный герой — твой ребёнок. Истории, в которых финал выбираешь ты. Короткие книги на 15 минут и сериалы с новой главой каждый день.</p>' +
      '<div class="row"><a class="btn btn-main" href="#/price">Попробовать бесплатно</a><a class="btn btn-ghost" href="#sec-tales" data-scroll="sec-tales">Смотреть форматы</a></div></div>' +
      '<div class="tiles">' + tiles + '</div></section>' + secs +
      '<section class="wrap closing"><h2 class="h2">' + esc(c.title) + '</h2>' + paras(c.text, 'lead') +
      '<a class="btn btn-main" href="#/shelf">' + esc(c.button) + '</a><span class="slogan">' + esc(c.slogan) + '</span></section>' +
      priceBlock() + footer();
  }

  function priceBlock() {
    return '<section class="price" id="price"><div class="wrap price-in">' +
      '<div style="text-align:center;display:flex;flex-direction:column;gap:12px;max-width:640px"><span class="eyebrow" style="color:var(--amber)">Цены</span>' +
      '<h2 class="h2">Все четыре формата в одной подписке</h2></div>' +
      '<div class="plans"><div class="plan"><h3>Бесплатно</h3><span class="sum">0 ₽</span><ul>' +
      '<li>Одна персональная сказка</li><li>Первая интерактивная история</li><li>Одна книга за 15 минут</li><li>Первые главы любого сериала</li></ul>' +
      '<a class="btn btn-ghost" href="#/tales">Начать бесплатно</a></div>' +
      '<div class="plan best"><div class="row" style="justify-content:space-between"><h3>Подписка</h3><span class="badge">Все форматы</span></div>' +
      '<span class="sum">' + BV.price + ' ₽ <small>/ месяц</small></span><ul>' +
      '<li>Сказки без ограничений для всех детей в семье</li><li>Все интерактивные истории и все концовки</li><li>Вся библиотека книг за 15 минут</li><li>Все сериалы и новые главы каждый день</li></ul>' +
      '<button type="button" class="btn btn-main" data-subscribe>Оформить подписку</button></div></div></div></section>';
  }
  function footer() {
    return '<footer class="wrap foot"><b>Букверс</b><span style="max-width:560px">Истории в Букверсе создаются с помощью искусственного интеллекта и проходят редактуру перед публикацией.</span></footer>';
  }

  function fhead(k) {
    var f = F[k];
    return '<section class="fhead" style="background:' + f.deep + '"><div class="wrap fhead-in">' +
      '<a class="back" href="#/">' + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>Все форматы</a>' +
      '<span class="eyebrow" style="color:' + f.accent + '">' + esc(f.name) + '</span>' +
      '<h1 class="h2">' + esc(f.title) + '</h1>' +
      '<div class="long" style="color:' + f.soft + '">' + paras(f.long) + '</div>' +
      '<span class="sub-label" style="margin-top:8px">' + esc(f.featuresTitle) + '</span><ul class="feat" style="--dot:' + f.accent + '">' +
      f.features.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></section>';
  }

  /* ---------- tales ---------- */
  function fillTale(str, t) {
    var name = t.name;
    return str.replace(/\{name\}/g, name).replace(/\{([^{}|]*)\|([^{}|]*)\}/g, function (m, a, b) { return t.gender === 'f' ? b : a; });
  }
  function makeTale(o) {
    var th = BV.tale.themes[o.theme], le = BV.tale.lessons[o.lesson];
    var parts = [th.intro, th.middle];
    if (o.age > 0) parts.push(th.extra);
    parts.push(le.text, th.ending);
    var t = { id: 't' + Date.now().toString(36), name: o.name, gender: o.gender, age: o.age, theme: o.theme, lesson: o.lesson, created: Date.now() };
    t.title = fillTale(th.title, t);
    t.paras = parts.map(function (p) { return fillTale(p, t); });
    return t;
  }
  function tales() { return store('tales') || []; }

  var AGES = ['3–5 лет', '6–7 лет', '8–10 лет'];
  function radios(name, list, checked) {
    return '<div class="opts">' + list.map(function (l, i) {
      return '<label class="opt-r"><input type="radio" name="' + name + '" value="' + i + '"' + (i === checked ? ' checked' : '') + '><span>' + esc(l) + '</span></label>';
    }).join('') + '</div>';
  }
  function viewTales() {
    var f = F.tales, my = tales();
    var form = '<form class="tale-form" id="taleForm" novalidate>' +
      '<div class="fld"><label for="childName">Имя ребёнка</label><input class="inp" id="childName" name="name" maxlength="24" autocomplete="off" placeholder="Например, Марк" value="' + esc((my[0] && my[0].name) || '') + '"></div>' +
      '<fieldset class="fld"><legend>Кто главный герой</legend>' + radios('gender', ['Мальчик', 'Девочка'], 0) + '</fieldset>' +
      '<fieldset class="fld"><legend>Возраст</legend>' + radios('age', AGES, 1) + '</fieldset>' +
      '<fieldset class="fld"><legend>Любимая тема</legend>' + radios('theme', BV.tale.themes.map(function (x) { return x.label; }), 0) + '</fieldset>' +
      '<fieldset class="fld"><legend>Чему научится герой</legend>' + radios('lesson', BV.tale.lessons.map(function (x) { return x.label; }), 0) + '</fieldset>' +
      '<span class="err" id="formErr" hidden>Напишите имя ребёнка, чтобы он стал героем сказки.</span>' +
      '<button class="btn btn-main btn-block" type="submit">' + esc(f.button) + '</button>' +
      '<span class="caption" style="text-align:center">' + esc(f.caption) + '</span></form>';
    var list = my.length
      ? '<div class="grid-cards">' + my.map(function (t) { return bcard({ href: '#/tale/' + t.id, color: f.color, kind: 'tales', title: t.title, meta: 'Создана ' + new Date(t.created).toLocaleDateString('ru-RU'), tag: AGES[t.age] }); }).join('') + '</div>'
      : '<div class="empty"><b>Здесь появятся ваши сказки</b><span style="color:var(--muted)">Заполните форму выше, и первая сказка сохранится на этой полке.</span></div>';
    return fhead('tales') +
      '<section class="wrap block"><h2>Создать сказку</h2>' + form + '</section>' +
      '<section class="wrap block"><h2>Сказки вашей семьи</h2>' + list + '</section>' + footer();
  }
  function viewTale(id) {
    var t = tales().filter(function (x) { return x.id === id; })[0];
    if (!t) return notFound('Сказка не найдена', '#/tales');
    var f = F.tales;
    var body = '<div class="tale-art" style="background:' + f.color + '">' + motif('tales', f.color) + '</div>' +
      '<span class="kicker">Персональная сказка · ' + esc(AGES[t.age]) + '</span><h1>' + esc(t.title) + '</h1>' +
      t.paras.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
      '<p style="text-align:center;font-family:var(--f-display);font-size:22px;margin-top:8px">Конец</p>' +
      '<p class="note">Это демо-версия: сказка собрана из готовых фрагментов. В полной версии каждую сказку будет писать нейросеть, а иллюстрации появятся на месте картинки сверху.</p>' +
      '<div class="r-nav"><a class="r-btn" href="#/tales">Ко всем сказкам</a><a class="r-btn main" href="#/tales">Создать новую сказку</a></div>';
    return readerShell('#/tales', t.title, body);
  }

  /* ---------- interactive stories ---------- */
  function viewChoice() {
    var f = F.choice;
    var cards = BV.stories.map(function (s) {
      return bcard({ href: '#/story/' + s.id, color: f.color, kind: 'choice', title: s.title, meta: s.genre + ' · ~' + s.minutes + ' минут', soon: !s.demo, tag: s.demo ? 'Читать' : '' });
    }).join('');
    return fhead('choice') + '<section class="wrap block"><h2>' + esc(f.examplesTitle) + '</h2><div class="grid-cards">' + cards + '</div>' +
      '<div class="row"><a class="btn btn-main" href="#/story/door">' + esc(f.button) + '</a></div><span class="caption">' + esc(f.caption) + '</span></section>' + footer();
  }
  function viewStory(id, nodeId) {
    var s = BV.stories.filter(function (x) { return x.id === id && x.demo; })[0];
    if (!s) return notFound('Эта история скоро появится', '#/choice');
    var prog = store('story:' + id) || { node: s.start, found: [] };
    if (nodeId === 'restart') { prog.node = s.start; store('story:' + id, prog); location.replace('#/story/' + id); return ''; }
    if (nodeId && s.nodes[nodeId]) { prog.node = nodeId; }
    var n = s.nodes[prog.node] || s.nodes[s.start];
    var endings = Object.keys(s.nodes).filter(function (k) { return s.nodes[k].ending; });
    if (n.ending && prog.found.indexOf(prog.node) < 0) prog.found.push(prog.node);
    store('story:' + id, prog);
    var body = '<span class="kicker">' + esc(s.title) + '</span><h1>' + esc(n.title) + '</h1>' + n.text.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    if (n.ending) {
      body += '<div class="endcard"><span class="kicker">Концовка</span><b>' + esc(n.title) + '</b>' +
        '<span class="note">Найдено концовок: ' + prog.found.length + ' из ' + endings.length + '</span><div class="dots">' +
        endings.map(function (k) { var got = prog.found.indexOf(k) >= 0; return '<span class="' + (got ? 'got' : '') + '">' + (got ? esc(s.nodes[k].title) : '???') + '</span>'; }).join('') +
        '</div></div><div class="r-nav"><a class="r-btn" href="#/choice">Другие истории</a><a class="r-btn main" href="#/story/' + id + '/restart">Пройти заново</a></div>';
    } else {
      body += '<span class="kicker" style="margin-top:8px">Что ты сделаешь?</span><div class="choices">' +
        n.choices.map(function (c, i) { return '<a class="choice" href="#/story/' + id + '/' + c.to + '"><i>' + 'АБВГ'[i] + '</i><span>' + esc(c.text) + '</span></a>'; }).join('') + '</div>' +
        '<p class="note">Концовок найдено: ' + prog.found.length + ' из ' + endings.length + '</p>';
    }
    return readerShell('#/choice', s.title, body);
  }

  /* ---------- short books ---------- */
  function viewShort() {
    var f = F.short;
    var cards = BV.books.map(function (b) {
      return bcard({ href: '#/book/' + b.id, color: f.color, kind: 'short', title: b.title, meta: b.category + ' · ' + b.minutes + ' минут', soon: !b.demo, tag: b.demo ? 'Читать' : '' });
    }).join('');
    return fhead('short') + '<section class="wrap block"><h2>' + esc(f.examplesTitle) + '</h2><div class="grid-cards">' + cards + '</div>' +
      '<span class="caption">' + esc(f.caption) + '</span></section>' + footer();
  }
  function viewBook(id) {
    var b = BV.books.filter(function (x) { return x.id === id && x.demo; })[0];
    if (!b) return notFound('Эта книга скоро появится', '#/short');
    var f = F.short, p = store('book:' + id) || { ch: 0 };
    var toc = b.chapters.map(function (c, i) { return '<a href="#/book/' + id + '/' + (i + 1) + '"><span>' + (i + 1) + '. ' + esc(c.title) + '</span><span class="r">' + (p.ch > i ? 'Прочитано' : c.minutes + ' мин') + '</span></a>'; }).join('') +
      '<a href="#/book/' + id + '/' + (b.chapters.length + 1) + '"><span style="color:' + f.accent + ';font-weight:600">Шпаргалка и задание на день</span><span class="r">1 мин</span></a>';
    var next = Math.min(p.ch + 1, b.chapters.length + 1);
    return '<div class="wrap detail"><div class="detail-cv"><div class="cv" style="background:' + f.color + '">' + motif('short', f.color) + '<b>' + esc(b.title) + '</b></div></div>' +
      '<div class="detail-body"><a class="back" href="#/short">' + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>Все книги</a>' +
      '<span class="eyebrow" style="color:' + f.accent + '">Книга за 15 минут · ' + esc(b.category) + '</span><h1>' + esc(b.title) + '</h1>' +
      '<div class="stats"><div><b>' + b.minutes + '</b><span>минут</span></div><div><b>' + b.chapters.length + '</b><span>' + plural(b.chapters.length, 'глава', 'главы', 'глав') + '</span></div><div><b>1</b><span>задание</span></div></div>' +
      '<span class="sub-label">Что ты узнаешь</span><ul class="feat" style="--dot:' + f.accent + ';grid-template-columns:1fr">' + b.learn.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
      '<span class="sub-label">Содержание</span><div class="toc">' + toc + '</div>' +
      '<div class="row"><a class="btn btn-main" href="#/book/' + id + '/' + next + '">' + (p.ch ? 'Продолжить чтение' : 'Читать · ' + b.minutes + ' минут') + '</a></div></div></div>' + footer();
  }
  function viewBookCh(id, n) {
    var b = BV.books.filter(function (x) { return x.id === id && x.demo; })[0];
    if (!b) return notFound('Эта книга скоро появится', '#/short');
    n = parseInt(n, 10) || 1;
    var total = b.chapters.length, p = store('book:' + id) || { ch: 0 };
    if (n > total) {
      p.ch = total; store('book:' + id, p);
      return readerShell('#/book/' + id, b.title, '<span class="kicker">Шпаргалка</span><h1>Главное из книги</h1>' +
        '<div class="cheat"><ul>' + b.cheat.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
        '<h2>Задание на сегодня</h2><p>' + esc(b.task) + '</p><div class="prog"><i style="width:100%"></i></div>' +
        '<div class="r-nav"><a class="r-btn" href="#/book/' + id + '/' + total + '">Назад</a><a class="r-btn main" href="#/short">Выбрать следующую книгу</a></div>');
    }
    var c = b.chapters[n - 1];
    if (p.ch < n - 1) p.ch = n - 1;
    store('book:' + id, p);
    var body = '<span class="kicker">Глава ' + n + ' из ' + total + ' · ' + c.minutes + ' мин</span><h1>' + esc(c.title) + '</h1>' +
      c.text.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') +
      '<div class="prog"><i style="width:' + Math.round(n / (total + 1) * 100) + '%"></i></div>' +
      '<div class="r-nav">' + (n > 1 ? '<a class="r-btn" href="#/book/' + id + '/' + (n - 1) + '">Предыдущая</a>' : '<a class="r-btn" href="#/book/' + id + '">Содержание</a>') +
      '<a class="r-btn main" href="#/book/' + id + '/' + (n + 1) + '" data-done="book:' + id + ':' + n + '">' + (n === total ? 'К шпаргалке' : 'Следующая глава') + '</a></div>';
    return readerShell('#/book/' + id, b.title, body);
  }

  /* ---------- serials ---------- */
  function nextRelease(hour) {
    var d = new Date(), r = new Date(d); r.setHours(hour, 0, 0, 0);
    if (r <= d) r.setDate(r.getDate() + 1);
    return r;
  }
  function viewSerials() {
    var f = F.serials;
    var cards = BV.serials.map(function (s) {
      return bcard({ href: '#/serial/' + s.id, color: f.color, kind: 'serials', title: s.title, meta: s.genre + (s.demo ? ' · ' + s.chapters.length + ' из ' + s.total + ' глав' : ''), soon: !s.demo, tag: s.demo ? 'Новая глава' : '' });
    }).join('');
    return fhead('serials') + '<section class="wrap block"><h2>' + esc(f.examplesTitle) + '</h2><div class="grid-cards">' + cards + '</div>' +
      '<span class="caption">' + esc(f.caption) + '</span></section>' + footer();
  }
  function viewSerial(id) {
    var s = BV.serials.filter(function (x) { return x.id === id && x.demo; })[0];
    if (!s) return notFound('Этот сериал скоро появится', '#/serials');
    var f = F.serials, p = store('serial:' + id) || { read: 0 }, rel = nextRelease(s.releaseHour);
    var diff = Math.max(0, rel - new Date()), hh = Math.floor(diff / 3600000), mm = Math.floor(diff % 3600000 / 60000);
    var day = rel.getDate() === new Date().getDate() ? 'сегодня' : 'завтра';
    var notify = store('notify:' + id);
    var toc = s.chapters.map(function (c, i) {
      var st = p.read > i ? '<span class="r">Прочитано</span>' : (i === s.chapters.length - 1 ? '<span class="r new">Новая</span>' : '<span class="r">6 мин</span>');
      return '<a href="#/serial/' + id + '/' + (i + 1) + '"><span>Глава ' + (i + 1) + '. ' + esc(c.title) + '</span>' + st + '</a>';
    }).join('') + '<a href="#/serial/' + id + '" class="locked" data-locked aria-disabled="true"><span>Глава ' + (s.chapters.length + 1) + '</span><span class="r">выйдет ' + day + ' в ' + s.releaseHour + ':00</span></a>';
    var next = Math.min(p.read + 1, s.chapters.length);
    return '<div class="wrap detail"><div class="detail-cv"><div class="cv" style="background:' + f.color + '">' + motif('serials', f.color) + '<b>' + esc(s.title) + '</b></div></div>' +
      '<div class="detail-body"><a class="back" href="#/serials">' + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>Все сериалы</a>' +
      '<span class="eyebrow" style="color:' + f.accent + '">Сериал · ' + esc(s.genre) + ' · Сезон 1</span><h1>' + esc(s.title) + '</h1>' +
      '<div class="timer"><div class="row" style="justify-content:space-between"><b>Глава ' + (s.chapters.length + 1) + '</b><span style="color:var(--muted);font-size:14px">' + day + ' в ' + s.releaseHour + ':00</span></div>' +
      '<div class="cd"><div><b>' + String(hh).padStart(2, '0') + '</b><span>' + plural(hh, 'час', 'часа', 'часов') + '</span></div><div><b>' + String(mm).padStart(2, '0') + '</b><span>' + plural(mm, 'минута', 'минуты', 'минут') + '</span></div></div>' +
      '<label class="switch" for="notify"><span>Напомнить, когда выйдет новая глава</span><input id="notify" type="checkbox" data-notify="' + id + '"' + (notify ? ' checked' : '') + '></label></div>' +
      '<span class="sub-label">Главы · ' + s.chapters.length + ' из ' + s.total + '</span><div class="toc">' + toc + '</div>' +
      '<div class="row"><a class="btn btn-main" href="#/serial/' + id + '/' + next + '">' + (p.read ? 'Продолжить: глава ' + next : 'Читать с первой главы') + '</a></div></div></div>' + footer();
  }
  function viewSerialCh(id, n) {
    var s = BV.serials.filter(function (x) { return x.id === id && x.demo; })[0];
    if (!s) return notFound('Этот сериал скоро появится', '#/serials');
    n = Math.min(Math.max(parseInt(n, 10) || 1, 1), s.chapters.length);
    var c = s.chapters[n - 1], p = store('serial:' + id) || { read: 0 };
    if (p.read < n) { p.read = n; store('serial:' + id, p); }
    var last = n === s.chapters.length;
    var body = '<span class="kicker">' + esc(s.title) + ' · Глава ' + n + '</span><h1>' + esc(c.title) + '</h1>' +
      c.text.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') +
      (last ? '<div class="endcard"><span class="kicker">Продолжение следует</span><b>Глава ' + (n + 1) + ' выйдет ' + (nextRelease(s.releaseHour).getDate() === new Date().getDate() ? 'сегодня' : 'завтра') + ' в ' + s.releaseHour + ':00</b><span class="note">Включи напоминание на странице сериала, чтобы не пропустить.</span></div>' : '') +
      '<div class="r-nav">' + (n > 1 ? '<a class="r-btn" href="#/serial/' + id + '/' + (n - 1) + '">Предыдущая</a>' : '<a class="r-btn" href="#/serial/' + id + '">Все главы</a>') +
      (last ? '<a class="r-btn main" href="#/serial/' + id + '">К сериалу</a>' : '<a class="r-btn main" href="#/serial/' + id + '/' + (n + 1) + '">Следующая глава</a>') + '</div>';
    return readerShell('#/serial/' + id, s.title, body);
  }

  /* ---------- shelf ---------- */
  function viewShelf() {
    var items = [];
    tales().forEach(function (t) { items.push({ href: '#/tale/' + t.id, color: F.tales.color, title: t.title, sub: 'Сказка · ' + AGES[t.age] }); });
    BV.stories.forEach(function (s) { var p = store('story:' + s.id); if (p) items.push({ href: '#/story/' + s.id, color: F.choice.color, title: s.title, sub: 'История с выбором · концовок найдено: ' + p.found.length }); });
    BV.books.forEach(function (b) { var p = store('book:' + b.id); if (p) items.push({ href: '#/book/' + b.id, color: F.short.color, title: b.title, sub: 'Книга за 15 минут · ' + (p.ch >= b.chapters.length ? 'прочитано' : 'прочитано глав: ' + p.ch + ' из ' + b.chapters.length) }); });
    BV.serials.forEach(function (s) { var p = store('serial:' + s.id); if (p) items.push({ href: '#/serial/' + s.id, color: F.serials.color, title: s.title, sub: 'Сериал · прочитано глав: ' + p.read + ' из ' + s.chapters.length }); });
    var list = items.length
      ? '<div class="shelf-list">' + items.map(function (i) { return '<a class="shelf-item" href="' + i.href + '"><span class="sq" style="background:' + i.color + '"></span><span class="t"><b>' + esc(i.title) + '</b><span>' + esc(i.sub) + '</span></span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg></a>'; }).join('') + '</div>'
      : '<div class="empty"><b>Полка пока пустая</b><span style="color:var(--muted)">Создай сказку, начни историю с выбором, открой короткую книгу или сериал — всё, что ты читаешь, появится здесь.</span><a class="btn btn-main" href="#/tales">Создать первую сказку</a></div>';
    var tiles = ['tales', 'choice', 'short', 'serials'].map(function (k) {
      var f = F[k];
      return '<a class="tile" href="#/' + k + '" style="background:' + f.color + ';min-height:120px"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + '</svg><b style="font-size:22px">' + esc(f.name) + '</b></a>';
    }).join('');
    return '<section class="wrap block" style="padding-top:40px"><span class="eyebrow" style="color:var(--amber)">Библиотека</span><h1 class="h2">Моя полка</h1>' + list + '</section>' +
      '<section class="wrap block" style="padding-top:8px"><h2>Все форматы</h2><div class="tiles">' + tiles + '</div></section>' + footer();
  }

  function notFound(msg, back) {
    return '<section class="wrap block" style="padding-top:64px"><h1 class="h2">' + esc(msg) + '</h1><div class="row"><a class="btn btn-main" href="' + back + '">Вернуться</a></div></section>';
  }

  /* ---------- router ---------- */
  function route() {
    var h = location.hash || '#/';
    if (h.indexOf('#/') !== 0) return; // обычные якоря
    var parts = h.slice(2).split('/').filter(Boolean).map(decodeURIComponent);
    var html, nav = parts[0] || 'home', scrollTo = null;
    switch (parts[0]) {
      case undefined: html = viewHome(); break;
      case 'price': html = viewHome(); scrollTo = 'price'; nav = 'home'; break;
      case 'tales': html = viewTales(); break;
      case 'tale': html = viewTale(parts[1]); nav = 'tales'; break;
      case 'choice': html = viewChoice(); break;
      case 'story': html = viewStory(parts[1], parts[2]); nav = 'choice'; break;
      case 'short': html = viewShort(); break;
      case 'book': html = parts[2] ? viewBookCh(parts[1], parts[2]) : viewBook(parts[1]); nav = 'short'; break;
      case 'serials': html = viewSerials(); break;
      case 'serial': html = parts[2] ? viewSerialCh(parts[1], parts[2]) : viewSerial(parts[1]); nav = 'serials'; break;
      case 'shelf': html = viewShelf(); break;
      default: html = notFound('Такой страницы нет', '#/');
    }
    if (html === '') return;
    main.innerHTML = html;
    document.querySelectorAll('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-nav') === nav); });
    var titles = { home: 'Букверс — больше, чем книги', tales: 'Сказки — Букверс', choice: 'Истории с выбором — Букверс', short: 'Книги за 15 минут — Букверс', serials: 'Сериалы — Букверс', shelf: 'Моя полка — Букверс' };
    document.title = titles[nav] || 'Букверс';
    if (scrollTo) { var el = document.getElementById(scrollTo); if (el) el.scrollIntoView(); }
    else window.scrollTo(0, 0);
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-soon],[data-subscribe],[data-fs],[data-theme],[data-scroll],[data-locked]');
    if (!t) return;
    if (t.hasAttribute('data-soon')) { toast('«' + t.getAttribute('data-soon') + '» скоро появится в Букверсе'); }
    else if (t.hasAttribute('data-subscribe')) { toast('Оплата подписки подключится совсем скоро'); }
    else if (t.hasAttribute('data-locked')) { e.preventDefault(); toast('Эта глава ещё не вышла'); }
    else if (t.hasAttribute('data-scroll')) { e.preventDefault(); var el = document.getElementById(t.getAttribute('data-scroll')); if (el) el.scrollIntoView(); }
    else {
      var s = rset();
      if (t.hasAttribute('data-fs')) s.fs = Math.min(26, Math.max(15, s.fs + parseInt(t.getAttribute('data-fs'), 10) * 2));
      else s.dark = !s.dark;
      store('reader', s);
      var r = document.querySelector('.reader');
      if (r) { r.classList.toggle('dark', s.dark); r.style.setProperty('--fs', s.fs + 'px'); }
    }
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.hasAttribute && t.hasAttribute('data-notify')) {
      store('notify:' + t.getAttribute('data-notify'), t.checked);
      toast(t.checked ? 'Напомним, когда выйдет новая глава' : 'Напоминание выключено');
    }
  });
  document.addEventListener('submit', function (e) {
    if (e.target.id !== 'taleForm') return;
    e.preventDefault();
    var fd = new FormData(e.target);
    var name = String(fd.get('name') || '').replace(/[{}<>]/g, '').trim();
    var err = document.getElementById('formErr');
    if (!name) { err.hidden = false; document.getElementById('childName').focus(); return; }
    name = name.charAt(0).toUpperCase() + name.slice(1);
    var t = makeTale({ name: name, gender: fd.get('gender') === '1' ? 'f' : 'm', age: +fd.get('age'), theme: +fd.get('theme'), lesson: +fd.get('lesson') });
    var list = tales(); list.unshift(t); store('tales', list.slice(0, 50));
    location.hash = '#/tale/' + t.id;
  });

  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
