
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  const questionBank = {
    travel: {
      "6-8": {
        "Pre-A1":[["Do you like cars, planes or trains?","Choose one and say the word."],["Where do you want to go: beach or mountains?","Choose one."],["What is in your travel bag?","Say 2 things."]],
        "A1":[["How do you like to travel?","Answer with one short sentence."],["What do you take on a trip?","Name 3 things."],["Where did you go last holiday?","Use 1–2 simple sentences."]],
        "A2":[["Where would you like to travel with your family?","Give one reason."],["What should you pack for a beach holiday?","Name 4 things."],["Which is better: train or plane?","Choose and explain simply."]],
        "B1":[["What makes a family trip fun?","Give two ideas."],["Would you rather visit a big city or nature?","Explain your choice."],["What can go wrong on a trip?","Give an example."]],
        "B2":[["How can families make travel easier for children?","Give two suggestions."],["What can children learn from travelling?","Give an example."],["Is travelling always a good way to learn?","Explain briefly."]]
      },
      "9-11": {
        "Pre-A1":[["Where do you want to go?","Say one place."],["Do you travel by bus, car or plane?","Choose one."],["What is in your bag?","Say 3 travel words."]],
        "A1":[["What is your favorite way to travel?","Answer in 1–2 sentences."],["What do you pack for a weekend trip?","Name 4 things."],["Where did you go on your last trip?","Use simple past if you can."]],
        "A2":[["If you could travel anywhere next weekend, where would you go?","Answer in 2–3 sentences and give one reason."],["What would you pack for a three-day trip?","Name 5 things and explain one choice."],["Which is better for a holiday: city or countryside?","Choose and give two reasons."]],
        "B1":[["What makes a trip memorable?","Answer with an example."],["Should students travel more with school?","Give your opinion and one reason."],["How would you plan a low-cost weekend trip?","Give three steps."]],
        "B2":[["Can travel change the way young people see the world?","Explain with an example."],["Should popular tourist places limit visitor numbers?","Give a short argument."],["How does social media influence where people travel?","Give two effects."]]
      },
      "12-14": {
        "Pre-A1":[["Where do you want to travel?","Use: I want to go to..."],["Plane or train?","Choose one and say why with one word."],["What do you need for a trip?","Say 4 words."]],
        "A1":[["Where would you like to go on holiday?","Answer in 2 short sentences."],["What do you usually pack?","Name 5 items."],["Who do you like travelling with?","Say who and why."]],
        "A2":[["If you could travel anywhere next weekend, where would you go and why?","Answer in 3–4 sentences. Ask one follow-up question to a classmate."],["What would you pack for a three-day trip?","Choose 5 items and explain two choices."],["Would you rather travel alone or with friends?","Choose one and give two reasons."]],
        "B1":[["What can teenagers learn from travelling?","Give two ideas and one example."],["Is it better to plan every detail or be spontaneous?","Take a side and defend it."],["How could a student plan a cheap but interesting trip?","Give a simple plan."]],
        "B2":[["Does tourism benefit every local community?","Give a balanced answer."],["Should teenagers travel independently before university?","Give arguments for and against."],["How can tourism become more sustainable without becoming too expensive?","Suggest practical solutions."]]
      },
      "15-17": {
        "Pre-A1":[["Where do you want to travel?","Answer with one place and one reason word."],["Do you prefer plane or bus?","Choose one."],["What travel word do you know?","Say 5 words with your team."]],
        "A1":[["What country would you like to visit?","Answer in 2 sentences."],["Who would you travel with?","Say who and why."],["What do you do before a trip?","Give 3 actions."]],
        "A2":[["What kind of trip would you plan with your friends?","Describe the place, transport and one activity."],["Would you rather spend money on travel or technology?","Choose and explain."],["What can make a trip stressful?","Give three examples and one solution."]],
        "B1":[["Do people learn more from travelling or from studying?","Compare both and give your view."],["Should schools include more educational trips?","Give two benefits and one challenge."],["How has technology changed the way teenagers travel?","Give concrete examples."]],
        "B2":[["Is mass tourism becoming incompatible with sustainable travel?","Build a short argument and counterargument."],["Should cities charge tourists additional local taxes?","Discuss potential benefits and drawbacks."],["Does international travel meaningfully broaden perspectives, or is that overstated?","Support your position with examples."]]
      },
      "18+": {
        "Pre-A1":[["Where do you want to go?","Use: I want to go to..."],["Car, bus or plane?","Choose one."],["What do you take on a trip?","Say 5 words."]],
        "A1":[["Where do you usually go on holiday?","Answer in 2 sentences."],["What do you always pack?","Name 5 items."],["Do you prefer city trips or beach holidays?","Choose one and say why."]],
        "A2":[["What makes a good short holiday for you?","Describe the place, budget and activities."],["Would you rather travel often for short trips or save for one long trip?","Choose and explain."],["What is one travel problem you have experienced?","Tell the story briefly."]],
        "B1":[["How do budget, time and comfort affect your travel decisions?","Compare the three factors."],["Has travel become better or more stressful because of technology?","Give examples."],["What makes a destination worth returning to?","Give three criteria."]],
        "B2":[["How should cities balance tourism revenue with residents' quality of life?","Give a nuanced response."],["Has low-cost aviation democratized travel at an unacceptable environmental cost?","Present both sides."],["What responsibilities do tourists have toward local communities?","Develop a practical framework."]]
      }
    }
  };

  const generic = {
    food:["What food do you enjoy most?","Describe a meal you would recommend to a classmate.","Should school cafeterias offer more international food?"],
    school:["What is your favorite part of school?","What would make school more enjoyable?","Should students have more choice in what they study?"],
    hobbies:["What hobby would you like to try?","How can hobbies help people learn English?","Should teenagers spend more time on hobbies and less time online?"],
    technology:["What technology do you use every day?","What app could you live without?","Does technology make communication better or worse?"],
    "daily-life":["What do you do after school or work?","What part of your routine would you like to change?","Is a strict daily routine helpful or limiting?"]
  };

  const supports = {
    "Pre-A1":"Use words, pointing or a very short sentence.",
    "A1":"Answer in 1–2 simple sentences.",
    "A2":"Answer in 2–4 sentences and give a reason.",
    "B1":"Explain your idea and support it with an example.",
    "B2":"Develop your answer, consider another perspective and respond to it."
  };

  let questionIndex = 0;
  let liveIndex = 0;
  let blue = 120, orange = 110;

  function getQuestions(){
    const age = $("#ageGroup").value;
    const level = $("#level").value;
    const topic = $("#topic").value;
    if (topic === "travel") return questionBank.travel[age][level];
    const base = generic[topic] || generic["daily-life"];
    return base.map((q,i)=>[q, supports[level] + (i===2 && (level==="B1"||level==="B2") ? " Give at least two reasons." : "")]);
  }

  function renderQuestion(){
    const qs = getQuestions();
    questionIndex %= qs.length;
    const [q,s] = qs[questionIndex];
    $("#adaptiveQuestion").textContent = q;
    $("#adaptiveSupport").textContent = s;
  }

  function renderPlan(){
    const duration = +$("#duration").value;
    const goal = $("#goal").value;
    let parts;
    if(duration<=20) parts=[["3 min","Warm-up","Question"],["6 min","Vocabulary","Match"],["7 min",goal==="speaking"?"Speaking Game":"Core Practice","Interactive"],["4 min","Exit","Quick check"]];
    else if(duration<=30) parts=[["5 min","Warm-up","Question"],["7 min","Vocabulary","Match"],["8 min","Team Game","Live"],["7 min","Speaking","Pairs"],["3 min","Exit","Quick check"]];
    else if(duration<=40) parts=[["5 min","Warm-up","Question"],["8 min","Vocabulary","Match"],["10 min","Team Game","Live"],["12 min","Speaking","Pairs"],["5 min","Exit","Quick check"]];
    else if(duration<=50) parts=[["6 min","Warm-up","Question"],["10 min","Vocabulary","Match"],["12 min","Team Game","Live"],["15 min","Speaking","Groups"],["7 min","Exit","Reflection"]];
    else parts=[["8 min","Warm-up","Question"],["12 min","Vocabulary","Match"],["15 min","Team Game","Live"],["18 min","Speaking","Groups"],["7 min","Exit","Reflection"]];
    $("#generatedPlan").innerHTML = parts.map(x=>`<div class="plan-row"><span>${x[0]}</span><b>${x[1]}</b><small>${x[2]}</small></div>`).join("");
  }

  function syncPreview(){
    $("#previewClass").textContent = `${$("#className").value || "New Class"} · ${$("#level").value}`;
    $("#previewDuration").textContent = `${$("#duration").value} min`;
    $("#previewAge").textContent = $("#ageGroup").value.replace("-", "–") + " YEARS";
    $("#previewTopic").textContent = $("#topic").selectedOptions[0].textContent.toUpperCase();
    renderQuestion(); renderPlan();
  }

  function showPanel(name){
    $$(".side-item").forEach(b=>b.classList.toggle("active",b.dataset.panel===name));
    $$("[data-panel-view]").forEach(p=>p.classList.toggle("active",p.dataset.panelView===name));
    if(name==="builder") syncPreview();
  }

  $$(".side-item").forEach(b=>b.addEventListener("click",()=>showPanel(b.dataset.panel)));
  $$("[data-panel-target]").forEach(b=>b.addEventListener("click",()=>showPanel(b.dataset.panelTarget)));
  $("[data-scroll-teacher]")?.addEventListener("click",()=>$("#teacher-demo").scrollIntoView({behavior:"smooth"}));
  $("[data-open-student]")?.addEventListener("click",()=>$("#student-demo").scrollIntoView({behavior:"smooth"}));
  $("[data-copy-code]")?.addEventListener("click", async e => {
    try{ await navigator.clipboard.writeText("6B27"); e.currentTarget.textContent="Copied ✓"; setTimeout(()=>e.currentTarget.textContent="Copy code",1200);}catch{}
  });

  $("#lessonForm")?.addEventListener("submit", e=>{e.preventDefault();questionIndex=0;syncPreview();});
  $("#newQuestion")?.addEventListener("click",()=>{questionIndex++;renderQuestion();});
  ["ageGroup","level","topic","duration","goal","className"].forEach(id=>$("#"+id)?.addEventListener("change",syncPreview));

  $$("[data-use-class]").forEach(b=>b.addEventListener("click",()=>{
    $("#className").value=b.dataset.useClass;
    $("#ageGroup").value=b.dataset.age;
    $("#level").value=b.dataset.level;
    showPanel("builder");
  }));

  $("#saveDemoClass")?.addEventListener("click", e=>{
    const btn=e.currentTarget, old=btn.textContent; btn.textContent="Saved ✓"; setTimeout(()=>btn.textContent=old,1400);
  });

  const modal=$("#lessonModal");
  const liveStages=["WARM-UP","VOCABULARY","TEAM GAME","SPEAKING","EXIT"];
  function updateLive(){
    const qs=getQuestions();
    const pair=qs[liveIndex % qs.length];
    $("#modalStep").textContent=(liveIndex+1)+" / 5";
    $("#liveStage").textContent=liveStages[liveIndex] || "LIVE";
    $("#liveQuestion").textContent=pair[0];
    $("#liveInstruction").textContent=pair[1];
    $("#modalClassName").textContent=$("#className").value || "Class";
  }
  $("#startDemoLesson")?.addEventListener("click",()=>{liveIndex=0;updateLive();modal.classList.add("open");modal.setAttribute("aria-hidden","false");});
  $("#closeLessonModal")?.addEventListener("click",()=>{modal.classList.remove("open");modal.setAttribute("aria-hidden","true");});
  $("#nextLiveQuestion")?.addEventListener("click",()=>{liveIndex=(liveIndex+1)%5;updateLive();});
  $("#addBlue")?.addEventListener("click",()=>{$("#blueScore").textContent=blue+=10;});
  $("#addOrange")?.addEventListener("click",()=>{$("#orangeScore").textContent=orange+=10;});

  $("#joinDemoClass")?.addEventListener("click",()=>{
    const name=($("#studentName").value||"Student").trim();
    const code=($("#studentCode").value||"").trim().toUpperCase();
    if(!code){$("#studentCode").focus();return;}
    $("#studentWelcome").textContent=`Hi ${name} 👋`;
    $("#studentAvatar").textContent=(name[0]||"S").toUpperCase();
    $$("[data-student-screen]").forEach(s=>s.classList.remove("active"));
    $('[data-student-screen="waiting"]').classList.add("active");
  });
  $("#studentBack")?.addEventListener("click",()=>{
    $$("[data-student-screen]").forEach(s=>s.classList.remove("active"));
    $('[data-student-screen="join"]').classList.add("active");
  });

  syncPreview();
})();


