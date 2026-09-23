(() => {
  'use strict';

  const $ = (q, root=document) => root.querySelector(q);
  const $$ = (q, root=document) => [...root.querySelectorAll(q)];
  const state = { session:null, profile:null, classes:[], activeClass:null, activeLive:null, authMode:'login', classPoll:null };

  function msg(el, text, ok=false) {
    if (!el) return;
    el.textContent = text;
    el.hidden = !text;
    el.classList.toggle('ok', ok);
  }

  function teacherName() {
    return state.profile?.display_name || state.session?.user?.email?.split('@')[0] || 'Teacher';
  }

  function openAuth(mode='login') {
    state.authMode = mode;
    const layer = $('#eduAuthLayer');
    if (!layer) return;
    layer.hidden = false;
    document.body.classList.add('edu-modal-open');
    syncAuthMode();
    setTimeout(() => $('#teacherEmail')?.focus(), 60);
  }

  function closeAuth() {
    const layer = $('#eduAuthLayer');
    if (layer) layer.hidden = true;
    document.body.classList.remove('edu-modal-open');
  }

  function syncAuthMode() {
    const signup = state.authMode === 'signup';
    $('#teacherNameWrap').hidden = !signup;
    $('#eduAuthTitle').textContent = signup ? 'Ücretsiz öğretmen hesabı oluştur' : 'Öğretmen hesabına giriş yap';
    $('#eduAuthIntro').textContent = signup
      ? 'Hesabınız açıldığında sınıflarınız ve dersleriniz cihazdan bağımsız olarak kaydedilir.'
      : 'Sınıflarınız, öğrenci kodlarınız ve dersleriniz hesabınıza kaydedilir.';
    $('#eduAuthSubmit').textContent = signup ? 'Hesap oluştur →' : 'Giriş yap →';
    $('#teacherPassword').autocomplete = signup ? 'new-password' : 'current-password';
    $$('[data-auth-mode]').forEach(b => b.classList.toggle('active', b.dataset.authMode === state.authMode));
    msg($('#eduAuthMessage'),'');
  }

  async function bootAuth() {
    if (!window.ESCSupabase?.isConfigured()) return;
    try {
      state.session = await window.ESCSupabase.getSession();
      if (state.session) await enterTeacher();
      else showLockedWorkspace();
    } catch {
      showLockedWorkspace();
    }
  }

  function showLockedWorkspace() {
    $('#teacherApp')?.classList.add('teacher-locked');
    const title = $('#workspaceTitle');
    if (title) title.textContent = 'Öğretmen hesabınızla giriş yapın';
    const app = $('#teacherApp');
    if (app && !$('.teacher-lock-card', app)) {
      const lock = document.createElement('div');
      lock.className = 'teacher-lock-card';
      lock.innerHTML = '<span>TEACHER LOGIN</span><h3>Sınıflarınızı yönetmek için giriş yapın.</h3><p>Gerçek sınıf kodları, öğrenci katılımları ve ders kayıtları hesabınıza bağlıdır.</p><button type="button" data-teacher-login>Öğretmen girişi →</button>';
      app.appendChild(lock);
      lock.querySelector('[data-teacher-login]').addEventListener('click', () => openAuth('login'));
    }
  }

  async function enterTeacher() {
    state.profile = await window.ESCSupabase.getEducatorProfile();
    if (!state.profile) state.profile = await window.ESCSupabase.ensureEducatorProfile(teacherName());
    $('#teacherApp')?.classList.remove('teacher-locked');
    $('.teacher-lock-card')?.remove();
    const title = $('#workspaceTitle');
    if (title) title.textContent = 'Merhaba, ' + teacherName() + ' 👋';
    ensureLogoutButton();
    await refreshClasses(true);
    if (state.classPoll) clearInterval(state.classPoll);
    state.classPoll = setInterval(() => refreshClasses(false).catch(()=>{}), 7000);
  }

  function ensureLogoutButton() {
    if ($('#eduLogout')) return;
    const wrap = $('.workspace-actions');
    if (!wrap) return;
    const b = document.createElement('button');
    b.id='eduLogout'; b.type='button'; b.className='ghost-button'; b.textContent='Çıkış';
    b.addEventListener('click', async () => {
      await window.ESCSupabase.signOut();
      state.session=null;state.profile=null;state.classes=[];state.activeClass=null;state.activeLive=null;
      if (state.classPoll) clearInterval(state.classPoll);
      location.reload();
    });
    wrap.prepend(b);
  }

  async function refreshClasses(initial=false) {
    if (!state.session) return;
    state.classes = await window.ESCSupabase.listEducatorClasses();
    if (!state.activeClass && state.classes.length) state.activeClass = state.classes[0];
    if (state.activeClass) {
      const fresh = state.classes.find(c => c.id === state.activeClass.id);
      if (fresh) state.activeClass = fresh;
      state.activeLive = await window.ESCSupabase.getActiveEducatorSession(state.activeClass.id).catch(()=>null);
    }
    renderClasses();
    renderOverview();
    if (initial && state.activeClass) applyClassToBuilder(state.activeClass);
  }

  function renderOverview() {
    const metrics = $$('.metric-grid article strong');
    const studentTotal = state.classes.reduce((sum,c)=>sum+(c.students?.length||0),0);
    if (metrics[0]) metrics[0].textContent = String(state.classes.filter(c=>c.is_active).length);
    if (metrics[1]) metrics[1].textContent = String(studentTotal);
    if (metrics[2]) metrics[2].textContent = String(state.activeLive ? 1 : 0);
    if (metrics[3]) metrics[3].textContent = state.activeLive ? 'LIVE' : '—';

    const code = $('.class-code-card strong');
    const codeText = state.activeClass?.join_code || '------';
    if (code) code.textContent = codeText;
    const desc = $('.class-code-card p');
    if (desc) desc.textContent = state.activeClass
      ? `${state.activeClass.name} sınıfına telefondan /join/ sayfası üzerinden bu kodla katılın.`
      : 'Önce bir sınıf oluşturun.';

    const next = $('.next-lesson-card');
    if (next && state.activeClass) {
      $('h3', next).textContent = state.activeClass.name + ' · ' + (state.activeClass.focus || 'speaking');
      $('p', next).textContent = `${state.activeClass.age_group.replace('-', '–')} years · ${state.activeClass.level} · ${state.activeClass.students?.length || 0} students`;
      const head = $('.card-head b', next);
      if (head) head.textContent = state.activeLive ? '● LIVE NOW' : 'Ready';
    }

    const table = $('.recent-table');
    if (table) {
      const title = $('.table-title span', table);
      if (title) title.textContent = state.classes.length + ' classes';
      $$('.table-row:not(.table-head)', table).forEach(x=>x.remove());
      state.classes.slice(0,4).forEach(c => {
        const row=document.createElement('div');
        row.className='table-row';
        row.innerHTML=`<b>${escapeHtml(c.name)}</b><span>${escapeHtml(c.age_group)} · ${escapeHtml(c.level)}</span><span>${c.students?.length || 0} students</span><span class="good">${c.is_active?'Active':'Closed'}</span>`;
        table.appendChild(row);
      });
    }
  }

  function renderClasses() {
    const grid=$('#classCardGrid');
    if (!grid) return;
    if (!state.session) {
      grid.innerHTML='<article class="empty-class-card"><h3>Öğretmen girişi gerekli</h3><p>Sınıflar hesabınıza bağlı olarak burada görünür.</p></article>';
      return;
    }
    if (!state.classes.length) {
      grid.innerHTML='<article class="empty-class-card"><h3>Henüz sınıf yok.</h3><p>“New class” ile ilk sınıfınızı oluşturun. Sistem otomatik katılım kodu üretir.</p></article>';
      return;
    }
    grid.innerHTML = state.classes.map(c => `<article class="${state.activeClass?.id===c.id?'selected-class':''}">
      <div><span>${escapeHtml(c.name)}</span><small>${escapeHtml(c.age_group)} · ${escapeHtml(c.level)}</small></div>
      <strong>${c.students?.length || 0} students</strong>
      <p>${escapeHtml(c.focus)} · Code <b class="inline-code">${escapeHtml(c.join_code)}</b></p>
      <div class="class-actions"><button type="button" data-live-class="${c.id}">Use class →</button><button type="button" data-copy-class="${escapeHtml(c.join_code)}">Copy code</button></div>
    </article>`).join('');
    $$('[data-live-class]',grid).forEach(b=>b.addEventListener('click',()=>{
      const c=state.classes.find(x=>x.id===b.dataset.liveClass); if(!c)return;
      state.activeClass=c; applyClassToBuilder(c); renderClasses();renderOverview();
      document.querySelector('[data-panel="builder"]')?.click();
    }));
    $$('[data-copy-class]',grid).forEach(b=>b.addEventListener('click',()=>copyText(b.dataset.copyClass,b)));
  }

  function applyClassToBuilder(c) {
    if (!c) return;
    const map={className:c.name,ageGroup:c.age_group,level:c.level,goal:c.focus};
    Object.entries(map).forEach(([id,val])=>{ const el=$('#'+id); if(el) el.value=val; });
    $('#lessonForm')?.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
  }

  async function copyText(text, button) {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
    }
    if(button){const old=button.textContent;button.textContent='Copied ✓';setTimeout(()=>button.textContent=old,1200);}
  }

  function openClassModal() {
    if (!state.session) return openAuth('login');
    $('#eduClassLayer').hidden=false;
    document.body.classList.add('edu-modal-open');
    setTimeout(()=>$('#newClassName')?.focus(),50);
  }
  function closeClassModal(){ $('#eduClassLayer').hidden=true;document.body.classList.remove('edu-modal-open');msg($('#eduClassMessage'),''); }

  async function createClass(e) {
    e.preventDefault();
    const submit=e.currentTarget.querySelector('[type="submit"]');
    submit.disabled=true;
    msg($('#eduClassMessage'),'Sınıf oluşturuluyor…');
    try {
      const created=await window.ESCSupabase.createEducatorClass({
        name:$('#newClassName').value.trim(),
        age_group:$('#newClassAge').value,
        level:$('#newClassLevel').value,
        focus:$('#newClassFocus').value,
        max_students:Number($('#newClassMax').value||40)
      });
      state.activeClass={...created,students:[]};
      msg($('#eduClassMessage'),`Sınıf hazır. Katılım kodu: ${created.join_code}`,true);
      await refreshClasses(false);
      setTimeout(()=>{closeClassModal();applyClassToBuilder(state.activeClass);},900);
    } catch(err) {
      msg($('#eduClassMessage'),humanError(err));
    } finally {submit.disabled=false;}
  }

  async function authSubmit(e) {
    e.preventDefault();
    const submit=$('#eduAuthSubmit');submit.disabled=true;
    msg($('#eduAuthMessage'), state.authMode==='signup'?'Hesap oluşturuluyor…':'Giriş yapılıyor…');
    try {
      const email=$('#teacherEmail').value.trim(), password=$('#teacherPassword').value;
      if(state.authMode==='signup'){
        const data=await window.ESCSupabase.signUp(email,password,'/educators/');
        if(data.session){
          state.session=data.session;
          state.profile=await window.ESCSupabase.ensureEducatorProfile($('#teacherName').value.trim()||email.split('@')[0]);
          closeAuth(); await enterTeacher();
        }else{
          msg($('#eduAuthMessage'),'Hesap oluşturuldu. E-postanıza gelen doğrulama bağlantısını açın; ardından öğretmen paneline giriş yapın.',true);
        }
      }else{
        const data=await window.ESCSupabase.signIn(email,password);
        state.session=data.session;
        closeAuth();await enterTeacher();
      }
    }catch(err){msg($('#eduAuthMessage'),humanError(err));}
    finally{submit.disabled=false;}
  }

  function currentPlan() {
    const topic=$('#topic')?.value||'travel', duration=Number($('#duration')?.value||40);
    const rows=$$('.generated-plan .plan-row');
    const plan=rows.map((r,i)=>({
      index:i,
      stage:$('span',r)?.textContent||'Activity',
      title:$('b',r)?.textContent||'Class activity',
      duration:$('small',r)?.textContent||'',
      prompt:i===0?($('#adaptiveQuestion')?.textContent||'Let’s start speaking.'):null
    }));
    return plan.length?plan:[
      {index:0,stage:'WARM-UP',title:'Warm-up speaking',duration:'5 min',prompt:$('#adaptiveQuestion')?.textContent||'Let’s start speaking.'},
      {index:1,stage:'VOCABULARY',title:topic+' vocabulary',duration:'8 min'},
      {index:2,stage:'TEAM GAME',title:'Adaptive team game',duration:'10 min'},
      {index:3,stage:'SPEAKING',title:'Speaking practice',duration:'12 min'},
      {index:4,stage:'EXIT',title:'Exit question',duration:Math.max(2,duration-35)+' min'}
    ];
  }

  async function ensureActiveClass() {
    if (state.activeClass) return state.activeClass;
    if (!state.session) { openAuth('login'); throw new Error('Önce öğretmen hesabına giriş yapın.'); }
    if (state.classes.length) {state.activeClass=state.classes[0];return state.activeClass;}
    openClassModal();throw new Error('Önce bir sınıf oluşturun.');
  }

  async function persistLesson(startLive=false) {
    const c=await ensureActiveClass();
    const plan=currentPlan();
    const lesson=await window.ESCSupabase.saveEducatorLesson({
      class_id:c.id,
      title:(c.name+' · '+($('#topic')?.selectedOptions[0]?.textContent||'English')).slice(0,120),
      topic:($('#topic')?.selectedOptions[0]?.textContent||'English').slice(0,80),
      duration_minutes:Number($('#duration')?.value||40),
      primary_goal:$('#goal')?.value||'speaking',
      plan,
      status:startLive?'active':'ready'
    });
    if(startLive){
      if(state.activeLive) {
        await window.ESCSupabase.updateEducatorSession(state.activeLive.id,{status:'completed',ended_at:new Date().toISOString()}).catch(()=>{});
      }
      const first=plan[0]||{};
      state.activeLive=await window.ESCSupabase.startEducatorSession({
        class_id:c.id,lesson_id:lesson.id,status:'active',current_index:0,
        current_stage:first.stage||'WARM-UP',
        current_payload:{title:first.title||'Warm-up',prompt:first.prompt||$('#adaptiveQuestion')?.textContent||'',instruction:$('#adaptiveSupport')?.textContent||''},
        scores:{blue:0,orange:0}
      });
      renderOverview();
    }
    return {lesson,plan};
  }

  async function syncLiveFromModal() {
    if(!state.activeLive) return;
    const scores={
      blue:Number($('#blueScore')?.textContent||0),
      orange:Number($('#orangeScore')?.textContent||0)
    };
    const stepText=$('#modalStep')?.textContent||'1 / 5';
    const idx=Math.max(0,Number(stepText.split('/')[0].trim())-1);
    state.activeLive=await window.ESCSupabase.updateEducatorSession(state.activeLive.id,{
      current_index:idx,
      current_stage:$('#liveStage')?.textContent||'LIVE',
      current_payload:{
        title:$('#liveStage')?.textContent||'Live activity',
        prompt:$('#liveQuestion')?.textContent||'',
        instruction:$('#liveInstruction')?.textContent||''
      },
      scores
    });
  }

  async function syncGameToLive() {
    if(!state.activeLive) return;
    state.activeLive=await window.ESCSupabase.updateEducatorSession(state.activeLive.id,{
      current_stage:'GAME · '+($('#gameModalTitle')?.textContent||'Classroom Game'),
      current_payload:{
        title:$('#gameModalTitle')?.textContent||'Classroom Game',
        prompt:$('#gameTaskMain')?.textContent||'',
        instruction:$('#gameTaskSupport')?.textContent||'',
        kind:'game'
      },
      scores:{
        blue:Number($('#gameBlueScore')?.textContent||0),
        orange:Number($('#gameOrangeScore')?.textContent||0)
      }
    });
  }

  function humanError(err) {
    const raw=String(err?.message||err||'İşlem tamamlanamadı.');
    if(/email not confirmed/i.test(raw)) return 'E-posta adresinizi doğruladıktan sonra giriş yapabilirsiniz.';
    if(/invalid login credentials/i.test(raw)) return 'E-posta veya şifre hatalı.';
    if(/user already registered/i.test(raw)) return 'Bu e-posta ile zaten bir hesap var.';
    if(/rate limit/i.test(raw)) return 'Çok fazla deneme yapıldı. Bir süre sonra tekrar deneyin.';
    return raw.replace('Database error saving new user','Hesap oluşturulamadı.');
  }

  function escapeHtml(v) {
    return String(v??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  document.addEventListener('DOMContentLoaded',()=>{
    $$('[data-teacher-login]').forEach(b=>b.addEventListener('click',()=> state.session ? document.querySelector('#teacher-demo')?.scrollIntoView({behavior:'smooth'}) : openAuth('login')));
    $('#eduAuthClose')?.addEventListener('click',closeAuth);
    $('#eduClassClose')?.addEventListener('click',closeClassModal);
    $('#eduAuthLayer')?.addEventListener('click',e=>{if(e.target.id==='eduAuthLayer')closeAuth();});
    $('#eduClassLayer')?.addEventListener('click',e=>{if(e.target.id==='eduClassLayer')closeClassModal();});
    $$('[data-auth-mode]').forEach(b=>b.addEventListener('click',()=>{state.authMode=b.dataset.authMode;syncAuthMode();}));
    $('#eduAuthForm')?.addEventListener('submit',authSubmit);
    $('#eduForgotPassword')?.addEventListener('click',async()=>{
      const email=$('#teacherEmail')?.value.trim();
      if(!email)return msg($('#eduAuthMessage'),'Önce e-posta adresinizi yazın.');
      try{await window.ESCSupabase.sendPasswordReset(email,'/educators/');msg($('#eduAuthMessage'),'Şifre yenileme bağlantısı e-postanıza gönderildi.',true);}catch(err){msg($('#eduAuthMessage'),humanError(err));}
    });
    $('#newClassButton')?.addEventListener('click',openClassModal);
    $('#eduClassForm')?.addEventListener('submit',createClass);
    $('[data-copy-code]')?.addEventListener('click',e=>copyText(state.activeClass?.join_code||'',e.currentTarget));

    $('#saveDemoClass')?.addEventListener('click',async e=>{
      if(!state.session)return openAuth('login');
      e.currentTarget.disabled=true;
      try{await persistLesson(false);e.currentTarget.textContent='Saved ✓';setTimeout(()=>e.currentTarget.textContent='Save lesson',1200);}
      catch(err){alert(humanError(err));}
      finally{e.currentTarget.disabled=false;}
    });

    $('#startDemoLesson')?.addEventListener('click',async e=>{
      if(!state.session){openAuth('login');return;}
      e.currentTarget.disabled=true;
      try{await persistLesson(true);setTimeout(()=>syncLiveFromModal().catch(()=>{}),120);}
      catch(err){alert(humanError(err));}
      finally{e.currentTarget.disabled=false;}
    });

    ['nextLiveQuestion','addBlue','addOrange'].forEach(id=>$('#'+id)?.addEventListener('click',()=>setTimeout(()=>syncLiveFromModal().catch(()=>{}),80)));
    $$('[data-launch-game]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>syncGameToLive().catch(()=>{}),120)));
    ['nextGameRound','gameBluePlus','gameBlueMinus','gameOrangePlus','gameOrangeMinus'].forEach(id=>$('#'+id)?.addEventListener('click',()=>setTimeout(()=>syncGameToLive().catch(()=>{}),80)));

    $('#joinDemoClass')?.addEventListener('click',()=>{location.href='../join/?code='+encodeURIComponent($('#studentCode')?.value.trim()||'');});
    $('[data-open-student]')?.addEventListener('click',()=>{window.open('../join/?code='+encodeURIComponent(state.activeClass?.join_code||''),'_blank');});

    bootAuth();
  });
})();