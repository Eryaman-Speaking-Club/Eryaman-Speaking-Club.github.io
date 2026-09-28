(() => {
  "use strict";

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  const themes = {
    "5": ["School Life","Classroom Life","Personal Life","Family Life","Life in the Neighbourhood & City","Life in the World","Life in Nature","Life in the Universe & Future"],
    "6": ["School Life","Classroom Life","Personal Life","Family Life","Life in the Neighbourhood & City","Life in the World & Culture","Life in Nature & Global Problems","Life in the Universe & Future"],
    "7": ["School Life & Education","Classroom Life & Learning","Personal Life & Well-Being","Family Life & Home","Life in the Neighbourhood & City and Social Life","Life in the World & Culture","Life in Nature","Life in the Universe & Future"],
    "9": ["School Life","Classroom Life","Personal Life: Physical Appearance & Personality","Family Life","Life in the House & Neighbourhood","Life in the City & Country","Life in the World & Nature","Life in the Universe & Future"],
    "10": ["School Life & Education","Classroom Life & Learning","Personal Life & Well-Being","Family Life & Home","Life in the Neighbourhood, City & Social Life","Life in the World & Culture","Life in Nature & Global Problems","Life in the Universe & Future"],
    "11": ["School Life & Education","Classroom Life & Learning","Personal Life & Well-Being","Family Life & Home","Life in the Neighbourhood, City & Social Life","Life in the World & Culture","Life in Nature & Global Problems","Life in the Universe & Future"]
  };

  const gradeMeta = {
    "5":  {level:"A1-A2", age:"9-11",  status:"TYMM · 2026-27 aktif"},
    "6":  {level:"A1-A2", age:"9-11",  status:"TYMM · 2026-27 aktif"},
    "7":  {level:"A2-B1", age:"12-14", status:"TYMM · 2026-27 aktif"},
    "8":  {level:"A2-B1", age:"12-14", status:"Geçiş sınıfı · eski program"},
    "9":  {level:"B1.1",  age:"15-17", status:"TYMM · 2026-27 aktif"},
    "10": {level:"B1.2",  age:"15-17", status:"TYMM · 2026-27 aktif"},
    "11": {level:"B1.3",  age:"15-17", status:"TYMM · 2026-27 aktif"},
    "12": {level:"B1+",   age:"15-17", status:"Geçiş sınıfı · eski program"}
  };

  const fallbackThemes = ["Current Unit","Exam Revision","Vocabulary Review","Grammar Review","Speaking Practice","Listening Practice","Writing Task","Mixed Skills"];

  function activatePanel(name) {
    $$(".side-item").forEach(b => b.classList.toggle("active", b.dataset.panel === name));
    $$(".mobile-workspace-tabs [data-panel]").forEach(b => b.classList.toggle("active", b.dataset.panel === name));
    $$("[data-panel-view]").forEach(p => p.classList.toggle("active", p.dataset.panelView === name));
    $("#teacher-demo")?.scrollIntoView({behavior:"smooth", block:"start"});
  }

  $$("[data-workflow]").forEach(btn => btn.addEventListener("click", () => activatePanel(btn.dataset.workflow)));

  const grade = $("#curriculumGrade");
  const track = $("#curriculumTrack");
  const theme = $("#curriculumTheme");
  const skill = $("#curriculumSkill");
  const summaryTitle = $("#curriculumSummaryTitle");
  const summaryMeta = $("#curriculumSummaryMeta");
  const summaryTags = $("#curriculumSummaryTags");

  function currentThemes() {
    if (track?.value === "cefr") return ["Daily Life","Travel","Food & Culture","Technology","School & Education","Work & Career","Relationships","Global Issues"];
    if (track?.value === "private") return ["Student Goal","School Support","Speaking Confidence","Grammar Repair","Vocabulary Growth","Exam Support","Homework Review","Custom Topic"];
    return themes[grade?.value] || fallbackThemes;
  }

  function renderCurriculum() {
    if (!grade || !track || !theme) return;
    const items = currentThemes();
    const previous = theme.value;
    theme.innerHTML = items.map((x, i) => '<option value="' + x.replace(/"/g, "&quot;") + '">' + (i + 1) + '. ' + x + '</option>').join("");
    if (items.includes(previous)) theme.value = previous;

    const meta = gradeMeta[grade.value] || gradeMeta["7"];
    let badge = "MEB 2026-27";
    if (track.value === "cefr") badge = "GENERAL ENGLISH · CEFR";
    if (track.value === "private") badge = "PRIVATE TUTOR PATH";

    if (summaryTitle) summaryTitle.textContent = theme.value || items[0];
    if (summaryMeta) summaryMeta.textContent = badge + " · Grade " + grade.value + " · " + meta.level + " · " + (skill?.value || "Speaking");
    if (summaryTags) {
      const tags = track.value === "meb"
        ? [meta.status, "Vocabulary", "Grammar", "Speaking", "Assessment"]
        : ["Flexible sequence", "Speaking", "Vocabulary", "Grammar", "Homework"];
      summaryTags.innerHTML = tags.map(x => "<span>" + x + "</span>").join("");
    }
  }

  [grade, track, theme, skill].forEach(el => el?.addEventListener("change", renderCurriculum));
  renderCurriculum();

  function mapTopic(name) {
    const t = (name || "").toLowerCase();
    if (t.includes("school") || t.includes("classroom") || t.includes("education")) return "school";
    if (t.includes("world") || t.includes("culture") || t.includes("food")) return "food";
    if (t.includes("technology") || t.includes("universe") || t.includes("future")) return "technology";
    if (t.includes("travel") || t.includes("city") || t.includes("neighbourhood")) return "travel";
    if (t.includes("personal") || t.includes("family") || t.includes("life")) return "daily-life";
    return "daily-life";
  }

  $("#curriculumBuildLesson")?.addEventListener("click", () => {
    const meta = gradeMeta[grade?.value] || gradeMeta["7"];
    const level = meta.level.startsWith("A1") ? "A1" : meta.level.startsWith("A2") ? "A2" : "B1";
    if ($("#className")) $("#className").value = "Grade " + (grade?.value || "7") + " · " + (theme?.value || "Lesson");
    if ($("#ageGroup")) $("#ageGroup").value = meta.age;
    if ($("#level")) $("#level").value = level;
    if ($("#topic")) $("#topic").value = mapTopic(theme?.value);
    if ($("#goal")) $("#goal").value = (skill?.value || "").toLowerCase().includes("vocab") ? "vocabulary" : (skill?.value || "").toLowerCase().includes("grammar") ? "grammar" : "speaking";
    $("#lessonForm")?.dispatchEvent(new Event("submit", {bubbles:true, cancelable:true}));
    activatePanel("builder");
  });

  $("#curriculumOpenResources")?.addEventListener("click", () => {
    const source = $("#resourceSource");
    if (source) source.value = "Grade " + (grade?.value || "7") + " · " + (theme?.value || "Current Unit");
    activatePanel("resources");
    renderResource("worksheet");
  });

  const resourceTemplates = {
    worksheet: {
      title:"Printable Worksheet",
      lead:"Tek sayfada öğretmenin kullanacağı hızlı çalışma kâğıdı.",
      items:["Warm-up: 3 quick questions","Vocabulary: 8 target words","Grammar: 5 contextual items","Speaking: pair task","Exit ticket: 1 reflection"]
    },
    vocab: {
      title:"Vocabulary Pack",
      lead:"Kelime öğretimi + tekrar + hızlı kontrol için tek paket.",
      items:["8 target words","Student-friendly definitions","Example sentences","Matching round","Speaking challenge"]
    },
    grammar: {
      title:"Grammar in Context",
      lead:"Kural ezberinden çok kullanım odaklı mini akış.",
      items:["Notice the form","2 model sentences","Controlled practice","Error hunter","Speaking transfer"]
    },
    speaking: {
      title:"Speaking Cards",
      lead:"Aynı konuyu farklı öğrenci tiplerine göre konuştur.",
      items:["Easy prompt","Follow-up prompt","Opinion prompt","Pair role-play","Challenge card"]
    },
    quiz: {
      title:"Mini Quiz",
      lead:"Ders sonu veya bir sonraki ders başlangıcı için kontrol.",
      items:["3 vocabulary questions","2 grammar questions","1 listening-ready prompt","1 speaking check","Auto-review list"]
    },
    homework: {
      title:"Homework Pack",
      lead:"Özel ders ve sınıf öğretmeni için kısa, net ödev.",
      items:["5-minute vocabulary review","Grammar micro-task","Voice-note speaking task","Short writing task","Next lesson check"]
    }
  };

  function renderResource(kind) {
    const data = resourceTemplates[kind] || resourceTemplates.worksheet;
    $$("#resourceTypeButtons button").forEach(b => b.classList.toggle("active", b.dataset.resourceKind === kind));
    if ($("#resourcePreviewTitle")) $("#resourcePreviewTitle").textContent = data.title;
    if ($("#resourcePreviewLead")) $("#resourcePreviewLead").textContent = data.lead;
    if ($("#resourcePreviewItems")) $("#resourcePreviewItems").innerHTML = data.items.map((x, i) => "<li><span>0" + (i+1) + "</span><b>" + x + "</b></li>").join("");
  }

  $$("#resourceTypeButtons [data-resource-kind]").forEach(btn => btn.addEventListener("click", () => renderResource(btn.dataset.resourceKind)));
  renderResource("worksheet");

  $("#copyResourcePlan")?.addEventListener("click", async e => {
    const title = $("#resourcePreviewTitle")?.textContent || "Resource";
    const source = $("#resourceSource")?.value || "Current lesson";
    const items = $$("#resourcePreviewItems b").map(x => "- " + x.textContent).join("\n");
    try {
      await navigator.clipboard.writeText(title + "\n" + source + "\n\n" + items);
      const old = e.currentTarget.textContent;
      e.currentTarget.textContent = "Copied ✓";
      setTimeout(() => e.currentTarget.textContent = old, 1200);
    } catch {}
  });

  const privateKey = "escPrivateTutorStudentsV1";
  const defaults = [
    {name:"Deniz", level:"A2", goal:"Speaking confidence", next:"Travel · speaking"},
    {name:"Mert", level:"B1", goal:"School support", next:"Grammar + homework"}
  ];

  function loadPrivate() {
    try {
      const data = JSON.parse(localStorage.getItem(privateKey) || "null");
      if (Array.isArray(data) && data.length) return data;
    } catch {}
    return defaults;
  }

  function savePrivate(list) {
    localStorage.setItem(privateKey, JSON.stringify(list));
  }

  function renderPrivate() {
    const grid = $("#privateStudentGrid");
    if (!grid) return;
    const list = loadPrivate();
    grid.innerHTML = list.map((s, i) =>
      '<article class="private-student-card"><div><span>' + s.name + '</span><small>' + s.level + '</small></div><p>' + s.goal + '</p><strong>Next: ' + s.next + '</strong><div class="private-actions"><button type="button" data-private-plan="' + i + '">Plan lesson →</button><button type="button" data-private-delete="' + i + '">×</button></div></article>'
    ).join("");
  }

  $("#addPrivateStudent")?.addEventListener("click", () => {
    const name = window.prompt("Öğrencinin adı?");
    if (!name) return;
    const level = window.prompt("Seviye? (A1, A2, B1, B2)", "A2") || "A2";
    const goal = window.prompt("Ana hedef?", "Speaking confidence") || "Speaking confidence";
    const list = loadPrivate();
    list.push({name:name.trim(), level:level.trim().toUpperCase(), goal:goal.trim(), next:"Planlanacak"});
    savePrivate(list);
    renderPrivate();
  });

  $("#privateStudentGrid")?.addEventListener("click", e => {
    const plan = e.target.closest("[data-private-plan]");
    const del = e.target.closest("[data-private-delete]");
    const list = loadPrivate();
    if (plan) {
      const s = list[Number(plan.dataset.privatePlan)];
      if ($("#className")) $("#className").value = s.name + " · Private";
      if ($("#level")) $("#level").value = ["Pre-A1","A1","A2","B1","B2"].includes(s.level) ? s.level : "A2";
      if ($("#ageGroup")) $("#ageGroup").value = "18+";
      if ($("#goal")) $("#goal").value = s.goal.toLowerCase().includes("grammar") ? "grammar" : "speaking";
      $("#lessonForm")?.dispatchEvent(new Event("submit", {bubbles:true, cancelable:true}));
      activatePanel("builder");
    }
    if (del) {
      list.splice(Number(del.dataset.privateDelete), 1);
      savePrivate(list.length ? list : defaults);
      renderPrivate();
    }
  });

  renderPrivate();
})();