;(() => {
  "use strict";
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const CLASS_KEY = "escEducatorsClassesV2";
  const STUDENT_KEY = "escEducatorsStudentNamesV2";

  function esc(value){
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[c]);
  }

  function activatePanel(name){
    $$(".side-item").forEach(b => b.classList.toggle("active", b.dataset.panel === name));
    $$(".mobile-workspace-tabs [data-panel]").forEach(b => b.classList.toggle("active", b.dataset.panel === name));
    $$("[data-panel-view]").forEach(p => p.classList.toggle("active", p.dataset.panelView === name));
    if(name === "builder"){
      setTimeout(() => $("#className")?.focus({preventScroll:true}), 0);
    }
  }

  $$(".mobile-workspace-tabs [data-panel]").forEach(b => {
    b.addEventListener("click", () => activatePanel(b.dataset.panel));
  });

  const defaults = [
    {id:"default-5a",name:"5-A",age:"9-11",level:"A1",students:24,topic:"food",goal:"vocabulary",duration:"40",code:"5A24"},
    {id:"default-6b",name:"6-B",age:"12-14",level:"A2",students:22,topic:"travel",goal:"speaking",duration:"40",code:"6B27"},
    {id:"default-teen",name:"Teen Speaking",age:"15-17",level:"B1",students:21,topic:"technology",goal:"speaking",duration:"50",code:"TS17"}
  ];

  function loadClasses(){
    try{
      const parsed = JSON.parse(localStorage.getItem(CLASS_KEY) || "null");
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }catch{}
    localStorage.setItem(CLASS_KEY, JSON.stringify(defaults));
    return [...defaults];
  }

  function saveClasses(list){
    localStorage.setItem(CLASS_KEY, JSON.stringify(list));
  }

  function makeCode(existing){
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    do{
      code = "";
      for(let i=0;i<4;i++) code += chars[Math.floor(Math.random()*chars.length)];
    }while(existing.some(c => c.code === code));
    return code;
  }

  function updateMetrics(classes){
    const classMetric = $(".metric-grid article:nth-child(1) strong");
    const studentMetric = $(".metric-grid article:nth-child(2) strong");
    if(classMetric) classMetric.textContent = classes.length;
    if(studentMetric) studentMetric.textContent = classes.reduce((sum,c)=>sum+(Number(c.students)||0),0);
  }

  function renderClasses(){
    const grid = $("#legacyClassCardGridDisabled");
    if(!grid) return;
    const classes = loadClasses();
    updateMetrics(classes);
    grid.innerHTML = classes.map(c => `
      <article class="is-saved" data-class-id="${esc(c.id)}">
        <div><span>${esc(c.name)}</span><small>${esc(c.age).replace("-", "–")} · ${esc(c.level)}</small></div>
        <strong>${Number(c.students)||0} students</strong>
        <p>${esc((c.topic || "travel").replace("-", " "))} · ${esc(c.goal || "speaking")} · ${esc(c.duration || 40)} min</p>
        <span class="class-code-inline">CODE · ${esc(c.code)}</span>
        <div class="class-actions">
          <button type="button" data-class-open="${esc(c.id)}">Use class →</button>
          ${String(c.id).startsWith("default-") ? "" : `<button type="button" class="delete-class" data-class-delete="${esc(c.id)}">Delete</button>`}
        </div>
      </article>`).join("");
  }

  function fillBuilder(c){
    if(!c) return;
    if($("#className")) $("#className").value = c.name || "";
    if($("#ageGroup")) $("#ageGroup").value = c.age || "12-14";
    if($("#level")) $("#level").value = c.level || "A2";
    if($("#topic")) $("#topic").value = c.topic || "travel";
    if($("#duration")) $("#duration").value = String(c.duration || "40");
    if($("#goal")) $("#goal").value = c.goal || "speaking";
    if($("#studentCount")) $("#studentCount").value = Number(c.students)||20;
    $("#lessonForm")?.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));
    activatePanel("builder");
  }

  $("#legacyClassCardGridDisabled")?.addEventListener("click", e => {
    const open = e.target.closest("[data-class-open]");
    const del = e.target.closest("[data-class-delete]");
    const classes = loadClasses();
    if(open){
      fillBuilder(classes.find(c => c.id === open.dataset.classOpen));
    }
    if(del){
      const next = classes.filter(c => c.id !== del.dataset.classDelete);
      saveClasses(next.length ? next : [...defaults]);
      renderClasses();
    }
  });

  $("#legacyNewClassButtonDisabled")?.addEventListener("click", () => {
    if($("#className")) $("#className").value = "";
    if($("#ageGroup")) $("#ageGroup").value = "9-11";
    if($("#level")) $("#level").value = "A1";
    if($("#topic")) $("#topic").value = "school";
    if($("#duration")) $("#duration").value = "40";
    if($("#goal")) $("#goal").value = "speaking";
    if($("#studentCount")) $("#studentCount").value = "20";
    $("#lessonForm")?.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}));
    activatePanel("builder");
  });

  $("#legacySaveDemoClassDisabled")?.addEventListener("click", () => {
    const classes = loadClasses();
    const name = ($("#className")?.value || "New Class").trim() || "New Class";
    const existing = classes.find(c => c.name.toLowerCase() === name.toLowerCase());
    const item = {
      id: existing?.id || ("class-" + Date.now()),
      name,
      age: $("#ageGroup")?.value || "12-14",
      level: $("#level")?.value || "A2",
      students: Math.max(1, Number($("#studentCount")?.value)||20),
      topic: $("#topic")?.value || "travel",
      goal: $("#goal")?.value || "speaking",
      duration: $("#duration")?.value || "40",
      code: existing?.code || makeCode(classes)
    };
    const next = existing ? classes.map(c => c.id === existing.id ? item : c) : [...classes, item];
    saveClasses(next);
    renderClasses();
    const btn = $("#legacySaveDemoClassDisabled");
    if(btn){
      btn.textContent = "Saved ✓";
      setTimeout(() => btn.textContent = "Save class", 1400);
    }
  });

  renderClasses();

  // Student join now checks a real saved class code in this browser.
  const oldJoin = $("#legacyJoinDemoClassDisabled");
  if(oldJoin){
    const join = oldJoin.cloneNode(true);
    oldJoin.replaceWith(join);
    join.addEventListener("click", () => {
      const name = ($("#studentName")?.value || "Student").trim() || "Student";
      const code = ($("#studentCode")?.value || "").trim().toUpperCase();
      const classes = loadClasses();
      const found = classes.find(c => String(c.code).toUpperCase() === code);
      const msg = $("#studentJoinMessage");
      if(!found){
        if(msg){
          msg.textContent = "Class code not found. Try 6B27 or a code from My Classes.";
          msg.style.color = "#b6535c";
        }
        $("#studentCode")?.focus();
        return;
      }
      if(msg){ msg.textContent = "Class found ✓"; msg.style.color = "#13857f"; }
      $("#studentWelcome").textContent = `Hi ${name} 👋`;
      $("#studentAvatar").textContent = (name[0] || "S").toUpperCase();
      const profile = $('[data-student-screen="waiting"] p');
      if(profile) profile.textContent = `${found.name} · ${found.level} English`;
      const card = $('[data-student-screen="waiting"] .waiting-card strong');
      if(card) card.textContent = (found.topic || "English").replace("-", " ") + " · Live class";
      $$("[data-student-screen]").forEach(s => s.classList.remove("active"));
      $('[data-student-screen="waiting"]')?.classList.add("active");
    });
  }

  // Classroom tools.
  const studentList = $("#studentListInput");
  if(studentList){
    const savedNames = localStorage.getItem(STUDENT_KEY);
    if(savedNames) studentList.value = savedNames;
    studentList.addEventListener("input", () => localStorage.setItem(STUDENT_KEY, studentList.value));
  }

  function names(){
    return (studentList?.value || "")
      .split(/[\n,;]+/)
      .map(x => x.trim())
      .filter(Boolean);
  }

  $("#pickStudent")?.addEventListener("click", () => {
    const list = names();
    const out = $("#pickedStudent");
    if(!out) return;
    if(!list.length){ out.textContent = "Add names"; return; }
    let ticks = 0;
    const spin = setInterval(() => {
      out.textContent = list[Math.floor(Math.random()*list.length)];
      ticks++;
      if(ticks >= 9){
        clearInterval(spin);
        out.textContent = list[Math.floor(Math.random()*list.length)];
      }
    }, 70);
  });

  $("#makeTeams")?.addEventListener("click", () => {
    const list = names().sort(() => Math.random() - .5);
    const count = Math.max(2, Number($("#teamCount")?.value)||2);
    const teams = Array.from({length:count},()=>[]);
    list.forEach((n,i)=>teams[i%count].push(n));
    const out = $("#madeTeams");
    if(!out) return;
    out.innerHTML = list.length ? teams.map((t,i)=>`<div class="made-team"><b>Team ${i+1}</b><br>${t.map(esc).join(" · ") || "—"}</div>`).join("") : '<div class="made-team">Add student names first.</div>';
  });

  let timerSeconds = 120;
  let timerInitial = 120;
  let timerHandle = null;
  const timerDisplay = $("#timerDisplay");
  function paintTimer(){
    if(!timerDisplay) return;
    const m = Math.floor(timerSeconds/60);
    const s = timerSeconds%60;
    timerDisplay.textContent = String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
  }
  $$("[data-timer-min]").forEach(b=>b.addEventListener("click",()=>{
    timerSeconds = timerInitial = Number(b.dataset.timerMin)*60;
    if(timerHandle){clearInterval(timerHandle);timerHandle=null;}
    $("#timerStart").textContent = "Start";
    paintTimer();
  }));
  $("#timerStart")?.addEventListener("click", e=>{
    if(timerHandle){
      clearInterval(timerHandle); timerHandle=null; e.currentTarget.textContent="Start"; return;
    }
    e.currentTarget.textContent="Pause";
    timerHandle=setInterval(()=>{
      timerSeconds=Math.max(0,timerSeconds-1);paintTimer();
      if(timerSeconds<=0){
        clearInterval(timerHandle);timerHandle=null;e.currentTarget.textContent="Start";
        if(timerDisplay) timerDisplay.textContent="TIME!";
      }
    },1000);
  });
  $("#timerReset")?.addEventListener("click",()=>{
    if(timerHandle){clearInterval(timerHandle);timerHandle=null;}
    timerSeconds=timerInitial;paintTimer();
    if($("#timerStart")) $("#timerStart").textContent="Start";
  });
  paintTimer();

  const quickPrompts = [
    "What was the best part of your week?",
    "What is one thing you would like to learn this year?",
    "Which is more important: free time or money?",
    "Describe a place that makes you feel comfortable.",
    "What is something people your age worry about too much?",
    "What small change could make your school or workplace better?",
    "If you could master one skill instantly, what would it be?",
    "What is one opinion you changed recently?"
  ];
  let qp=0;
  $("#newQuickPrompt")?.addEventListener("click",()=>{
    qp=(qp+1)%quickPrompts.length;
    $("#quickPrompt").textContent=quickPrompts[qp];
  });

  // Game search + category filters.
  let activeFilter = "all";
  const gameSearch = $("#gameSearch");
  function filterGames(){
    const q = (gameSearch?.value || "").toLowerCase().trim();
    $$("#adaptiveGameGrid article").forEach(card=>{
      const kinds = card.dataset.kind || "";
      const text = card.textContent.toLowerCase();
      const okFilter = activeFilter === "all" || kinds.includes(activeFilter);
      const okSearch = !q || text.includes(q);
      card.classList.toggle("hidden", !(okFilter && okSearch));
    });
  }
  gameSearch?.addEventListener("input",filterGames);
  $$("[data-game-filter]").forEach(b=>b.addEventListener("click",()=>{
    activeFilter=b.dataset.gameFilter;
    $$("[data-game-filter]").forEach(x=>x.classList.toggle("active",x===b));
    filterGames();
  }));

  // Adaptive classroom games.
  const vocab = {
    travel:["passport","airport","luggage","ticket","hotel","journey","platform","destination","departure","reservation","itinerary","accommodation"],
    food:["apple","bread","cheese","meal","recipe","ingredient","dessert","spicy","healthy","portion","cuisine","nutrition"],
    school:["book","teacher","classroom","homework","subject","exam","project","schedule","research","assignment","deadline","curriculum"],
    hobbies:["music","drawing","football","reading","gaming","photography","painting","hiking","collecting","practice","creative","competition"],
    technology:["phone","computer","internet","message","website","password","screen","application","device","privacy","algorithm","automation"],
    "daily-life":["breakfast","bus","work","school","shopping","exercise","appointment","routine","commute","chores","habit","schedule"]
  };
  const definitions = {
    passport:"an official document used for international travel",
    airport:"a place where planes arrive and leave",
    luggage:"bags and suitcases used when travelling",
    ticket:"a document or code that lets you travel or enter",
    hotel:"a place where travellers pay to stay",
    journey:"the act of travelling from one place to another",
    platform:"the place where you wait for a train",
    destination:"the place you are travelling to",
    departure:"the act or time of leaving",
    reservation:"an arrangement that keeps a seat, room or table for you",
    itinerary:"a plan showing the places and times of a trip",
    accommodation:"a place where someone stays temporarily",
    recipe:"instructions for preparing food",
    ingredient:"one of the foods used to make a dish",
    cuisine:"a style of cooking connected with a place or culture",
    nutrition:"the process of getting the food needed for health",
    assignment:"a piece of work given by a teacher",
    deadline:"the latest time something must be completed",
    curriculum:"the subjects and content taught in a course",
    privacy:"control over who can access personal information",
    algorithm:"a set of rules a computer follows to solve a problem",
    automation:"using technology to complete tasks with less human action",
    commute:"regular travel between home and work or school",
    chores:"small routine jobs done at home",
    habit:"something you do regularly, often without thinking"
  };

  const topicSentences = {
    travel:["I packed my suitcase before the flight.","We are going to visit a new city next weekend.","She has already booked the hotel online.","If I had more time, I would travel by train."],
    food:["I usually eat breakfast before school.","We are cooking dinner for our friends tonight.","She has never tried this kind of cuisine before.","If people planned meals better, they might waste less food."],
    school:["I finish my homework after dinner.","We are working on a science project this week.","He has already submitted the assignment.","Students would learn differently if every lesson were interactive."],
    hobbies:["I play football with my friends on Saturdays.","She is learning how to take better photos.","I have been reading more this month.","A hobby can become stressful when people only focus on results."],
    technology:["I use my phone to check messages.","We are learning how to use a new application.","Technology has changed the way people communicate.","People might protect their privacy better if apps explained data use clearly."],
    "daily-life":["I get up at seven every morning.","I am meeting a friend after work today.","I have changed my morning routine recently.","Life would feel less rushed if people protected their free time."]
  };

  const roleplays = {
    travel:{
      child:"You are at a train station. Ask where the train goes and what time it leaves.",
      teen:"You and a friend are planning a weekend trip with a limited budget. Agree on transport, accommodation and one activity.",
      adult:"Your hotel room has a problem. Explain it politely and negotiate a practical solution with reception."
    },
    food:{
      child:"You are ordering a snack. Ask for what you want and say thank you.",
      teen:"One person is a customer with a food allergy; the other is a waiter. Ask and answer clear questions.",
      adult:"A restaurant order is incorrect. Explain the problem politely and agree on a solution."
    },
    school:{
      child:"Ask a classmate what homework you have and when it is due.",
      teen:"A student asks a teacher for more time on an assignment. Explain the reason and respond.",
      adult:"Discuss a training course with a colleague and decide which option fits your goals."
    },
    hobbies:{
      child:"Invite a friend to do a hobby with you after school.",
      teen:"Persuade a friend to try your hobby for one month.",
      adult:"Explain a hobby to someone who thinks they are too busy to start anything new."
    },
    technology:{
      child:"Ask a friend for help using a simple app.",
      teen:"One person wants to post a group photo; the other is uncomfortable. Discuss what to do.",
      adult:"Explain a digital service problem to customer support and ask for a specific solution."
    },
    "daily-life":{
      child:"Ask a friend what they do after school.",
      teen:"Two friends are trying to plan a study session around busy schedules.",
      adult:"Two colleagues need to rearrange a meeting because one person's schedule changed."
    }
  };

  function currentProfile(){
    return {
      age: $("#ageGroup")?.value || "12-14",
      level: $("#level")?.value || "A2",
      topic: $("#topic")?.value || "travel"
    };
  }

  function ageBand(age){
    if(age==="6-8" || age==="9-11") return "child";
    if(age==="12-14" || age==="15-17") return "teen";
    return "adult";
  }

  function levelWordCount(level){
    return level==="Pre-A1" ? 5 : level==="A1" ? 6 : level==="A2" ? 8 : level==="B1" ? 10 : 12;
  }

  function profileWords(){
    const p=currentProfile();
    return (vocab[p.topic] || vocab.travel).slice(0, levelWordCount(p.level));
  }

  function shuffleWord(word){
    const arr=word.split("");
    for(let i=arr.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    const out=arr.join("");
    return out.toLowerCase()===word.toLowerCase() ? word.split("").reverse().join("") : out;
  }

  function gamePrompt(type, round){
    const p=currentProfile();
    const words=profileWords();
    const word=words[round % words.length];
    const sentenceList=topicSentences[p.topic] || topicSentences.travel;
    const sentence=sentenceList[Math.min(sentenceList.length-1, p.level==="Pre-A1"||p.level==="A1"?0:p.level==="A2"?1:p.level==="B1"?2:3)];
    const topicName=p.topic.replace("-"," ");
    const genericQuestions = {
      travel:["Where would you like to travel next?","What makes a trip enjoyable?","Is it better to plan everything before a trip?"],
      food:["What meal could you eat every week?","What makes food healthy?","How does food connect people and cultures?"],
      school:["Which school activity helps you learn most?","What makes a good teacher?","What should schools change first?"],
      hobbies:["Which hobby would you recommend to a friend?","Why do people stop doing hobbies?","Can hobbies be as important as work or study?"],
      technology:["Which technology saves you the most time?","What is one problem technology creates?","How should people protect their privacy online?"],
      "daily-life":["What part of your daily routine works well?","What would you change about your weekdays?","Are busy routines a sign of productivity?"]
    };
    const questions=genericQuestions[p.topic]||genericQuestions.travel;
    const qIndex = p.level==="Pre-A1"||p.level==="A1" ? 0 : p.level==="A2" ? 1 : 2;
    const question=questions[(qIndex+round)%questions.length];

    const data={
      taboo:{
        label:"TABOO · 60 SEC",
        main:word.toUpperCase(),
        support:"Explain the word without using the hidden taboo clues.",
        answer:["Do not say",topicName,definitions[word] ? definitions[word].split(" ").slice(0,3).join(" ") : "related word"]
      },
      rather:{
        label:"WOULD YOU RATHER?",
        main:p.age==="6-8"||p.age==="9-11" ? "Travel by PLANE or TRAIN?" :
             p.topic==="technology" ? "Give up SOCIAL MEDIA or VIDEO GAMES for a month?" :
             p.topic==="food" ? "Eat the SAME BREAKFAST or the SAME DINNER for a month?" :
             "Have more FREE TIME or more MONEY for experiences?",
        support:p.level==="Pre-A1"||p.level==="A1" ? "Choose one and give a short reason." : "Choose a side, explain why, then ask a follow-up question.",
        answer:["A","B","Why?"]
      },
      sentence:{
        label:"SENTENCE BUILDER",
        main:sentence.split(" ").sort(()=>Math.random()-.5).join(" / "),
        support:"Put the words in the correct order.",
        answer:[sentence]
      },
      wheel:{
        label:"SPEAKING WHEEL",
        main:question,
        support:p.level==="Pre-A1" ? "Use words or one short sentence." : p.level==="A1" ? "Answer in 1–2 sentences." : p.level==="A2" ? "Give a reason and ask one follow-up." : "Develop your answer and support it with an example.",
        answer:["Think","Answer","Follow-up"]
      },
      memory:{
        label:"MEMORY MATCH",
        main:word.toUpperCase(),
        support:"Which meaning matches this word?",
        answer:[definitions[word] || `a useful ${topicName} word`]
      },
      quiz:{
        label:"TEAM QUIZ",
        main:`What does “${word}” mean?`,
        support:"Teams discuss for 15 seconds, then answer.",
        answer:[definitions[word] || `It is connected with ${topicName}.`]
      },
      scramble:{
        label:"WORD SCRAMBLE",
        main:shuffleWord(word).toUpperCase(),
        support:`Unscramble this ${topicName} word.`,
        answer:[word.toUpperCase()]
      },
      missing:{
        label:"MISSING WORD",
        main:sentence.replace(new RegExp("\\b"+word+"\\b","i"),"_____"),
        support:"Complete the sentence with the best word. If the target word is not in this sentence, suggest a natural alternative.",
        answer:[sentence]
      },
      hotseat:{
        label:"HOT SEAT · 60 SEC",
        main:question,
        support:"Answer quickly. Teacher presses Next for another prompt.",
        answer:["Keep talking","No long pause","+1 point"]
      },
      category:{
        label:"CATEGORY RACE · 30 SEC",
        main:`Name ${p.level==="Pre-A1"?3:p.level==="A1"?5:p.level==="A2"?6:8} things connected with ${topicName}.`,
        support:"One point for each correct word. No repeats.",
        answer:words.slice(0,8)
      },
      roleplay:{
        label:"ROLE PLAY",
        main:(roleplays[p.topic]||roleplays.travel)[ageBand(p.age)],
        support:p.level==="Pre-A1"||p.level==="A1" ? "Use the useful phrases you know." : "Stay in role for at least one minute and reach a clear outcome.",
        answer:["Student A","Student B","Swap roles"]
      },
      story:{
        label:"STORY CHAIN",
        main:p.age==="6-8"||p.age==="9-11" ? `Yesterday, I found a strange ${word}...` : `Everything was normal until someone mentioned the ${word}...`,
        support:"Each student adds one sentence. Keep the story connected.",
        answer:[p.level==="B1"||p.level==="B2" ? "Use at least one linking phrase." : "Use complete sentences."]
      },
      error:{
        label:"ERROR HUNTER",
        main:p.level==="Pre-A1"||p.level==="A1" ? "She go to school every day." :
             p.level==="A2" ? "I have went there last weekend." :
             p.level==="B1" ? "If I will have time, I will join you." :
             "Despite of being tired, she continued working.",
        support:"Find the error, correct it and explain the rule.",
        answer:[p.level==="Pre-A1"||p.level==="A1" ? "She goes to school every day." :
                p.level==="A2" ? "I went there last weekend." :
                p.level==="B1" ? "If I have time, I will join you." :
                "Despite being tired, she continued working."]
      },
      pictionary:{
        label:"PICTIONARY",
        main:word.toUpperCase(),
        support:"One student draws. No letters, numbers or speaking.",
        answer:["Draw","Guess","30 sec"]
      },
      findsomeone:{
        label:"FIND SOMEONE WHO...",
        main:p.topic==="travel" ? "has visited a place they want to return to" :
             p.topic==="food" ? "can cook a meal they are proud of" :
             p.topic==="school" ? "has learned something useful outside school" :
             p.topic==="hobbies" ? "started a new hobby in the last year" :
             p.topic==="technology" ? "has deleted an app because it wasted time" :
             "changed one part of their daily routine recently",
        support:"Find one person, ask a follow-up question, then report the answer.",
        answer:["Find","Ask","Report"]
      }
    };
    return data[type] || data.wheel;
  }

  const gameNames={
    taboo:"Taboo",rather:"Would You Rather?",sentence:"Sentence Builder",wheel:"Speaking Wheel",
    memory:"Memory Match",quiz:"Team Quiz",scramble:"Word Scramble",missing:"Missing Word",
    hotseat:"Hot Seat",category:"Category Race",roleplay:"Role Play",story:"Story Chain",
    error:"Error Hunter",pictionary:"Pictionary Prompt",findsomeone:"Find Someone Who"
  };

  let activeGame="taboo", gameRound=0, gameBlue=0, gameOrange=0;
  const gameModal=$("#gameModal");
  function paintGame(){
    const p=currentProfile();
    const d=gamePrompt(activeGame,gameRound);
    $("#gameModalTitle").textContent=gameNames[activeGame]||"Classroom Game";
    $("#gameModalType").textContent="ADAPTIVE GAME";
    $("#gameProfileBadge").textContent=`${p.age.replace("-","–")} · ${p.level} · ${p.topic.replace("-"," ")}`;
    $("#gameTaskLabel").textContent=d.label;
    $("#gameTaskMain").textContent=d.main;
    $("#gameTaskSupport").textContent=d.support;
    const extra=$("#gameTaskExtra");
    if(extra){
      extra.classList.remove("revealed");
      extra.dataset.answer=JSON.stringify(d.answer||[]);
      extra.innerHTML='<span>Answer / hint hidden</span>';
    }
    $("#gameBlueScore").textContent=gameBlue;
    $("#gameOrangeScore").textContent=gameOrange;
  }

  $$("[data-launch-game]").forEach(b=>b.addEventListener("click",()=>{
    activeGame=b.dataset.launchGame;
    gameRound=0;gameBlue=0;gameOrange=0;
    paintGame();
    gameModal?.classList.add("open");
    gameModal?.setAttribute("aria-hidden","false");
  }));
  $("#closeGameModal")?.addEventListener("click",()=>{
    gameModal?.classList.remove("open");gameModal?.setAttribute("aria-hidden","true");
  });
  $("#nextGameRound")?.addEventListener("click",()=>{gameRound++;paintGame();});
  $("#revealGameAnswer")?.addEventListener("click",()=>{
    const extra=$("#gameTaskExtra");
    if(!extra) return;
    let a=[];try{a=JSON.parse(extra.dataset.answer||"[]")}catch{}
    extra.classList.add("revealed");
    extra.innerHTML=a.map(x=>`<span>${esc(x)}</span>`).join("") || "<span>No answer needed</span>";
  });
  $("#gameBluePlus")?.addEventListener("click",()=>{$("#gameBlueScore").textContent=++gameBlue;});
  $("#gameBlueMinus")?.addEventListener("click",()=>{$("#gameBlueScore").textContent=gameBlue=Math.max(0,gameBlue-1);});
  $("#gameOrangePlus")?.addEventListener("click",()=>{$("#gameOrangeScore").textContent=++gameOrange;});
  $("#gameOrangeMinus")?.addEventListener("click",()=>{$("#gameOrangeScore").textContent=gameOrange=Math.max(0,gameOrange-1);});

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"){
      gameModal?.classList.remove("open");
      $("#lessonModal")?.classList.remove("open");
    }
  });
})();
