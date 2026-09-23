(() => {
  'use strict';
  const $=q=>document.querySelector(q);
  const TOKEN_KEY='esc-edu-student-token-v1';
  const NAME_KEY='esc-edu-student-name-v1';
  let token='', state=null, poll=null, lastSignature='';

  function randomToken(){
    const a=new Uint8Array(32);crypto.getRandomValues(a);
    return [...a].map(x=>x.toString(16).padStart(2,'0')).join('');
  }
  function showMessage(text,ok=false){const el=$('#joinMessage');el.textContent=text;el.hidden=!text;el.classList.toggle('ok',ok);}
  function friendly(err){
    const s=String(err?.message||err||'Katılım tamamlanamadı.');
    if(s.includes('CLASS_NOT_FOUND'))return 'Bu sınıf kodu bulunamadı veya sınıf kapalı.';
    if(s.includes('CLASS_FULL'))return 'Bu sınıfın kontenjanı dolu.';
    if(s.includes('INVALID_NAME'))return 'Lütfen adını yaz.';
    if(s.includes('INVALID_CLASS_CODE'))return 'Sınıf kodunu kontrol et.';
    if(s.includes('STUDENT_SESSION_NOT_FOUND'))return 'Öğrenci oturumun bulunamadı. Yeniden katıl.';
    return s;
  }
  function setConnected(ok){
    const pill=$('.connection-pill');pill?.classList.toggle('offline',!ok);
    $('#connectionText').textContent=ok?'Connected':'Reconnecting…';
  }
  function signature(d){return JSON.stringify([d?.class?.id,d?.session?.id,d?.session?.status,d?.session?.current_index,d?.session?.current_stage,d?.session?.current_payload,d?.session?.scores]);}
  function paint(d){
    state=d;
    $('#joinView').hidden=true;$('#classroomView').hidden=false;
    const n=d.student?.display_name||localStorage.getItem(NAME_KEY)||'Student';
    $('#studentDisplayName').textContent=n;$('#studentAvatar').textContent=n.trim().charAt(0).toUpperCase()||'?';
    $('#classroomName').textContent=d.class?.name||'English Class';
    $('#classroomMeta').textContent=`${d.class?.age_group||''} · ${d.class?.level||''} · CODE ${d.class?.join_code||''}`;
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
    const b=$('#joinButton');b.disabled=true;showMessage('Sınıfa bağlanılıyor…');
    try{
      token=localStorage.getItem(TOKEN_KEY)||randomToken();
      const data=await window.ESCSupabase.joinEducatorClass(code,name,token);
      localStorage.setItem(TOKEN_KEY,token);localStorage.setItem(NAME_KEY,name);
      showMessage('',true);paint({student:{display_name:name},...data});
      lastSignature=signature({student:{display_name:name},...data});
      startPolling();
    }catch(err){showMessage(friendly(err));}
    finally{b.disabled=false;}
  }
  function startPolling(){if(poll)clearInterval(poll);poll=setInterval(refresh,2000);}
  function leave(reload=true){if(poll)clearInterval(poll);poll=null;token='';state=null;lastSignature='';localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(NAME_KEY);if(reload)location.href='./';}
  async function result(kind){
    if(!token||!state?.session?.id)return;
    const button=document.querySelector(`[data-result="${kind}"]`);if(button)button.disabled=true;
    try{await window.ESCSupabase.submitStudentResult(token,state.session.id,kind,kind==='participated'?100:0,{stage:state.session.current_stage||''});if(button){const old=button.textContent;button.textContent='Sent ✓';setTimeout(()=>button.textContent=old,1200);}}
    catch{}
    finally{if(button)button.disabled=false;}
  }
  async function boot(){
    const params=new URLSearchParams(location.search);const code=params.get('code')||'';
    if(code)$('#joinCode').value=code.toUpperCase();
    const savedName=localStorage.getItem(NAME_KEY)||'';if(savedName)$('#joinName').value=savedName;
    token=localStorage.getItem(TOKEN_KEY)||'';
    if(token){
      try{const data=await window.ESCSupabase.getStudentState(token);paint(data);lastSignature=signature(data);startPolling();return;}catch{leave(false);}
    }
    $('#joinView').hidden=false;$('#classroomView').hidden=true;
  }
  $('#joinForm')?.addEventListener('submit',join);
  $('#leaveClass')?.addEventListener('click',()=>leave(true));
  document.querySelectorAll('[data-result]').forEach(b=>b.addEventListener('click',()=>result(b.dataset.result)));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&token)refresh();});
  window.addEventListener('online',()=>{setConnected(true);refresh();});
  window.addEventListener('offline',()=>setConnected(false));
  boot();
})();