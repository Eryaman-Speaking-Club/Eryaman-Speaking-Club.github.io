(() => {
  'use strict';

  const $ = (q, root=document) => root.querySelector(q);
  const $$ = (q, root=document) => [...root.querySelectorAll(q)];
  const state = { lessons:[], classes:[], results:[], sessions:[], ready:false };

  const esc = (v='') => String(v).replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[ch]));

  function fmtDate(value) {
    if (!value) return '';
    try {
      return new Intl.DateTimeFormat('tr-TR',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(value));
    } catch { return ''; }
  }

  function openPanel(name) {
    const desktop = document.querySelector('.side-item[data-panel="'+name+'"]');
    const mobile = document.querySelector('.mobile-workspace-tabs [data-panel="'+name+'"]');
    (desktop || mobile)?.click();
    document.querySelector('#teacher-demo')?.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function classNameFor(id) {
    return state.classes.find(c => c.id === id)?.name || 'Sınıf';
  }

  function lessonGoalLabel(goal) {
    const map = {speaking:'Speaking',vocabulary:'Vocabulary',grammar:'Grammar',mixed:'Mixed'};
    return map[goal] || goal || 'English';
  }

  function renderSetup() {
    const done = {
      account:true,
      class:state.classes.length > 0,
      lesson:state.lessons.length > 0,
      live:state.sessions.length > 0
    };
    const complete = Object.values(done).filter(Boolean).length;
    const percent = Math.round((complete / 4) * 100);
    const label = $('#teacherSetupPercent');
    const bar = $('#teacherSetupProgress');
    if (label) label.textContent = percent + '%';
    if (bar) bar.style.width = percent + '%';

    $$('[data-setup-step]').forEach(btn => {
      const key = btn.dataset.setupStep;
      btn.classList.toggle('done', !!done[key]);
      const em = $('em', btn);
      if (em) em.textContent = done[key] ? '✓' : '→';
    });
  }

  function setupActions() {
    $$('[data-setup-step]').forEach(btn => btn.addEventListener('click', () => {
      const step = btn.dataset.setupStep;
      if (step === 'account') return;
      if (step === 'class') openPanel('classes');
      if (step === 'lesson') openPanel(state.classes.length ? 'builder' : 'classes');
      if (step === 'live') openPanel(state.lessons.length ? 'library' : 'builder');
    }));
  }

  function recentLessonCard(lesson) {
    return `<button class="recent-lesson-item" type="button" data-open-lesson="${esc(lesson.id)}">
      <span><b>${esc(lesson.title || lesson.topic || 'English lesson')}</b><small>${esc(classNameFor(lesson.class_id))} · ${esc(lessonGoalLabel(lesson.primary_goal))} · ${Number(lesson.duration_minutes || 0)} dk</small></span>
      <em>→</em>
    </button>`;
  }

  function renderRecent() {
    const wrap = $('#recentLessonList');
    if (!wrap) return;
    if (!state.lessons.length) {
      wrap.innerHTML = '<div class="recent-empty"><strong>Henüz kaydedilmiş ders yok.</strong><span>İlk dersini oluşturup kaydettiğinde burada görünecek.</span><button type="button" data-open-builder>İlk dersi oluştur →</button></div>';
      $('[data-open-builder]', wrap)?.addEventListener('click',()=>openPanel('builder'));
      return;
    }
    wrap.innerHTML = state.lessons.slice(0,3).map(recentLessonCard).join('');
    $$('[data-open-lesson]',wrap).forEach(b=>b.addEventListener('click',()=>{
      const lesson=state.lessons.find(x=>x.id===b.dataset.openLesson);
      if(lesson) loadLessonIntoBuilder(lesson);
    }));
  }

  function lessonCard(lesson) {
    const planCount = Array.isArray(lesson.plan) ? lesson.plan.length : 0;
    return `<article class="lesson-library-card" data-library-card data-search="${esc(((lesson.title||'')+' '+(lesson.topic||'')+' '+(lesson.primary_goal||'')).toLowerCase())}" data-goal="${esc(lesson.primary_goal||'')}">
      <div class="library-card-top">
        <span>${esc(lessonGoalLabel(lesson.primary_goal))}</span>
        <small>${esc(fmtDate(lesson.updated_at || lesson.created_at))}</small>
      </div>
      <h4>${esc(lesson.title || lesson.topic || 'English lesson')}</h4>
      <p>${esc(classNameFor(lesson.class_id))} · ${esc(lesson.topic || 'English')} · ${Number(lesson.duration_minutes || 0)} dk</p>
      <div class="library-card-meta"><span>${planCount} aşama</span><span>${esc(lesson.status || 'saved')}</span></div>
      <div class="library-card-actions">
        <button type="button" data-lesson-use="${esc(lesson.id)}">Düzenle / kullan</button>
        <button type="button" data-lesson-duplicate="${esc(lesson.id)}">Kopyala</button>
        <button type="button" data-lesson-print="${esc(lesson.id)}">Yazdır</button>
        <button type="button" class="danger-lite" data-lesson-delete="${esc(lesson.id)}">Sil</button>
      </div>
    </article>`;
  }

  function renderLibrary() {
    const grid = $('#lessonLibraryGrid');
    if (!grid) return;
    if (!state.lessons.length) {
      grid.innerHTML = '<div class="library-empty"><strong>Henüz kayıtlı dersin yok.</strong><span>Lesson Builder ile ilk dersini oluştur, kaydet ve bundan sonra tekrar tekrar kullan.</span><button type="button" data-empty-create>+ İlk dersi oluştur</button></div>';
      $('[data-empty-create]',grid)?.addEventListener('click',()=>openPanel('builder'));
      return;
    }
    grid.innerHTML = state.lessons.map(lessonCard).join('');

    $$('[data-lesson-use]',grid).forEach(b=>b.addEventListener('click',()=>{
      const lesson=state.lessons.find(x=>x.id===b.dataset.lessonUse);
      if(lesson) loadLessonIntoBuilder(lesson);
    }));
    $('[data-lesson-duplicate]',grid).forEach(b=>b.addEventListener('click',async()=>{
      const lesson=state.lessons.find(x=>x.id===b.dataset.lessonDuplicate);
      if(!lesson) return;
      b.disabled=true;
      try{
        await window.ESCSupabase.saveEducatorLesson({
          class_id:lesson.class_id,
          title:((lesson.title||lesson.topic||'English lesson')+' · Kopya').slice(0,120),
          topic:lesson.topic||'English',
          duration_minutes:Number(lesson.duration_minutes||40),
          primary_goal:lesson.primary_goal||'speaking',
          plan:Array.isArray(lesson.plan)?lesson.plan:[],
          status:'ready'
        });
        window.ESCAnalytics?.track?.('educator_lesson_duplicated','other');
        await refreshData();
      }catch(err){alert(err?.message||'Ders kopyalanamadı.');}
      finally{b.disabled=false;}
    }));
    $('[data-lesson-print]',grid).forEach(b=>b.addEventListener('click',()=>{
      const lesson=state.lessons.find(x=>x.id===b.dataset.lessonPrint);
      if(lesson) printLesson(lesson);
    }));
    $$('[data-lesson-delete]',grid).forEach(b=>b.addEventListener('click',async()=>{
      const lesson=state.lessons.find(x=>x.id===b.dataset.lessonDelete);
      if(!lesson) return;
      if(!confirm('“'+(lesson.title||lesson.topic||'Bu ders')+'” silinsin mi?')) return;
      b.disabled=true;
      try {
        await window.ESCSupabase.deleteEducatorLesson(lesson.id);
        await refreshData();
      } catch (err) {
        alert(err?.message || 'Ders silinemedi.');
      } finally { b.disabled=false; }
    }));
    applyLibraryFilters();
  }

  function applyLibraryFilters() {
    const q = ($('#lessonLibrarySearch')?.value || '').trim().toLowerCase();
    const goal = $('#lessonLibraryGoal')?.value || 'all';
    $$('[data-library-card]').forEach(card => {
      const text = card.dataset.search || '';
      const matchText = !q || text.includes(q);
      const matchGoal = goal === 'all' || card.dataset.goal === goal;
      card.hidden = !(matchText && matchGoal);
    });
  }

  function mapTopic(topic) {
    const t=String(topic||'').toLowerCase();
    const known=['travel','food','school','hobbies','technology','daily-life'];
    if(known.includes(t)) return t;
    if(t.includes('travel')||t.includes('city')||t.includes('journey')) return 'travel';
    if(t.includes('food')||t.includes('culture')) return 'food';
    if(t.includes('school')||t.includes('education')) return 'school';
    if(t.includes('hobby')||t.includes('hobbies')) return 'hobbies';
    if(t.includes('tech')||t.includes('future')) return 'technology';
    if(t.includes('daily')||t.includes('life')) return 'daily-life';
    return 'custom';
  }

  function loadLessonIntoBuilder(lesson) {
    window.ESCAnalytics?.track?.('educator_lesson_reused','other');
    const klass = state.classes.find(c=>c.id===lesson.class_id);
    const className = $('#className');
    const age = $('#ageGroup');
    const level = $('#level');
    const duration = $('#duration');
    const goal = $('#goal');
    const topic = $('#topic');
    const custom = $('#customTopic');

    if(className) className.value = klass?.name || className.value;
    if(age && klass?.age_group) age.value = klass.age_group;
    if(level && klass?.level) level.value = klass.level;
    if(duration) duration.value = String(lesson.duration_minutes || 40);
    if(goal && lesson.primary_goal) goal.value = lesson.primary_goal;

    const mapped = mapTopic(lesson.topic);
    if(topic) {
      topic.value = mapped;
      topic.dispatchEvent(new Event('change',{bubbles:true}));
    }
    if(mapped === 'custom' && custom) {
      custom.value = lesson.topic || '';
      custom.dispatchEvent(new Event('input',{bubbles:true}));
    }

    openPanel('builder');
    setTimeout(()=>{
      const plan=Array.isArray(lesson.plan)?lesson.plan:[];
      const planEl=$('#generatedPlan');
      if(planEl && plan.length){
        planEl.innerHTML=plan.map((step,i)=>{
          const duration=esc(step.duration||'');
          const title=esc(step.title||step.stage||('Stage '+(i+1)));
          const mode=esc(step.mode||'Saved');
          return '<div class="plan-row" data-stage-key="'+esc(String(step.stage||step.title||i).toLowerCase())+'"><span>'+duration+'</span><b>'+title+'</b><small>'+mode+'</small></div>';
        }).join('');
      }
      const first=plan[0]||{};
      if(first.prompt && $('#adaptiveQuestion')) $('#adaptiveQuestion').textContent=first.prompt;
      if($('#lessonGenerateStatus')){
        $('#lessonGenerateStatus').hidden=false;
        $('#lessonGenerateStatus').className='lesson-generate-status is-ready';
        $('#lessonGenerateStatus').textContent='Kaydedilmiş ders yüklendi ✓ Değiştirip yeniden kaydedebilir veya doğrudan başlatabilirsin.';
      }
      document.querySelector('#lessonForm')?.scrollIntoView({behavior:'smooth',block:'start'});
    },180);
  }

  function printLesson(lesson) {
    window.ESCAnalytics?.track?.('educator_lesson_printed','other');
    const plan = Array.isArray(lesson.plan) ? lesson.plan : [];
    const rows = plan.map((step,i)=>`<tr><td>${i+1}</td><td>${esc(step.stage||step.title||'Stage')}</td><td>${esc(step.duration||'')}</td><td>${esc(step.prompt||step.mode||'')}</td></tr>`).join('');
    const popup = window.open('','_blank','width=900,height=700');
    if(!popup) return alert('Yazdırma penceresi engellendi. Tarayıcıdan açılır pencerelere izin verin.');
    popup.document.write(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${esc(lesson.title||'Ders Planı')}</title><style>
      body{font-family:Arial,sans-serif;color:#102d4e;margin:40px;line-height:1.5}h1{font-size:28px;margin:0 0 6px}.meta{color:#667b8e;margin-bottom:24px}
      table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #dce5ed;padding:10px;text-align:left;vertical-align:top}th{background:#f4f7fa}
      .brand{font-weight:800;margin-bottom:28px;color:#0b2f5b}@media print{body{margin:20mm}}
    </style></head><body><div class="brand">Eryaman Speaking Club Educators</div><h1>${esc(lesson.title||lesson.topic||'Ders Planı')}</h1><div class="meta">${esc(classNameFor(lesson.class_id))} · ${esc(lesson.topic||'')} · ${esc(lessonGoalLabel(lesson.primary_goal))} · ${Number(lesson.duration_minutes||0)} dk</div><table><thead><tr><th>#</th><th>Aşama</th><th>Süre</th><th>Not / Prompt</th></tr></thead><tbody>${rows||'<tr><td colspan="4">Ders planı içeriği bulunamadı.</td></tr>'}</tbody></table><script>window.onload=()=>window.print()<\/script></body></html>`);
    popup.document.close();
  }

  function renderReports() {
    const selectedClass=$('#reportClassFilter')?.value||'all';
    const reportRows=selectedClass==='all'?state.results:state.results.filter(r=>r.class_id===selectedClass);
    const attempts = reportRows.length;
    const scored = reportRows.filter(r => r.score !== null && r.score !== undefined && Number.isFinite(Number(r.score)));
    const avg = scored.length ? scored.reduce((s,r)=>s+Number(r.score),0)/scored.length : null;
    const students = new Set(reportRows.map(r=>r.student_id).filter(Boolean)).size;
    const groups = new Map();

    reportRows.forEach(r=>{
      const key=String(r.activity_type||'activity');
      if(!groups.has(key)) groups.set(key,{count:0,scores:[]});
      const g=groups.get(key); g.count++;
      if(r.score!==null && r.score!==undefined && Number.isFinite(Number(r.score))) g.scores.push(Number(r.score));
    });

    const sorted=[...groups.entries()].sort((a,b)=>b[1].count-a[1].count);
    const top=sorted[0]?.[0] || '—';

    if($('#reportAttemptCount')) $('#reportAttemptCount').textContent=String(attempts);
    if($('#reportAverageScore')) $('#reportAverageScore').textContent=avg===null?'—':Math.round(avg)+'%';
    if($('#reportStudentCount')) $('#reportStudentCount').textContent=String(students);
    if($('#reportTopActivity')) $('#reportTopActivity').textContent=top==='—'?'—':top.replace(/[-_]/g,' ');

    const bars=$('#reportActivityBars');
    if(bars){
      if(!sorted.length) bars.innerHTML='<div class="report-empty-line">Henüz öğrenci sonucu yok.</div>';
      else bars.innerHTML=sorted.slice(0,5).map(([name,g])=>{
        const gavg=g.scores.length?g.scores.reduce((a,b)=>a+b,0)/g.scores.length:null;
        const pct=gavg===null?Math.min(100,Math.round((g.count/Math.max(1,attempts))*100)):Math.max(0,Math.min(100,Math.round(gavg)));
        const label=gavg===null?g.count+' kayıt':Math.round(gavg)+'%';
        return '<div><b>'+esc(name.replace(/[-_]/g,' '))+'</b><i><span style="--v:'+pct+'%"></span></i><em>'+esc(label)+'</em></div>';
      }).join('');
    }

    const scope=$('#reportScopeLabel');
    if(scope) scope.textContent=selectedClass==='all'?'TÜM SINIFLAR':(classNameFor(selectedClass)+' · SINIF VERİSİ');
    const headline=$('#reportHeadline'), sub=$('#reportSubline');
    if(headline) headline.textContent=attempts ? (avg===null ? attempts+' öğrenci sonucu' : Math.round(avg)+'% genel ortalama') : 'Henüz yeterli veri yok';
    if(sub) sub.textContent=attempts ? 'Bu özet gerçek öğrenci sonuçlarından hesaplanır.' : 'Öğrenciler etkinlik tamamladıkça sonuçlar burada gerçek zamanlı özetlenir.';

    const scoredGroups=sorted.map(([name,g])=>({name,avg:g.scores.length?g.scores.reduce((a,b)=>a+b,0)/g.scores.length:null,count:g.count})).filter(x=>x.avg!==null).sort((a,b)=>a.avg-b.avg);
    const weakest=scoredGroups[0];
    const title=$('#reportInsightTitle'), text=$('#reportInsightText'), tags=$('#reportInsightTags');
    if(weakest){
      if(title) title.textContent=weakest.name.replace(/[-_]/g,' ')+' tekrarını planla.';
      if(text) text.textContent='Bu etkinlik türünde ortalama '+Math.round(weakest.avg)+'%. Sonraki derste kısa bir tekrar veya farklılaştırılmış etkinlik eklemek mantıklı.';
      if(tags) tags.innerHTML='<span>'+esc(weakest.name.replace(/[-_]/g,' '))+'</span><span>'+Math.round(weakest.avg)+'%</span>';
    } else {
      if(title) title.textContent=attempts?'Daha fazla puanlı etkinlik çalıştır.':'Önce bir canlı etkinlik çalıştır.';
      if(text) text.textContent=attempts?'Sonuç kaydı var; puanlı etkinlikler arttıkça zayıf beceriyi otomatik belirleyebiliriz.':'Platform, sonuçlar geldikçe hangi beceriyi tekrar etmenin daha mantıklı olduğunu gösterecek.';
      if(tags) tags.innerHTML='';
    }
  }

  async function refreshData() {
    if(!window.ESCSupabase?.isConfigured?.()) return;
    const session=await window.ESCSupabase.getSession().catch(()=>null);
    if(!session) return;
    try {
      const [classes,lessons,results,sessions]=await Promise.all([
        window.ESCSupabase.listEducatorClasses(),
        window.ESCSupabase.listEducatorLessons(150),
        window.ESCSupabase.listEducatorResults(1000),
        window.ESCSupabase.listEducatorSessions(150)
      ]);
      state.classes=classes||[];
      state.lessons=lessons||[];
      state.results=results||[];
      state.sessions=sessions||[];
      state.ready=true;
      const reportSelect=$('#reportClassFilter');
      if(reportSelect){
        const previous=reportSelect.value||'all';
        reportSelect.innerHTML='<option value="all">Tüm sınıflar</option>'+state.classes.map(c=>'<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>').join('');
        if([...reportSelect.options].some(o=>o.value===previous)) reportSelect.value=previous;
      }
      renderSetup();renderRecent();renderLibrary();renderReports();
    } catch(err) {
      console.warn('Educators product refresh failed',err);
    }
  }

  function bind() {
    const dateLabel = $('#workspaceDateLabel');
    if (dateLabel) {
      const now = new Date();
      const label = new Intl.DateTimeFormat('tr-TR',{weekday:'long',day:'numeric',month:'long'}).format(now);
      dateLabel.textContent = label.toLocaleUpperCase('tr-TR') + ' · TEACHER SPACE';
    }
    setupActions();
    $('#lessonLibrarySearch')?.addEventListener('input',applyLibraryFilters);
    $('#lessonLibraryGoal')?.addEventListener('change',applyLibraryFilters);
    $('#refreshLessonLibrary')?.addEventListener('click',refreshData);
    $('#reportClassFilter')?.addEventListener('change',renderReports);
    $('#refreshReports')?.addEventListener('click',refreshData);

    ['saveDemoClass','startDemoLesson'].forEach(id=>{
      $('#'+id)?.addEventListener('click',()=>setTimeout(refreshData,1100));
    });

    document.addEventListener('esc:educator-ready',refreshData);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden) refreshData();});
    setTimeout(refreshData,500);
    setTimeout(refreshData,1800);
  }

  document.addEventListener('DOMContentLoaded',bind);
})();