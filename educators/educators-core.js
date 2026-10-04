(() => {
  'use strict';

  const $ = (q, root=document) => root.querySelector(q);
  const $$ = (q, root=document) => [...root.querySelectorAll(q)];
  const state = { session:null, profile:null, classes:[], activeClass:null, activeLive:null, authMode:'login', classPoll:null, authUnsubscribe:null, entering:false };

  const t = (text) => window.ESCEduI18n?.t?.(text) || text;
  const isEn = () => window.ESCEduI18n?.getLang?.() === "en";
  const tx = (tr,en) => isEn() ? en : tr;

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
    window.ESCAnalytics?.track?.('educator_auth_open_'+mode,'other');
    const layer = $('#eduAuthLayer');
    if (!layer) return;
    layer.hidden = false;
    document.body.classList.add('edu-modal-open');
    syncAuthMode();
    setTimeout(() => (state.authMode==='reset' ? $('#teacherPassword') : $('#teacherEmail'))?.focus(), 60);
  }

  function closeAuth() {
    const layer = $('#eduAuthLayer');
    if (layer) layer.hidden = true;
    document.body.classList.remove('edu-modal-open');
  }

  function syncAuthMode() {
    const signup = state.authMode === 'signup';
    const reset = state.authMode === 'reset';
    const nameWrap=$('#teacherNameWrap');
    const emailWrap=$('#teacherEmail')?.closest('label');
    const tabs=$('.edu-auth-tabs');
    const forgot=$('#eduForgotPassword');
    if(nameWrap) nameWrap.hidden = !signup;
    if(emailWrap) emailWrap.hidden = reset;
    if($('#teacherEmail')) $('#teacherEmail').required = !reset;
    if(tabs) tabs.hidden = reset;
    if(forgot) forgot.hidden = reset;

    $('#eduAuthTitle').textContent = reset
      ? tx('Yeni şifrenizi belirleyin','Set a new password')
      : t(signup ? 'Ücretsiz öğretmen hesabı oluştur' : 'Öğretmen hesabına giriş yap');

    $('#eduAuthIntro').textContent = reset
      ? tx('En az 8 karakterden oluşan yeni şifrenizi yazın.','Enter a new password with at least 8 characters.')
      : t(signup
        ? 'Hesabınız açıldığında sınıflarınız ve dersleriniz cihazdan bağımsız olarak kaydedilir.'
        : 'Sınıflarınız, öğrenci kodlarınız ve dersleriniz hesabınıza kaydedilir.');

    $('#eduAuthSubmit').textContent = reset
      ? tx('Şifreyi güncelle →','Update password →')
      : t(signup ? 'Hesap oluştur →' : 'Giriş yap →');

    $('#teacherPassword').autocomplete = signup || reset ? 'new-password' : 'current-password';
    $$('[data-auth-mode]').forEach(b => b.classList.toggle('active', b.dataset.authMode === state.authMode));
    msg($('#eduAuthMessage'),'');
  }

  function showRestoringWorkspace() {
    const app = $('#teacherApp');
    if (!app) return;
    app.classList.add('teacher-locked');
    $('.teacher-lock-card')?.remove();
    const lock = document.createElement('div');
    lock.className = 'teacher-lock-card teacher-session-restore';
    lock.innerHTML = '<span>'+t('OTURUM KONTROLÜ')+'</span><h3>'+t('Hesabınız açılıyor…')+'</h3><p>'+t('Kayıtlı oturumunuz güvenli şekilde geri yükleniyor. Yeniden giriş yapmanız gerekmiyor.')+'</p><i class="session-spinner" aria-hidden="true"></i>';
    app.appendChild(lock);
  }

  async function restoreTeacherSession(session) {
    if (!session?.user?.id || state.entering) return;
    if (state.session?.user?.id === session.user.id && state.profile) return;
    state.entering = true;
    state.session = session;
    try {
      await enterTeacher();
    } catch (err) {
      console.warn('Teacher session restore failed', err);
      state.session = null;
      showLockedWorkspace();
    } finally {
      state.entering = false;
    }
  }

  async function bootAuth() {
    if (!window.ESCSupabase?.isConfigured()) return;
    showRestoringWorkspace();
    try {
      if (!state.authUnsubscribe && window.ESCSupabase.onAuthStateChange) {
        state.authUnsubscribe = await window.ESCSupabase.onAuthStateChange((event, session) => {
          setTimeout(() => {
            if (event === 'PASSWORD_RECOVERY' && session) {
              state.session=session;
              state.authMode='reset';
              openAuth('reset');
              return;
            }
            if (session) restoreTeacherSession(session);
            else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
              state.session=null;state.profile=null;state.classes=[];state.activeClass=null;state.activeLive=null;
              showLockedWorkspace();
            }
          }, 0);
        });
      }
      const session = await window.ESCSupabase.getSession();
      if (session) await restoreTeacherSession(session);
      else setTimeout(() => {
        if (!state.session && !state.entering) showLockedWorkspace();
      }, 900);
    } catch (err) {
      console.warn('Teacher auth boot failed', err);
      setTimeout(() => {
        if (!state.session && !state.entering) showLockedWorkspace();
      }, 300);
    }
  }

  function showLockedWorkspace() {
    $('#teacherApp')?.classList.add('teacher-locked');
    const title = $('#workspaceTitle');
    if (title) title.textContent = t('Öğretmen hesabınızla giriş yapın');
    const app = $('#teacherApp');
    if (app && !$('.teacher-lock-card', app)) {
      const lock = document.createElement('div');
      lock.className = 'teacher-lock-card';
      lock.innerHTML = '<span>TEACHER LOGIN</span><h3>'+t('Sınıflarınızı yönetmek için giriş yapın.')+'</h3><p>'+t('Gerçek sınıf kodları, öğrenci katılımları ve ders kayıtları hesabınıza bağlıdır.')+'</p><button type="button" data-teacher-login>'+t('Öğretmen girişi →')+'</button>';
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
    if (title) title.textContent = (window.ESCEduI18n?.getLang?.()==='en' ? 'Hello, ' : 'Merhaba, ') + teacherName() + ' 👋';
    ensureLogoutButton();
    await refreshClasses(true);
    document.dispatchEvent(new CustomEvent('esc:educator-ready'));
    if (state.classPoll) clearInterval(state.classPoll);
    state.classPoll = setInterval(() => { if(!document.hidden) refreshClasses(false).catch(()=>{}); }, 7000);
  }

  function ensureLogoutButton() {
    if ($('#eduLogout')) return;
    const wrap = $('.workspace-actions');
    if (!wrap) return;
    const b = document.createElement('button');
    b.id='eduLogout'; b.type='button'; b.className='ghost-button'; b.textContent=t('Çıkış');
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

    if (state.activeClass) {
      const fresh = state.classes.find(c => c.id === state.activeClass.id);
      state.activeClass = fresh || state.classes.find(x=>x.is_active) || state.classes[0] || null;
    } else {
      state.activeClass = state.classes.find(x=>x.is_active) || state.classes[0] || null;
    }

    state.activeLive = state.activeClass
      ? await window.ESCSupabase.getActiveEducatorSession(state.activeClass.id).catch(()=>null)
      : null;

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
    if (metrics[3]) metrics[3].textContent = state.activeClass?.name || '—';

    const code = $('.class-code-card strong');
    const codeText = state.activeClass?.join_code || '------';
    if (code) code.textContent = codeText;
    const desc = $('.class-code-card p');
    if (desc) desc.textContent = state.activeClass
      ? tx(`${state.activeClass.name} sınıfına bu kodla katılın.`,`Join ${state.activeClass.name} with this code.`)
      : tx("Önce bir sınıf oluşturun.","Create a class first.");

    const next = $('.next-lesson-card');
    if (next && state.activeClass) {
      $('h3', next).textContent = state.activeClass.name + ' · ' + (state.activeClass.focus || 'speaking');
      $('p', next).textContent = state.activeClass.age_group.replace('-', '–') + ' · ' + state.activeClass.level + ' · ' + (state.activeClass.students?.length || 0) + ' ' + tx('öğrenci','students');
      const head = $('.card-head b', next);
      if (head) head.textContent = state.activeLive ? tx('● CANLI','● LIVE NOW') : tx('Hazır','Ready');
    } else if (next) {
      const h=$('h3',next), p=$('p',next), head=$('.card-head b',next);
      if(h) h.textContent=tx('Henüz sınıf yok','No class yet');
      if(p) p.textContent=tx('İlk sınıfını oluştur; ders ve öğrenci akışı burada görünsün.','Create your first class to start planning lessons and students.');
      if(head) head.textContent=tx('Plan yok','No plan');
    }

    const table = $('.recent-table');
    if (table) {
      const title = $('.table-title span', table);
      if (title) title.textContent = state.classes.length + ' ' + tx('sınıf','classes');
      $$('.table-row:not(.table-head)', table).forEach(x=>x.remove());
      state.classes.slice(0,4).forEach(c => {
        const row=document.createElement('div');
        row.className='table-row';
        row.innerHTML=`<b>${escapeHtml(c.name)}</b><span>${escapeHtml(c.age_group)} · ${escapeHtml(c.level)}</span><span>${c.students?.length || 0} ${tx('öğrenci','students')}</span><span class="good">${c.is_active?tx('Aktif','Active'):tx('Kapalı','Closed')}</span>`;
        table.appendChild(row);
      });
    }
  }

  function renderClasses() {
    const grid=$('#classCardGrid');
    if (!grid) return;
    if (!state.session) {
      grid.innerHTML='<article class="empty-class-card"><h3>'+tx('Öğretmen girişi gerekli','Teacher sign-in required')+'</h3><p>'+tx('Sınıflar hesabınıza bağlı olarak burada görünür.','Your classes appear here after you sign in.')+'</p></article>';
      return;
    }
    if (!state.classes.length) {
      grid.innerHTML='<article class="empty-class-card"><h3>'+tx('Henüz sınıf yok.','No classes yet.')+'</h3><p>'+tx('“Yeni sınıf” ile ilk sınıfınızı oluşturun. Sistem otomatik katılım kodu üretir.','Create your first class. The system generates a join code automatically.')+'</p></article>';
      return;
    }
    grid.innerHTML = state.classes.map(c => `<article class="${state.activeClass?.id===c.id?'selected-class':''} ${c.is_active?'':'inactive-class'}">
      <div><span>${escapeHtml(c.name)}</span><small>${escapeHtml(c.age_group)} · ${escapeHtml(c.level)} · ${c.is_active?tx("Aktif","Active"):tx("Kapalı","Closed")}</small></div>
      <strong>${c.students?.length || 0} ${tx("öğrenci","students")}</strong>
      <p>${escapeHtml(c.focus)} · ${tx("Kod","Code")} <b class="inline-code">${escapeHtml(c.join_code)}</b></p>
      <div class="class-actions"><button type="button" data-live-class="${c.id}" ${c.is_active?'':'disabled'}>${c.is_active?tx("Sınıfı kullan →","Use class →"):tx("Sınıf kapalı","Class closed")}</button><button type="button" data-copy-class="${escapeHtml(c.join_code)}" ${c.is_active?'':'disabled'}>${tx("Kodu kopyala","Copy code")}</button><button type="button" data-copy-class-link="${escapeHtml(c.join_code)}" ${c.is_active?'':'disabled'}>${tx("Katılım linki","Copy join link")}</button></div>
    </article>`).join('');
    $$('[data-live-class]',grid).forEach(b=>b.addEventListener('click',()=>{
      const c=state.classes.find(x=>x.id===b.dataset.liveClass); if(!c)return;
      state.activeClass=c; applyClassToBuilder(c); renderClasses();renderOverview();
      document.querySelector('[data-panel="builder"]')?.click();
    }));
    $$('[data-copy-class]',grid).forEach(b=>b.addEventListener('click',()=>copyText(b.dataset.copyClass,b)));
    $$('[data-copy-class-link]',grid).forEach(b=>b.addEventListener('click',()=>copyText(location.origin+'/join/?code='+encodeURIComponent(b.dataset.copyClassLink),b)));
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
    if(button){const old=button.textContent;button.textContent=tx('Kopyalandı ✓','Copied ✓');setTimeout(()=>button.textContent=old,1200);}
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
    msg($('#eduClassMessage'),tx('Sınıf oluşturuluyor…','Creating class…'));
    try {
      const created=await window.ESCSupabase.createEducatorClass({
        name:$('#newClassName').value.trim(),
        age_group:$('#newClassAge').value,
        level:$('#newClassLevel').value,
        focus:$('#newClassFocus').value,
        max_students:Number($('#newClassMax').value||40)
      });
      state.activeClass={...created,students:[]};
      window.ESCAnalytics?.track?.('educator_class_created','other');
      msg($('#eduClassMessage'),tx(`Sınıf hazır. Katılım kodu: ${created.join_code}`,`Class ready. Join code: ${created.join_code}`),true);
      await refreshClasses(false);
      setTimeout(()=>{closeClassModal();applyClassToBuilder(state.activeClass);},900);
    } catch(err) {
      msg($('#eduClassMessage'),humanError(err));
    } finally {submit.disabled=false;}
  }

  async function authSubmit(e) {
    e.preventDefault();
    const submit=$('#eduAuthSubmit');submit.disabled=true;
    msg($('#eduAuthMessage'), state.authMode==='signup'?tx('Hesap oluşturuluyor…','Creating account…'):tx('Giriş yapılıyor…','Signing in…'));
    try {
      const email=$('#teacherEmail').value.trim(), password=$('#teacherPassword').value;
      if(state.authMode==='reset'){
        if(password.length<8) throw new Error(tx('Şifre en az 8 karakter olmalı.','Password must be at least 8 characters.'));
        await window.ESCSupabase.updatePassword(password);
        msg($('#eduAuthMessage'),tx('Şifreniz güncellendi ✓','Password updated ✓'),true);
        state.session=await window.ESCSupabase.getSession();
        window.ESCAnalytics?.track?.('educator_password_recovered','other');
        setTimeout(async()=>{
          state.authMode='login';
          closeAuth();
          if(state.session) await restoreTeacherSession(state.session);
        },700);
      }else if(state.authMode==='signup'){
        const data=await window.ESCSupabase.signUp(email,password,'/educators/');
        if(data.session){
          state.session=data.session;
          state.profile=await window.ESCSupabase.ensureEducatorProfile($('#teacherName').value.trim()||email.split('@')[0]);
          window.ESCAnalytics?.track?.('educator_signup_completed','other');
          closeAuth(); await enterTeacher(); document.querySelector('#teacher-demo')?.scrollIntoView({behavior:'smooth',block:'start'});
        }else{
          window.ESCAnalytics?.track?.('educator_signup_confirmation_sent','other');
          msg($('#eduAuthMessage'),tx('Hesap oluşturuldu. E-postanıza gelen doğrulama bağlantısını açın; ardından öğretmen paneline giriş yapın.','Account created. Open the verification link in your email, then sign in to the teacher platform.'),true);
        }
      }else{
        const data=await window.ESCSupabase.signIn(email,password);
        state.session=data.session;
        window.ESCAnalytics?.track?.('educator_login_completed','other');
        closeAuth();await enterTeacher();document.querySelector('#teacher-demo')?.scrollIntoView({behavior:'smooth',block:'start'});
      }
    }catch(err){msg($('#eduAuthMessage'),humanError(err));}
    finally{submit.disabled=false;}
  }

  function currentPlan() {
    const topic=$('#topic')?.value||'travel', duration=Number($('#duration')?.value||40);
    const rows=$$('.generated-plan .plan-row');
    const plan=rows.map((r,i)=>{
      const title=$('b',r)?.textContent||'Class activity';
      return {
        index:i,
        stage:title.toUpperCase(),
        title,
        duration:$('span',r)?.textContent||'',
        mode:$('small',r)?.textContent||'',
        prompt:i===0?($('#adaptiveQuestion')?.textContent||'Let’s start speaking.'):null
      };
    });
    return Array.isArray(plan)&&plan.length?plan:[
      {index:0,stage:'WARM-UP',title:'Warm-up speaking',duration:'5 min',prompt:$('#adaptiveQuestion')?.textContent||'Let’s start speaking.'},
      {index:1,stage:'VOCABULARY',title:topic+' vocabulary',duration:'8 min'},
      {index:2,stage:'PRACTICE GAME',title:'Adaptive practice game',duration:'10 min'},
      {index:3,stage:'SPEAKING',title:'Speaking practice',duration:'12 min'},
      {index:4,stage:'EXIT',title:'Exit question',duration:Math.max(2,duration-35)+' min'}
    ];
  }

  async function ensureActiveClass() {
    if (!state.session) {
      openAuth('login');
      throw new Error(tx('Önce öğretmen hesabına giriş yapın.','Sign in to your teacher account first.'));
    }
    if (state.activeClass?.is_active) return state.activeClass;
    const active=state.classes.find(x=>x.is_active);
    if (active) {
      state.activeClass=active;
      return active;
    }
    openClassModal();
    throw new Error(tx('Aktif bir sınıf yok. Yeni bir sınıf oluşturun.','There is no active class. Create a new class.'));
  }

  async function persistLesson(startLive=false) {
    const c=await ensureActiveClass();
    const plan=currentPlan();
    const lesson=await window.ESCSupabase.saveEducatorLesson({
      class_id:c.id,
      title:(c.name+' · '+(($('#topic')?.value==='custom'?$('#customTopic')?.value:$('#topic')?.selectedOptions[0]?.textContent)||'English')).slice(0,120),
      topic:((($('#topic')?.value==='custom'?$('#customTopic')?.value:$('#topic')?.selectedOptions[0]?.textContent)||'English')).slice(0,80),
      duration_minutes:Number($('#duration')?.value||40),
      primary_goal:$('#goal')?.value||'speaking',
      plan,
      status:startLive?'active':'ready'
    });
    window.ESCAnalytics?.track?.('educator_lesson_saved','other');
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
      window.ESCAnalytics?.track?.('educator_live_started','other');
    }
    return {lesson,plan};
  }

  async function syncLiveFromModal() {
    if(!state.activeLive) return;
    const modal=$('#lessonModal');
    const liveState=window.ESCEduLive?.getState?.()||{};
    const stageIndex=Number.isFinite(Number(liveState.stageIndex))?Number(liveState.stageIndex):Number(modal?.dataset.stageIndex||0);
    const questionIndex=Number.isFinite(Number(liveState.questionIndex))?Number(liveState.questionIndex):Number(modal?.dataset.questionIndex||0);
    const completed=liveState.completed===true||modal?.dataset.completed==='true';
    const patch={
      current_index:Math.max(0,stageIndex),
      current_stage:$('#liveStage')?.textContent||'LIVE',
      current_payload:{
        title:$('#liveStage')?.textContent||'Live activity',
        prompt:$('#liveQuestion')?.textContent||'',
        instruction:$('#liveInstruction')?.textContent||'',
        stage_key:liveState.stageKey||modal?.dataset.stageKey||null,
        question_index:Math.max(0,questionIndex),
        completed
      },
      scores:{
        blue:Number($('#blueScore')?.textContent||0),
        orange:Number($('#orangeScore')?.textContent||0)
      }
    };
    if(completed){
      patch.status='completed';
      patch.ended_at=new Date().toISOString();
    }
    state.activeLive=await window.ESCSupabase.updateEducatorSession(state.activeLive.id,patch);
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
    const raw=String(err?.message||err||tx('İşlem tamamlanamadı.','The action could not be completed.'));
    if(/email not confirmed/i.test(raw)) return tx('E-posta adresinizi doğruladıktan sonra giriş yapabilirsiniz.','Confirm your email address before signing in.');
    if(/invalid login credentials/i.test(raw)) return tx('E-posta veya şifre hatalı.','Email or password is incorrect.');
    if(/user already registered/i.test(raw)) return tx('Bu e-posta ile zaten bir hesap var.','An account already exists for this email.');
    if(/rate limit/i.test(raw)) return tx('Çok fazla deneme yapıldı. Bir süre sonra tekrar deneyin.','Too many attempts. Try again later.');
    return raw.replace('Database error saving new user',tx('Hesap oluşturulamadı.','Account could not be created.'));
  }

  function escapeHtml(v) {
    return String(v??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  document.addEventListener('DOMContentLoaded',()=>{
    $$('[data-teacher-login]').forEach(b=>b.addEventListener('click',()=> state.session ? document.querySelector('#teacher-demo')?.scrollIntoView({behavior:'smooth'}) : openAuth('login')));
    $$('[data-teacher-signup]').forEach(b=>b.addEventListener('click',()=> state.session ? document.querySelector('#teacher-demo')?.scrollIntoView({behavior:'smooth'}) : openAuth('signup')));
    $('#eduAuthClose')?.addEventListener('click',closeAuth);
    $('#eduClassClose')?.addEventListener('click',closeClassModal);
    $('#eduAuthLayer')?.addEventListener('click',e=>{if(e.target.id==='eduAuthLayer')closeAuth();});
    $('#eduClassLayer')?.addEventListener('click',e=>{if(e.target.id==='eduClassLayer')closeClassModal();});
    $$('[data-auth-mode]').forEach(b=>b.addEventListener('click',()=>{state.authMode=b.dataset.authMode;syncAuthMode();}));
    $('#eduAuthForm')?.addEventListener('submit',authSubmit);
    $('#eduForgotPassword')?.addEventListener('click',async()=>{
      const email=$('#teacherEmail')?.value.trim();
      if(!email)return msg($('#eduAuthMessage'),tx('Önce e-posta adresinizi yazın.','Enter your email first.'));
      try{await window.ESCSupabase.sendPasswordReset(email,'/educators/');msg($('#eduAuthMessage'),tx('Şifre yenileme bağlantısı e-postanıza gönderildi.','Password reset link sent to your email.'),true);}catch(err){msg($('#eduAuthMessage'),humanError(err));}
    });
    $('#newClassButton')?.addEventListener('click',openClassModal);
    $('#eduClassForm')?.addEventListener('submit',createClass);
    $('[data-copy-code]')?.addEventListener('click',e=>{
      const code=state.activeClass?.join_code||'';
      if(!code||!state.activeClass?.is_active)return alert(tx('Aktif bir sınıf seçin.','Select an active class.'));
      copyText(code,e.currentTarget);
    });
    $('[data-copy-join-link]')?.addEventListener('click',e=>{
      const code=state.activeClass?.join_code||'';
      if(!code||!state.activeClass?.is_active)return alert(tx('Aktif bir sınıf seçin.','Select an active class.'));
      copyText(location.origin+'/join/?code='+encodeURIComponent(code),e.currentTarget);
    });

    $('#saveDemoClass')?.addEventListener('click',async e=>{
      if(!state.session)return openAuth('login');
      const btn=e.currentTarget, old=btn.textContent;
      btn.disabled=true;
      try{await persistLesson(false);btn.textContent=tx('Kaydedildi ✓','Saved ✓');setTimeout(()=>btn.textContent=old,1200);}
      catch(err){alert(humanError(err));}
      finally{btn.disabled=false;}
    });

    $('#startDemoLesson')?.addEventListener('click',async e=>{
      if(!state.session){openAuth('login');return;}
      const btn=e.currentTarget;
      const oldText=btn.textContent;
      btn.disabled=true;
      btn.textContent=window.ESCEduI18n?.getLang?.()==='en'?'Starting lesson…':'Ders başlatılıyor…';
      try{
        await persistLesson(true);
        if(!window.ESCEduLive?.start)throw new Error(tx('Canlı ders arayüzü yüklenemedi. Sayfayı yenileyip tekrar deneyin.','The live lesson interface did not load. Refresh the page and try again.'));
        window.ESCEduLive.start();
        await syncLiveFromModal();
      }
      catch(err){alert(humanError(err));}
      finally{
        btn.disabled=false;
        btn.textContent=oldText;
      }
    });

    ['nextLiveQuestion','addBlue','addOrange'].forEach(id=>$('#'+id)?.addEventListener('click',()=>setTimeout(()=>syncLiveFromModal().catch(()=>{}),80)));
    $('#closeLessonModal')?.addEventListener('click',()=>syncLiveFromModal().catch(()=>{}));
    $$('[data-launch-game]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>syncGameToLive().catch(()=>{}),120)));
    ['nextGameRound','gameBluePlus','gameBlueMinus','gameOrangePlus','gameOrangeMinus'].forEach(id=>$('#'+id)?.addEventListener('click',()=>setTimeout(()=>syncGameToLive().catch(()=>{}),80)));

    // The embedded student demo stays on-page; the real student view opens from [data-open-student].
    $('[data-open-student]')?.addEventListener('click',()=>{
      const code=state.activeClass?.join_code||'';
      if(!code||!state.activeClass?.is_active)return alert(tx('Aktif bir sınıf seçin.','Select an active class.'));
      window.open('../join/?code='+encodeURIComponent(code),'_blank','noopener');
    });

    window.addEventListener('esc:languagechange',()=>{
      syncAuthMode();
      if(state.session && $('#workspaceTitle')) $('#workspaceTitle').textContent=(window.ESCEduI18n?.getLang?.()==='en'?'Hello, ':'Merhaba, ')+teacherName()+' 👋';
      if($('#eduLogout')) $('#eduLogout').textContent=t('Çıkış');
      renderClasses();renderOverview();
    });
    bootAuth();
  });
})();