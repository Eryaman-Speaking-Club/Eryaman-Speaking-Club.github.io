(() => {
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];

  let guideIndex=0;
  let guideTimer=null;
  let soundEnabled=true;
  let audioCtx=null;

  const tourCopy={
    tr:{
      captions:[
        "Sınıfını, seviyeyi ve öğretim yolunu seç.",
        "Dersin iskeletini oluştur; istediğin aşamayı çıkarabilirsin.",
        "Practice Game'i takımsız veya iki takımlı kullan.",
        "Canlı derste Next ile ilerle; puan tamamen isteğe bağlı."
      ],
      narration:[
        "Önce hangi sınıf veya öğrenci için çalıştığını seç. MEB, özel ders, genel İngilizce veya tamamen serbest ders yolundan başlayabilirsin.",
        "Lesson Builder süre, seviye ve hedefe göre bir ders akışı hazırlar. Warm-up, vocabulary, practice game, speaking ve exit aşamalarından istemediklerini kaldırabilirsin.",
        "Oyunlar kısa bir practice aşamasıdır. Takımsız oynayabilir, çift çalışması yapabilir veya istersen iki takım açıp puan tutabilirsin.",
        "Canlı derste soruyu göster, öğrenciyi konuştur ve sonraki aşamaya geç. Sistem öğretmene yardım eder; dersin kontrolü öğretmendedir."
      ]
    },
    en:{
      captions:[
        "Choose the class, level and teaching path.",
        "Build the lesson structure and remove any stage you do not need.",
        "Run Practice Games with no teams or optional two-team scoring.",
        "Move through the live lesson with Next; scoring is always optional."
      ],
      narration:[
        "Start by choosing who you are teaching. You can use the MEB curriculum, a private student path, general English, or a fully custom lesson.",
        "Lesson Builder creates a flow from your duration, level and goal. You can keep or remove warm-up, vocabulary, practice game, speaking and exit stages.",
        "Games are short practice activities. Use them without teams, with pairs, or turn on two-team scoring only when it helps your class.",
        "In live class, show the prompt, let students speak and move to the next stage. The system supports the teacher; the teacher stays in control."
      ]
    }
  };

  function lang(){return document.documentElement.lang==="en"?"en":"tr";}
  function copy(){return tourCopy[lang()];}

  function ensureAudio(){
    if(!soundEnabled)return null;
    try{
      audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==="suspended")audioCtx.resume();
      return audioCtx;
    }catch{return null;}
  }
  function tone(freq=560,duration=.08,volume=.035){
    const ctx=ensureAudio(); if(!ctx)return;
    const osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.type="sine";osc.frequency.value=freq;
    gain.gain.setValueAtTime(volume,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
    osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+duration);
  }
  function speak(text){
    if(!soundEnabled || !("speechSynthesis" in window))return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang=lang()==="en"?"en-US":"tr-TR";
    u.rate=.98;u.pitch=1;u.volume=.88;
    const voices=window.speechSynthesis.getVoices();
    const voice=voices.find(v=>v.lang?.toLowerCase().startsWith(lang()==="en"?"en":"tr"));
    if(voice)u.voice=voice;
    window.speechSynthesis.speak(u);
  }
  function stopSpeech(){
    if("speechSynthesis" in window)window.speechSynthesis.cancel();
  }

  function showGuideSlide(i,{narrate=false}={}){
    const slides=$$(".guide-tour-slide");
    const dots=$$("[data-guide-dot]");
    const stage=$("#guideDemoStage");
    if(!slides.length)return;
    guideIndex=(i+slides.length)%slides.length;
    slides.forEach((s,n)=>s.classList.toggle("active",n===guideIndex));
    dots.forEach((d,n)=>d.classList.toggle("active",n===guideIndex));
    if(stage){
      stage.classList.remove("scene-1","scene-2","scene-3","scene-4");
      stage.classList.add("scene-"+(guideIndex+1));
    }
    const caption=$("#guideCaption");
    if(caption)caption.textContent=copy().captions[guideIndex];
    tone([520,620,720,820][guideIndex],.09);
    if(narrate)speak(copy().narration[guideIndex]);
  }

  function stopGuide(){
    if(guideTimer){clearTimeout(guideTimer);guideTimer=null;}
    stopSpeech();
    const b=$("#guideAutoPlay");
    if(b)b.textContent=lang()==="en"?"▶ Play":"▶ Oynat";
    $("#guideDemoStage")?.classList.remove("is-playing");
  }

  function scheduleNext(){
    if(!guideTimer)return;
    guideTimer=setTimeout(()=>{
      if(guideIndex>=3){stopGuide();return;}
      showGuideSlide(guideIndex+1,{narrate:true});
      scheduleNext();
    },5200);
  }

  function startGuide(fromStart=false){
    stopGuide();
    ensureAudio();
    if(fromStart)guideIndex=0;
    const b=$("#guideAutoPlay");
    if(b)b.textContent=lang()==="en"?"❚❚ Pause":"❚❚ Duraklat";
    $("#guideDemoStage")?.classList.add("is-playing");
    showGuideSlide(guideIndex,{narrate:true});
    guideTimer=setTimeout(()=>{},1);
    scheduleNext();
  }

  $("#guideAutoPlay")?.addEventListener("click",()=>{
    if(guideTimer)stopGuide(); else startGuide(false);
  });
  $("#guideReplay")?.addEventListener("click",()=>startGuide(true));
  $("#guideSoundToggle")?.addEventListener("click",e=>{
    soundEnabled=!soundEnabled;
    e.currentTarget.setAttribute("aria-pressed",String(soundEnabled));
    e.currentTarget.textContent=soundEnabled?(lang()==="en"?"🔊 Sound on":"🔊 Ses açık"):(lang()==="en"?"🔇 Sound off":"🔇 Ses kapalı");
    if(soundEnabled){ensureAudio();tone(700,.1);speak(copy().narration[guideIndex]);}
    else stopSpeech();
  });
  $$("[data-guide-dot]").forEach((b,i)=>b.addEventListener("click",()=>{
    stopGuide();showGuideSlide(i,{narrate:soundEnabled});
  }));
  $$("[data-open-guide]").forEach(b=>b.addEventListener("click",()=>{
    $("#teacher-guide")?.scrollIntoView({behavior:"smooth",block:"start"});
    setTimeout(()=>startGuide(true),450);
  }));

  const banner=$("#firstUseBanner");
  try{if(localStorage.getItem("escEducatorGuideSeenV1")==="1"&&banner)banner.hidden=true;}catch{}
  $("#closeGuideBanner")?.addEventListener("click",()=>{
    if(banner)banner.hidden=true;
    try{localStorage.setItem("escEducatorGuideSeenV1","1");}catch{}
  });
  $("#bannerOpenGuide")?.addEventListener("click",()=>{
    $("#teacher-guide")?.scrollIntoView({behavior:"smooth",block:"start"});
    setTimeout(()=>startGuide(true),450);
  });

  function setLiveMode(mode){
    const modal=$("#lessonModal");if(!modal)return;
    modal.classList.toggle("solo-mode",mode==="solo");
    $$("[data-live-mode]").forEach(b=>b.classList.toggle("active",b.dataset.liveMode===mode));
    const note=$("#liveModeNote");
    if(note)note.textContent=mode==="solo"
      ?(lang()==="en"?"No teams: move through activities without keeping score.":"Takımsız mod: sadece etkinliği ilerlet. Puan vermek zorunda değilsin.")
      :(lang()==="en"?"2 Teams: split the class into two groups and add points when useful.":"2 Takım modu: sınıfı iki gruba ayır, gerektiğinde puan ekle.");
  }
  $$("[data-live-mode]").forEach(b=>b.addEventListener("click",()=>setLiveMode(b.dataset.liveMode)));

  function teamName(id,fallback){return ($("#"+id)?.value||fallback).trim()||fallback;}
  function paintTeamNames(){
    const one=teamName("teamOneName",lang()==="en"?"Team 1":"Takım 1");
    const two=teamName("teamTwoName",lang()==="en"?"Team 2":"Takım 2");
    if($("#teamOneLabel"))$("#teamOneLabel").textContent=one.toUpperCase();
    if($("#teamTwoLabel"))$("#teamTwoLabel").textContent=two.toUpperCase();
    if($("#addBlue"))$("#addBlue").textContent="+10 "+one;
    if($("#addOrange"))$("#addOrange").textContent="+10 "+two;
    const g1=$("#gameTeamOneLabel"),g2=$("#gameTeamTwoLabel");
    if(g1?.firstChild)g1.firstChild.nodeValue=one.toUpperCase()+" ";
    if(g2?.firstChild)g2.firstChild.nodeValue=two.toUpperCase()+" ";
  }
  ["teamOneName","teamTwoName"].forEach(id=>$("#"+id)?.addEventListener("input",paintTeamNames));

  function setGameMode(mode){
    const modal=$("#gameModal");if(!modal)return;
    modal.classList.toggle("solo-mode",mode==="solo");
    $$("[data-game-mode]").forEach(b=>b.classList.toggle("active",b.dataset.gameMode===mode));
    const note=$("#gameModeNote");
    if(note)note.textContent=mode==="solo"
      ?(lang()==="en"?"No teams: use the activity individually, in pairs or with the whole class.":"Takımsız: etkinliği bireysel, çift veya tüm sınıfla kullan; puan zorunlu değil.")
      :(lang()==="en"?"2 Teams: split the class into two groups and keep score if useful.":"2 Takım: sınıfı iki gruba ayır ve istersen puan tut.");
  }
  $$("[data-game-mode]").forEach(b=>b.addEventListener("click",()=>setGameMode(b.dataset.gameMode)));

  const gameInfo={
    taboo:["Bir öğrenci kelimeyi anlatır; yasak kelimeleri söylemez. Diğerleri tahmin eder.","Vocabulary · 5–10 dk","One student explains the word without saying the taboo clues. Others guess.","Vocabulary · 5–10 min"],
    rather:["İki seçenek gösterilir. Öğrenci birini seçer ve nedenini açıklar.","Speaking · 5–10 dk","Students choose between two options and explain why.","Speaking · 5–10 min"],
    sentence:["Karışık kelimeleri doğru sıraya koyup cümleyi kurarlar.","Grammar · 5–8 dk","Students put shuffled words in the correct order.","Grammar · 5–8 min"],
    wheel:["Speaking sorusunu cevapla; Next ile yeni soruya geç.","Speaking · 5–15 dk","Answer the speaking prompt and use Next for another one.","Speaking · 5–15 min"],
    memory:["Kelime ile anlamı eşleştir; ardından kelimeyi cümlede kullan.","Vocabulary · 5–8 dk","Match the word with its meaning, then use it in a sentence.","Vocabulary · 5–8 min"],
    quiz:["Soruyu göster, düşünme süresi ver, cevabı aç. Takım puanı isteğe bağlı.","Revision · 8–15 dk","Show the question, give thinking time and reveal the answer. Team scoring is optional.","Revision · 8–15 min"],
    scramble:["Karışık harflerden hedef kelimeyi bul.","Vocabulary · 5–8 dk","Unscramble the target word.","Vocabulary · 5–8 min"],
    missing:["Boşluğu uygun kelimeyle tamamla ve nedenini açıkla.","Grammar · 5–10 dk","Complete the gap and explain why the answer fits.","Grammar · 5–10 min"],
    hotseat:["Bir öğrenci kısa sürede art arda sorulara cevap verir.","Fluency · 5–10 dk","One student answers a sequence of quick questions.","Fluency · 5–10 min"],
    category:["Bir kategoride süre içinde olabildiğince çok doğru kelime üret.","Vocabulary · 5 dk","Produce as many correct words as possible in the category.","Vocabulary · 5 min"],
    roleplay:["İki öğrenci verilen gerçek hayat durumunu İngilizce tamamlar.","Speaking · 8–15 dk","Two students complete a real-life scenario in English.","Speaking · 8–15 min"],
    story:["Her öğrenci hikâyeye bir cümle ekler.","Speaking + Grammar · 8–12 dk","Each student adds one sentence to the story.","Speaking + Grammar · 8–12 min"],
    error:["Yanlış cümleyi bul, düzelt ve kuralı açıkla.","Grammar · 5–10 dk","Find the error, correct it and explain the rule.","Grammar · 5–10 min"],
    pictionary:["Bir öğrenci hedef kelimeyi çizer; diğerleri tahmin eder.","Vocabulary · 5–10 dk","One student draws the target word and others guess.","Vocabulary · 5–10 min"],
    findsomeone:["Öğrenciler uygun kişiyi bulur, soru sorar ve cevabı raporlar.","Speaking · 10–15 dk","Students find a matching classmate, ask a follow-up and report the answer.","Speaking · 10–15 min"]
  };

  function enhanceGameCards(){
    $$("#adaptiveGameGrid article").forEach(card=>{
      if(card.querySelector(".edu-game-card-meta"))return;
      const kinds=(card.dataset.kind||"").split(/\s+/).filter(Boolean);
      const meta=document.createElement("div");meta.className="edu-game-card-meta";
      const mode=kinds.includes("team")?(lang()==="en"?"Team-supported":"Takım destekli"):(lang()==="en"?"No teams required":"Takımsız oynanabilir");
      const skill=kinds.includes("speaking")?"Speaking":kinds.includes("grammar")?"Grammar":"Vocabulary";
      meta.innerHTML="<span>"+mode+"</span><span>"+skill+"</span>";
      const button=card.querySelector("[data-launch-game]");
      if(button){button.textContent=lang()==="en"?"Open game →":"Oyunu aç →";card.insertBefore(meta,button);}else card.appendChild(meta);
    });
  }

  $$("[data-launch-game]").forEach(btn=>btn.addEventListener("click",()=>{
    const key=btn.dataset.launchGame;
    const info=gameInfo[key]||["Soruyu göster ve Next ile ilerle.","5–10 dk","Show the prompt and use Next to continue.","5–10 min"];
    const en=lang()==="en";
    if($("#gameHowText"))$("#gameHowText").textContent=en?info[2]:info[0];
    if($("#gameBestFor"))$("#gameBestFor").textContent=en?info[3]:info[1];
    if($("#gameBlueScore"))$("#gameBlueScore").textContent="0";
    if($("#gameOrangeScore"))$("#gameOrangeScore").textContent="0";
    setGameMode("solo");
  }));

  $("#startDemoLesson")?.addEventListener("click",()=>{
    if($("#blueScore"))$("#blueScore").textContent="0";
    if($("#orangeScore"))$("#orangeScore").textContent="0";
    setLiveMode("solo");paintTeamNames();
  });

  const phaseHelp={
    "Warm-up":"Konuyu açar; öğrenciyi derse sokar.",
    "Vocabulary":"Ders içinde kullanılacak hedef kelimeleri hazırlar.",
    "Practice Game":"Kelime/grammar bilgisini kısa ve interaktif biçimde uygulatır.",
    "Speaking":"Öğrencinin dili gerçekten üretmesini sağlar.",
    "Exit":"Ders sonunda ne kaldığını hızlıca kontrol eder."
  };
  function annotatePlan(){
    $$(".generated-plan .plan-row").forEach(row=>{
      const title=$("b",row)?.textContent||"";
      if(phaseHelp[title])row.title=phaseHelp[title];
    });
  }
  $("#lessonForm")?.addEventListener("submit",()=>setTimeout(annotatePlan,420));

  window.addEventListener("esc:languagechange",()=>{
    stopGuide();
    const sound=$("#guideSoundToggle");
    if(sound)sound.textContent=soundEnabled?(lang()==="en"?"🔊 Sound on":"🔊 Ses açık"):(lang()==="en"?"🔇 Sound off":"🔇 Ses kapalı");
    showGuideSlide(guideIndex,{narrate:false});
    enhanceGameCards();
    setLiveMode($("#lessonModal")?.classList.contains("solo-mode")?"solo":"team");
    setGameMode($("#gameModal")?.classList.contains("solo-mode")?"solo":"team");
    paintTeamNames();
  });

  paintTeamNames();
  setLiveMode("solo");
  setGameMode("solo");
  enhanceGameCards();
  showGuideSlide(0,{narrate:false});
  annotatePlan();
})();