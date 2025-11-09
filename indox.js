// === Alisomali JS Menu — كامل (انسخ ثم الصقه في Console أو احفظه كملف .js) ===
(function(){
  if(window.__alisomali_menu_loaded) return;
  window.__alisomali_menu_loaded = true;

  /* ---------- إعدادات أساسية ولقطات من localStorage ---------- */
  const storageKey = '__alisomali_menu_state_v1';
  const defaultState = {
    open: true,
    currentIndex: 0,
    items: ['Visuals','Player','Weapons','World','Online Players','Vehicles'],
    fly: {enabled:false, key:'f'},
    boost: {enabled:false, key:'g'},
    toggleKey: 'm'
  };
  let state = Object.assign({}, defaultState, JSON.parse(localStorage.getItem(storageKey) || '{}'));

  function saveState(){ localStorage.setItem(storageKey, JSON.stringify(state)); }

  /* ---------- صوت عربي بسيط عبر Web Speech API ---------- */
  function speakArabic(text){
    try {
      const s = window.speechSynthesis;
      if(!s) return;
      s.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ar-SA';
      u.rate = 1;
      u.pitch = 1;
      u.volume = 0.95;
      s.speak(u);
    } catch(e){ /* صامت */ }
  }

  /* ---------- حقن CSS ديناميكياً ---------- */
  const css = `
  :root{
    --u-red:#d11a2a; --u-green:#007a3d; --u-black:#000; --u-white:#fff;
    --panel-bg: rgba(12,12,14,0.6);
    --panel-border: rgba(255,255,255,0.06);
    --accent: linear-gradient(90deg,var(--u-red), #ff6a3a);
  }
  html,body{ background: transparent !important; }
  .alisomali-menu {
    direction: rtl;
    position: fixed;
    right: 22px;
    top: 40px;
    width: 340px;
    border-radius: 14px;
    overflow: hidden;
    z-index: 999999;
    font-family: "Segoe UI", Tahoma, Arial, sans-serif;
    color: var(--u-white);
    box-shadow: 0 10px 40px rgba(0,0,0,0.6), 0 0 18px rgba(255,106,58,0.06);
    border: 1px solid var(--panel-border);
    backdrop-filter: blur(8px) saturate(130%);
    -webkit-backdrop-filter: blur(8px) saturate(130%);
  }
  .alisomali-header{
    display:flex; align-items:center; gap:12px; padding:12px 14px;
    background: linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.08));
    border-bottom:1px solid rgba(255,255,255,0.03);
  }
  .alisomali-brand{
    width:56px;height:56px;border-radius:10px;
    background: linear-gradient(180deg,var(--u-red), #ff7a3f);
    display:flex;align-items:center;justify-content:center;
    font-weight:800;font-size:18px;color:white; letter-spacing:1px;
    box-shadow: inset 0 -8px 30px rgba(255,255,255,0.03);
  }
  .alisomali-title{ font-weight:800; font-size:16px; color:#fff; text-shadow:0 4px 20px rgba(0,0,0,0.6); }
  .alisomali-sub{ font-size:12px; color: rgba(255,255,255,0.75); }

  .alisomali-body{ padding:12px; background: linear-gradient(180deg, rgba(12,12,14,0.55), rgba(14,14,16,0.5)); }
  .alisomali-list{ display:flex; flex-direction:column; gap:8px; max-height:300px; overflow:auto; padding-right:6px; }

  .alisomali-item{
    display:flex; align-items:center; gap:12px; padding:10px; border-radius:10px;
    cursor:pointer; transition:all 140ms ease; color:#eaeaea; border:1px solid transparent;
    background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00));
  }
  .alisomali-item:hover{ transform: translateY(-3px); }
  .alisomali-item.active{
    background: linear-gradient(90deg, rgba(255,106,58,0.14), rgba(255,63,0,0.06));
    border: 1px solid rgba(255,63,0,0.14);
  }
  .alisomali-icon{ width:44px;height:44px;border-radius:9px; display:flex;align-items:center;justify-content:center; background:rgba(255,255,255,0.02); font-size:18px; }
  .alisomali-label{ flex:1; font-weight:700; font-size:14px; color: #fff; }
  .alisomali-right{ font-size:12px; color: #ddd; }

  /* controls area */
  .alisomali-controls{ display:flex; flex-direction:column; gap:8px; margin-top:10px; }
  .ctrl-row{ display:flex; gap:8px; align-items:center; }
  .ctrl-btn{
    flex:1; padding:8px 10px; border-radius:10px; text-align:center; font-weight:700; cursor:pointer;
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00));
    border:1px solid rgba(255,255,255,0.03);
  }
  .ctrl-btn.toggle-on{ background: linear-gradient(90deg, rgba(0,122,61,0.16), rgba(0,122,61,0.06)); border-color: rgba(0,122,61,0.18); }
  .ctrl-btn.keybind{ font-size:13px; color:#fafafa; }
  .ctrl-btn.red{ background: linear-gradient(180deg, rgba(210,26,42,0.16), rgba(210,26,42,0.06)); border-color: rgba(210,26,42,0.16); color:white; }

  .alisomali-footer{ display:flex; justify-content:space-between; align-items:center; padding:10px 12px; font-size:12px; color:#ccc; border-top:1px solid rgba(255,255,255,0.03); background:linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.04)); }
  .hint{ font-size:12px; color:#c9c9c9; }
  /* small scrollbar style */
  .alisomali-list::-webkit-scrollbar{ width:8px; }
  .alisomali-list::-webkit-scrollbar-thumb{ background: rgba(255,255,255,0.04); border-radius:8px; }
  `;

  const styleTag = document.createElement('style');
  styleTag.id = '__alisomali_menu_style';
  styleTag.innerHTML = css;
  document.head.appendChild(styleTag);

  /* ---------- بناء DOM للقائمة بالكامل ---------- */
  const root = document.createElement('div');
  root.className = 'alisomali-menu';
  root.tabIndex = 0;
  root.setAttribute('role','dialog');
  root.setAttribute('aria-label','Alisomali Menu');

  root.innerHTML = `
    <div class="alisomali-header">
      <div class="alisomali-brand">ALI</div>
      <div style="flex:1">
        <div class="alisomali-title">ALISOMALI</div>
        <div class="alisomali-sub">Main Menu</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
        <div style="font-size:11px;color:rgba(255,255,255,0.7);">Online: 344</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.45)">Welcome</div>
      </div>
    </div>
    <div class="alisomali-body">
      <div class="alisomali-list" id="alisomaliList"></div>

      <div class="alisomali-controls" style="margin-top:12px;">
        <div class="ctrl-row">
          <div class="ctrl-btn" id="flyToggle">✈️ طيران</div>
          <div class="ctrl-btn keybind" id="flyKey">Key: ${state.fly.key.toUpperCase()}</div>
        </div>
        <div class="ctrl-row">
          <div class="ctrl-btn" id="boostToggle">⚡ دبل</div>
          <div class="ctrl-btn keybind" id="boostKey">Key: ${state.boost.key.toUpperCase()}</div>
        </div>

        <div class="ctrl-row">
          <div class="ctrl-btn" id="replayBtn">⟲ إعادة اللعب</div>
          <div class="ctrl-btn red" id="deleteAllBtn">حذف كل شيء</div>
        </div>
      </div>
    </div>
    <div class="alisomali-footer">
      <div class="hint">M لفتح/اغلاق - الأسهم للتنقل - Enter للتفعيل</div>
      <div id="pager">1/${state.items.length}</div>
    </div>
  `;

  document.body.appendChild(root);

  /* ---------- تعبئة العناصر (القائمة) وربط الأحداث ---------- */
  const listEl = root.querySelector('#alisomaliList');
  function renderList(){
    listEl.innerHTML = '';
    state.items.forEach((label, i) => {
      const item = document.createElement('div');
      item.className = 'alisomali-item' + (i===state.currentIndex ? ' active' : '');
      item.dataset.index = i;
      item.innerHTML = `
        <div class="alisomali-icon">${['👁️','🧍','🔫','🌍','👥','🚗'][i] || '•'}</div>
        <div class="alisomali-label">${label}</div>
        <div class="alisomali-right">${i+1}/${state.items.length}</div>
      `;
      item.addEventListener('click', ()=>{
        setActive(i);
        speakArabic('فتحت ' + label);
      });
      listEl.appendChild(item);
    });
    root.querySelector('#pager').textContent = `${state.currentIndex+1}/${state.items.length}`;
  }
  renderList();

  function setActive(index){
    index = (index + state.items.length) % state.items.length;
    state.currentIndex = index;
    saveState();
    renderList();
    // scroll to element
    const el = listEl.querySelector(`.alisomali-item[data-index="${index}"]`);
    if(el) el.scrollIntoView({block:'nearest', behavior:'smooth'});
  }

  /* ---------- أزرار التحكم (تفعيل/اختصارات ...) ---------- */
  const flyToggleBtn = root.querySelector('#flyToggle');
  const boostToggleBtn = root.querySelector('#boostToggle');
  const flyKeyBtn = root.querySelector('#flyKey');
  const boostKeyBtn = root.querySelector('#boostKey');
  const replayBtn = root.querySelector('#replayBtn');
  const deleteAllBtn = root.querySelector('#deleteAllBtn');

  function updateToggleUI(){
    if(state.fly.enabled) flyToggleBtn.classList.add('toggle-on'); else flyToggleBtn.classList.remove('toggle-on');
    if(state.boost.enabled) boostToggleBtn.classList.add('toggle-on'); else boostToggleBtn.classList.remove('toggle-on');
    flyKeyBtn.textContent = 'Key: ' + state.fly.key.toUpperCase();
    boostKeyBtn.textContent = 'Key: ' + state.boost.key.toUpperCase();
    saveState();
  }
  updateToggleUI();

  flyToggleBtn.addEventListener('click', ()=>{
    state.fly.enabled = !state.fly.enabled;
    updateToggleUI();
    speakArabic(state.fly.enabled ? 'تم تفعيل الطيران' : 'تم ايقاف الطيران');
  });
  boostToggleBtn.addEventListener('click', ()=>{
    state.boost.enabled = !state.boost.enabled;
    updateToggleUI();
    speakArabic(state.boost.enabled ? 'تم تفعيل الدبل' : 'تم ايقاف الدبل');
  });

  // تغيير اختصار بالضغط على زر وتسجيله
  function captureKeybind(target, keyPath){
    speakArabic('اضغط أي زر لتعيين الاختصار');
    target.textContent = 'اضغط زر...';
    const handler = (e)=>{
      e.preventDefault();
      const k = e.key;
      state[keyPath].key = k;
      updateToggleUI();
      speakArabic('تم تعيين الاختصار ' + k.toUpperCase());
      window.removeEventListener('keydown', handlerCapture);
      saveState();
    };
    // we need to avoid conflict with global handlers, so use a one-time dedicated listener
    function handlerCapture(e){
      // ignore modifier-only keys
      if(['Shift','Control','Alt','Meta'].includes(e.key)) return;
      handler(e);
    }
    window.addEventListener('keydown', handlerCapture);
    // cancel after 8s if no input
    setTimeout(()=> {
      try { window.removeEventListener('keydown', handlerCapture); } catch(e){}
      updateToggleUI();
    }, 8000);
  }

  flyKeyBtn.addEventListener('click', ()=> captureKeybind(flyKeyBtn, 'fly'));
  boostKeyBtn.addEventListener('click', ()=> captureKeybind(boostKeyBtn, 'boost'));

  replayBtn.addEventListener('click', ()=>{
    speakArabic('جاري إعادة اللعب');
    // وظيفة إعادة اللعب: هنا نستدعي حدث عام - يمكنك تغييره ليتناسب مع لعبتك
    const ev = new CustomEvent('alisomali:replay');
    window.dispatchEvent(ev);
  });

  deleteAllBtn.addEventListener('click', ()=>{
    const ok = confirm('هل أنت متأكد من حذف كل شيء؟ هذا الإجراء لا يمكن التراجع عنه.');
    if(!ok) return;
    // تنفيذ "حذف كل شيء" — نطلق حدث عام ليستلمه كود اللعب
    speakArabic('حذف كل شيء');
    const ev = new CustomEvent('alisomali:deleteAll');
    window.dispatchEvent(ev);
  });

  /* ---------- لوحة مفاتيح عامة للتفعيل + مفاتيح FLY/BOOST ---------- */
  function globalKeyHandler(e){
    const key = e.key.toLowerCase();
    // فتح/اغلاق المنيو
    if(key === (state.toggleKey || 'm').toLowerCase()){
      e.preventDefault();
      state.open = !state.open;
      root.style.display = state.open ? 'block' : 'none';
      if(state.open){ root.focus(); speakArabic('تم فتح القائمة'); }
      else speakArabic('تم إغلاق القائمة');
      saveState();
      return;
    }

    // مفاتيح تغيير الحالة السريعة
    if(key === (state.fly.key || 'f').toLowerCase()){
      e.preventDefault();
      state.fly.enabled = !state.fly.enabled;
      updateToggleUI();
      speakArabic(state.fly.enabled ? 'الطيران مفعل' : 'الطيران معطّل');
      // إطلاق حدث عام ليستلمه سكربت اللعب
      window.dispatchEvent(new CustomEvent('alisomali:fly', { detail: { enabled: state.fly.enabled } }));
      return;
    }
    if(key === (state.boost.key || 'g').toLowerCase()){
      e.preventDefault();
      state.boost.enabled = !state.boost.enabled;
      updateToggleUI();
      speakArabic(state.boost.enabled ? 'الدبل مفعل' : 'الدبل معطّل');
      window.dispatchEvent(new CustomEvent('alisomali:boost', { detail: { enabled: state.boost.enabled } }));
      return;
    }

    // تنقل بالمنيو عندما تكون مفتوحة
    if(state.open){
      if(key === 'arrowdown' || e.key === 'ArrowDown'){
        e.preventDefault();
        setActive(state.currentIndex + 1);
      } else if(key === 'arrowup' || e.key === 'ArrowUp'){
        e.preventDefault();
        setActive(state.currentIndex - 1);
      } else if(key === 'enter' || e.key === 'Enter'){
        e.preventDefault();
        // تفعيل العنصر المحدد — نصيحة: تطوّر هذا الجزء ليفعل وظائف فعلية
        const label = state.items[state.currentIndex];
        speakArabic('تم تفعيل ' + label);
        window.dispatchEvent(new CustomEvent('alisomali:activate', { detail: { index: state.currentIndex, label } }));
      }
    }
  }

  // استماع شامل
  window.addEventListener('keydown', globalKeyHandler);

  /* ---------- قابلية السحب (drag) للمنيو ---------- */
  (function enableDrag(){
    let isDown = false, startX=0, startY=0, startRight=0, startTop=0;
    const hdr = root.querySelector('.alisomali-header');
    hdr.style.cursor = 'grab';
    hdr.addEventListener('mousedown', (ev)=>{
      isDown = true; hdr.style.cursor = 'grabbing';
      startX = ev.clientX; startY = ev.clientY;
      const rect = root.getBoundingClientRect();
      startRight = window.innerWidth - rect.right;
      startTop = rect.top;
      ev.preventDefault();
    });
    window.addEventListener('mousemove', (ev)=>{
      if(!isDown) return;
      let dx = ev.clientX - startX;
      let dy = ev.clientY - startY;
      // translate into top/right
      let newTop = Math.max(6, startTop + dy);
      let newRight = Math.max(6, startRight - dx);
      root.style.top = newTop + 'px';
      root.style.right = newRight + 'px';
    });
    window.addEventListener('mouseup', ()=> { if(isDown) hdr.style.cursor = 'grab'; isDown=false; });
  })();

  /* ---------- زراغلاق/إخفاء سريع إن لزم ---------- */
  // اضغط مع M مرتين لإغلاق نهائي
  let lastToggleAt = 0;
  window.addEventListener('keydown', (e)=>{
    if(e.key.toLowerCase() === (state.toggleKey || 'm').toLowerCase()){
      const now = Date.now();
      if(now - lastToggleAt < 500){
        // نقرة مزدوجة — تخفي العنصر تماما
        root.style.display = 'none';
        state.open = false;
        saveState();
      }
      lastToggleAt = now;
    }
  });

  /* ---------- تصدير API بسيط للاستخدام من باقي السكربتات ---------- */
  window.AlisomaliMenu = {
    state,
    setActive,
    speakArabic,
    open(){ root.style.display='block'; state.open=true; saveState(); root.focus(); },
    close(){ root.style.display='none'; state.open=false; saveState(); },
    toggle(){ root.style.display = (root.style.display === 'none' ? 'block' : 'none'); state.open = root.style.display !== 'none'; saveState(); }
  };

  // اظهار حسب الحالة المحفوظة
  root.style.display = state.open ? 'block' : 'none';
  // اعطاء تركيز افتراضي
  setTimeout(()=>{ if(state.open) root.focus(); }, 80);

  // رسالة ترحيب
  speakArabic('قائمة آلي صمولاي جاهزة');

  /* ---------- لاحقاً: استخدم الأحداث العامة التالية في كود اللعب:
      window.addEventListener('alisomali:fly', e => { console.log(e.detail.enabled); });
      window.addEventListener('alisomali:boost', e => { ... });
      window.addEventListener('alisomali:deleteAll', () => { ... });
      window.addEventListener('alisomali:replay', () => { ... });
      window.addEventListener('alisomali:activate', e => { console.log(e.detail); });
  ---------- */

})();
