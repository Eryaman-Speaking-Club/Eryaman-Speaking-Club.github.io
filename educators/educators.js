
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
