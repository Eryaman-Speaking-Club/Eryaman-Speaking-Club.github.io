(() => {
  'use strict';
  const $=q=>document.querySelector(q);
  const TOKEN_KEY='esc-edu-student-token-v1';
  const NAME_KEY='esc-edu-student-name-v1';
  const CLASS_CODE_KEY='esc-edu-student-class-code-v1';
  const LANG_KEY='esc-student-lang-v1';
  let token='', state=null, poll=null, lastSignature='', lang='tr';
  const tx=(tr,en)=>lang==='en'?en:tr;
  const esc=(v='')=>String(v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));

  function randomToken(){
    const a=new Uint8Array(32);crypto.getRandomValues(a);
    return [...a].map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  function showMessage(text,ok=false){const el=$('#joinMessage');el.textContent=text;el.hidden=!text;el.classList.toggle('ok',ok);}
  function friendly(err){
    const s=String(err?.message||err||tx('Katılım tamamlanamadı.','Could not join the class.'));
    if(s.includes('CLASS_NOT_FOUND'))return tx('Bu sınıf kodu bulunamadı veya sınıf kapalı.','This class code was not found or the class is closed.');
    if(s.includes('CLASS_FULL'))return tx('Bu sınıfın kontenjanı dolu.','This class is full.');
    if(s.includes('INVALID_NAME'))return tx('Lütfen adını yaz.','Enter your name.');
    if(s.includes('INVALID_CLASS_CODE'))return tx('Sınıf kodunu kontrol et.','Check the class code.');
    if(s.includes('TOKEN_CLASS_MISMATCH'))return tx('Bu cihazdaki eski sınıf oturumu yenilendi. Tekrar katıl.','Your previous class session was reset. Please join again.');
    if(s.includes('STUDENT_SESSION_NOT_FOUND'))return tx('Öğrenci oturumun bulunamadı. Yeniden katıl.','Your student session was not found. Join again.');
    return s;
  }
  function setConnected(ok){
    const pill=$('.connection-pill');pill?.classList.toggle('offline',!ok);
    $('#connectionText').textContent=ok?tx('Bağlı','Connected'):tx('Yeniden bağlanıyor…','Reconnecting…');
  }
  function signature(d){return JSON.stringify([d?.class?.id,d?.session?.id,d?.session?.status,d?.session?.current_index,d?.session?.current_stage,d?.session?.current_payload,d?.session?.scores,d?.assignments]);}

  function applyLanguage(next){
    lang=next==='en'?'en':'tr';
    document.documentElement.lang=lang;
    document.title=tx('Sınıfa Katıl · English Teacher Platform','Join Class · English Teacher Platform');
    const meta=document.querySelector('meta[name="description"]');
    if(meta)meta.setAttribute('content',tx('Öğretmeninin verdiği sınıf koduyla derse ve ödevlere katıl.','Join lessons and assignments with the class code from your teacher.'));
    try{localStorage.setItem(LANG_KEY,lang);}catch{}
    document.querySelectorAll('[data-join-lang]').forEach(b=>b.classList.toggle('active',b.dataset.joinLang===lang));
    const set=(sel,tr,en)=>{const el=$(sel);if(el)el.textContent=tx(tr,en);};
    const setLabel=(sel,tr,en)=>{const el=$(sel);if(el?.firstChild)el.firstChild.nodeValue=tx(tr,en)+' ';};
    set('.join-kicker','ÖĞRENCİ GİRİŞİ','STUDENT JOIN');
    set('.join-card h1','Sınıfına katıl.','Join your class.');
    set('.join-card>p','Öğretmeninin verdiği sınıf kodunu ve adını gir. Öğrenci hesabı veya e-posta gerekmez.','Enter the class code from your teacher and your name. No student account or email is required.');
    setLabel('#joinForm label:nth-of-type(1)','Sınıf kodu','Class code');
    setLabel('#joinForm label:nth-of-type(2)','Adın','Your name');
    set('#joinButton','Sınıfa katıl →','Join class →');
    set('.join-safe b','Basit öğrenci girişi','Simple student access');
    set('.join-safe small','Bu ekran için e-posta, telefon numarası veya şifre istemiyoruz.','No email, phone number or password is required on this screen.');
    set('.join-help p:nth-of-type(1) b','Kodu gir','Enter the code');
    set('.join-help p:nth-of-type(1) small','Öğretmenin verdiği sınıf kodunu kullan.','Use the class code from your teacher.');
    set('.join-help p:nth-of-type(2) b','Adını yaz','Enter your name');
    set('.join-help p:nth-of-type(2) small','Sınıfta görünecek kısa adını kullan.','Use the short name you want shown in class.');
    set('.join-help p:nth-of-type(3) b','Ekranı açık tut','Keep the screen open');
    set('.join-help p:nth-of-type(3) small','Öğretmen soru değiştirdikçe ekranın otomatik yenilenir.','Your screen updates automatically when the teacher changes the activity.');
    set('#completedState small','DERS TAMAMLANDI','CLASS COMPLETED');
    set('#completedState h2','Harika iş!','Good work!');
    set('#completedState p','Ders sona erdi. Öğretmenin yeni bir oturum başlatırsa bu ekran yeniden güncellenebilir.','The lesson has ended. This screen will update again if your teacher starts a new session.');
    const actions=document.querySelectorAll('#studentAction button');
    if(actions[0])actions[0].textContent=tx('Cevap verdim ✓','I answered ✓');
    if(actions[1])actions[1].textContent=tx('Yardıma ihtiyacım var','I need help');
    set('.sync-note','Ders akışını öğretmen yönetir. Ekranın otomatik güncellenir.','Your teacher controls the lesson flow. Your screen updates automatically.');
    set('#waitingState>small',"BAĞLANDIN","YOU'RE IN");
    set('#waitingState h2','Öğretmenin dersi başlatmasını bekliyoruz.','Waiting for your teacher to start the lesson.');
    set('#waitingState p','Bu ekran açık kalsın. Ders veya oyun başladığında otomatik olarak güncellenecek.','Keep this screen open. It updates automatically when a lesson or game starts.');
    set('[data-jt="joinedAs"]','KATILAN','JOINED AS');
    set('[data-jt="leave"]','Ayrıl','Leave');
    set('[data-jt="assignmentsKicker"]','ÖDEVLER','ASSIGNMENTS');
    set('[data-jt="assignmentsTitle"]','Sınıf ödevlerin','Your class assignments');
    const link=$('[data-jt="teacherLink"]');if(link)link.innerHTML=tx('Öğretmen misiniz? <b>Öğretmen paneli →</b>','Are you a teacher? <b>Teacher platform →</b>');
    if(state) renderAssignments(state.assignments||[]);
  }

  function renderAssignments(items=[]){
    const zone=$('#assignmentZone'),list=$('#studentAssignmentList'),count=$('#assignmentCount');
    if(!zone||!list)return;
    zone.hidden=!items.length;
    if(count)count.textContent=String(items.length);
    if(!items.length){list.innerHTML='';return;}
    list.innerHTML=items.map(a=>{
      const due=a.due_at?new Intl.DateTimeFormat(lang==='en'?'en-GB':'tr-TR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(a.due_at)):tx('Son tarih yok','No due date');
      if(a.completed)return '<article class="student-assignment completed"><div class="student-assignment-top"><span>'+tx('TESLİM EDİLDİ','COMPLETED')+'</span><small>'+esc(due)+'</small></div><h3>'+esc(a.title)+'</h3><p>'+esc(a.instructions||'')+'</p><b>✓ '+tx('Bu ödevi tamamladın.','You completed this assignment.')+'</b></article>';
      if(a.overdue)return '<article class="student-assignment overdue"><div class="student-assignment-top"><span>'+tx('SÜRE DOLDU','CLOSED')+'</span><small>'+esc(due)+'</small></div><h3>'+esc(a.title)+'</h3><p>'+esc(a.instructions||'')+'</p><b>'+tx('Son teslim tarihi geçti. Yeni teslim kabul edilmiyor.','The deadline has passed. New submissions are closed.')+'</b></article>';
      return '<article class="student-assignment"><div class="student-assignment-top"><span>'+tx('YAPILACAK','TO DO')+'</span><small>'+esc(due)+'</small></div><h3>'+esc(a.title)+'</h3><p>'+esc(a.instructions||tx('Öğretmeninin verdiği görevi tamamla.','Complete the task from your teacher.'))+'</p><label>'+tx('Kısa cevabın / notun','Your short answer / note')+'<textarea rows="3" maxlength="1200" data-assignment-response="'+esc(a.id)+'" placeholder="'+esc(tx('Buraya yaz…','Write here…'))+'"></textarea></label><button type="button" data-assignment-submit="'+esc(a.id)+'">'+tx('Ödevi teslim et →','Submit assignment →')+'</button></article>';
    }).join('');
    document.querySelectorAll('[data-assignment-submit]').forEach(b=>b.addEventListener('click',()=>submitAssignment(b.dataset.assignmentSubmit,b)));
  }

  async function submitAssignment(id,button){
    if(!token||!id)return;
    const response=document.querySelector('[data-assignment-response="'+CSS.escape(id)+'"]')?.value.trim()||'';
    button.disabled=true;
    const old=button.textContent;button.textContent=tx('Teslim ediliyor…','Submitting…');
    try{
      const ok=await window.ESCSupabase.submitStudentResult(token,null,'assignment',null,{assignment_id:id,response});
      if(!ok)throw new Error('SUBMIT_FAILED');
      button.textContent=tx('Teslim edildi ✓','Submitted ✓');
      await refresh();
    }catch{button.textContent=tx('Tekrar dene','Try again');setTimeout(()=>button.textContent=old,1400);}
    finally{button.disabled=false;}
  }
  function paint(d){
    state=d;
    $('#joinView').hidden=true;$('#classroomView').hidden=false;
    const n=d.student?.display_name||localStorage.getItem(NAME_KEY)||'Student';
    $('#studentDisplayName').textContent=n;$('#studentAvatar').textContent=n.trim().charAt(0).toUpperCase()||'?';
    $('#classroomName').textContent=d.class?.name||'English Class';
    $('#classroomMeta').textContent=`${d.class?.age_group||''} · ${d.class?.level||''} · CODE ${d.class?.join_code||''}`;
    renderAssignments(d.assignments||[]);
    const session=d.session;
    $('#waitingState').hidden=Boolean(session);
    $('#liveState').hidden=!session || session.status==='completed';
    $('#completedState').hidden=!session || session.status!=='completed';
    if(session && session.status!=='completed'){
      const payload=session.current_payload||{};
      $('#liveStage').textContent=session.current_stage||'LIVE';
      $('#liveTitle').textContent=payload.title||session.current_stage||'CLASS ACTIVITY';
      $('#livePrompt').textContent=payload.prompt||'Teacher is preparing the next activity…';
      $('#liveInstruction').textContent=payload.instruction||'Keep this screen open.';
      $('#studentBlueScore').textContent=Number(session.scores?.blue||0);
      $('#studentOrangeScore').textContent=Number(session.scores?.orange||0);
    }
  }
  async function refresh(){
    if(!token)return;
    try{
      const data=await window.ESCSupabase.getStudentState(token);
      setConnected(true);
      const sig=signature(data);
      if(sig!==lastSignature){lastSignature=sig;paint(data);}
    }catch(err){
      setConnected(false);
      if(String(err?.message||'').includes('STUDENT_SESSION_NOT_FOUND')) leave(false);
    }
  }
  async function join(e){
    e.preventDefault();
    const code=$('#joinCode').value.trim().toUpperCase(), name=$('#joinName').value.trim();
    const b=$('#joinButton');b.disabled=true;showMessage(tx('Sınıfa bağlanılıyor…','Joining class…'));
    try{
      token=localStorage.getItem(TOKEN_KEY)||randomToken();
      const data=await window.ESCSupabase.joinEducatorClass(code,name,token);
      localStorage.setItem(TOKEN_KEY,token);localStorage.setItem(NAME_KEY,name);localStorage.setItem(CLASS_CODE_KEY,code);
      showMessage('',true);
      let fullState=null;
      try{fullState=await window.ESCSupabase.getStudentState(token);}catch{}
      const painted=fullState||{student:{display_name:name},...data};
      paint(painted);
      lastSignature=signature(painted);
      startPolling();
    }catch(err){showMessage(friendly(err));}
    finally{b.disabled=false;}
  }
  function startPolling(){if(poll)clearInterval(poll);poll=setInterval(refresh,3500);}
  function leave(reload=true){if(poll)clearInterval(poll);poll=null;token='';state=null;lastSignature='';localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(CLASS_CODE_KEY);if(reload)location.href='./';}
  async function result(kind){
    if(!token||!state?.session?.id)return;
    const button=document.querySelector(`[data-result="${kind}"]`);if(button)button.disabled=true;
    try{await window.ESCSupabase.submitStudentResult(token,state.session.id,kind,kind==='participated'?100:0,{stage:state.session.current_stage||''});if(button){const old=button.textContent;button.textContent=tx('Gönderildi ✓','Sent ✓');setTimeout(()=>button.textContent=old,1200);}}
    catch{}
    finally{if(button)button.disabled=false;}
  }
  async function boot(){
    const params=new URLSearchParams(location.search);const code=params.get('code')||'';
    let savedLang='';try{savedLang=localStorage.getItem(LANG_KEY)||'';}catch{}
    const queryLang=params.get('lang');
    applyLanguage(queryLang==='en'||queryLang==='tr'?queryLang:(savedLang==='en'||savedLang==='tr'?savedLang:((navigator.language||'').toLowerCase().startsWith('tr')?'tr':'en')));
    if(code)$('#joinCode').value=code.toUpperCase();
    const savedName=localStorage.getItem(NAME_KEY)||'';if(savedName)$('#joinName').value=savedName;
    const savedClassCode=(localStorage.getItem(CLASS_CODE_KEY)||'').toUpperCase();
    token=localStorage.getItem(TOKEN_KEY)||'';
    if(code && token && (!savedClassCode || savedClassCode!==code.toUpperCase())){
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(CLASS_CODE_KEY);
      token='';
    }
    if(token){
      try{
        const data=await window.ESCSupabase.getStudentState(token);
        if(data?.class?.join_code)localStorage.setItem(CLASS_CODE_KEY,String(data.class.join_code).toUpperCase());
        paint(data);lastSignature=signature(data);startPolling();return;
      }catch{leave(false);}
    }
    $('#joinView').hidden=false;$('#classroomView').hidden=true;
  }
  document.querySelectorAll('[data-join-lang]').forEach(b=>b.addEventListener('click',()=>applyLanguage(b.dataset.joinLang)));
  $('#joinForm')?.addEventListener('submit',join);
  $('#leaveClass')?.addEventListener('click',()=>leave(true));
  document.querySelectorAll('[data-result]').forEach(b=>b.addEventListener('click',()=>result(b.dataset.result)));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&token)refresh();});
  window.addEventListener('online',()=>{setConnected(true);refresh();});
  window.addEventListener('offline',()=>setConnected(false));
  boot();
})();