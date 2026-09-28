(() => {
  "use strict";
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>[...r.querySelectorAll(s)];

  let guideIndex=0, guideTimer=null;
  function showGuideSlide(i){
    const slides=$$(".guide-tour-slide");
    const dots=$$("[data-guide-dot]");
    if(!slides.length)return;
    guideIndex=(i+slides.length)%slides.length;
    slides.forEach((s,n)=>s.classList.toggle("active",n===guideIndex));
    dots.forEach((d,n)=>d.classList.toggle("active",n===guideIndex));
  }
  function stopGuide(){
    if(guideTimer){clearInterval(guideTimer);guideTimer=null;}
    const b=$("#guideAutoPlay");if(b)b.textContent="▶ Oynat";
  }
  function startGuide(){
    stopGuide();
    const b=$("#guideAutoPlay");if(b)b.textContent="❚❚ Duraklat";
    guideTimer=setInterval(()=>showGuideSlide(guideIndex+1),3200);
  }
  $("#guideAutoPlay")?.addEventListener("click",()=>guideTimer?stopGuide():startGuide());
  $$("[data-guide-dot]").forEach((b,i)=>b.addEventListener("click",()=>{stopGuide();showGuideSlide(i);}));
  $$("[data-open-guide]").forEach(b=>b.addEventListener("click",()=>{
    $("#teacher-guide")?.scrollIntoView({behavior:"smooth",block:"start"});
    setTimeout(startGuide,450);
  }));
  showGuideSlide(0);

  const banner=$("#firstUseBanner");
  try{ if(localStorage.getItem("escEducatorGuideSeenV1")==="1" && banner) banner.hidden=true; }catch{}
  $("#closeGuideBanner")?.addEventListener("click",()=>{
    if(banner)banner.hidden=true;
    try{localStorage.setItem("escEducatorGuideSeenV1","1");}catch{}
  });
  $("#bannerOpenGuide")?.addEventListener("click",()=>{
    $("#teacher-guide")?.scrollIntoView({behavior:"smooth",block:"start"});
    setTimeout(startGuide,450);
  });

  function setLiveMode(mode){
    const modal=$("#lessonModal"); if(!modal)return;
    modal.classList.toggle("solo-mode",mode==="solo");
    $$("[data-live-mode]").forEach(b=>b.classList.toggle("active",b.dataset.liveMode===mode));
    const note=$("#liveModeNote");
    if(note)note.textContent=mode==="solo"
      ?"Takımsız mod: sadece etkinliği ilerlet. Puan vermek zorunda değilsin."
      :"2 Takım modu: sınıfı iki gruba ayır, doğru cevaplarda +10 puan ver.";
  }
  $$("[data-live-mode]").forEach(b=>b.addEventListener("click",()=>setLiveMode(b.dataset.liveMode)));

  function teamName(id,fallback){
    return ($("#"+id)?.value||fallback).trim()||fallback;
  }
  function paintTeamNames(){
    const one=teamName("teamOneName","Takım 1");
    const two=teamName("teamTwoName","Takım 2");
    if($("#teamOneLabel"))$("#teamOneLabel").textContent=one.toUpperCase();
    if($("#teamTwoLabel"))$("#teamTwoLabel").textContent=two.toUpperCase();
    if($("#addBlue"))$("#addBlue").textContent="+10 "+one;
    if($("#addOrange"))$("#addOrange").textContent="+10 "+two;
    if($("#gameTeamOneLabel"))$("#gameTeamOneLabel").childNodes[0].nodeValue=one.toUpperCase()+" ";
    if($("#gameTeamTwoLabel"))$("#gameTeamTwoLabel").childNodes[0].nodeValue=two.toUpperCase()+" ";
  }
  ["teamOneName","teamTwoName"].forEach(id=>$("#"+id)?.addEventListener("input",paintTeamNames));
  paintTeamNames();
  setLiveMode("solo");

  function setGameMode(mode){
    const modal=$("#gameModal"); if(!modal)return;
    modal.classList.toggle("solo-mode",mode==="solo");
    $$("[data-game-mode]").forEach(b=>b.classList.toggle("active",b.dataset.gameMode===mode));
    const note=$("#gameModeNote");
    if(note)note.textContent=mode==="solo"
      ?"Takımsız: öğrenciler bireysel, çift veya tüm sınıf olarak oynayabilir; puan zorunlu değildir."
      :"2 Takım: sınıfı iki gruba ayır ve istersen her doğru cevap için puan ver.";
  }
  $$("[data-game-mode]").forEach(b=>b.addEventListener("click",()=>setGameMode(b.dataset.gameMode)));
  setGameMode("solo");

  const gameInfo={
    taboo:["Bir öğrenci kelimeyi anlatır; ekrandaki yasak kelimeleri söylemez. Diğerleri tahmin eder.","Vocabulary · 5–10 dk"],
    rather:["İki seçenek gösterilir. Öğrenci birini seçer, nedenini söyler ve bir follow-up sorusuna cevap verir.","Speaking · 5–10 dk"],
    sentence:["Karışık kelimeleri doğru sıraya koyup cümleyi kurarlar. Sonra cümleyi sesli kullanırlar.","Grammar · 5–8 dk"],
    wheel:["Ekrandaki speaking sorusu cevaplanır. Öğretmen Next ile yeni soruya geçer.","Speaking · 5–15 dk"],
    memory:["Kelime ile anlamı eşleştirilir; cevap açıldıktan sonra kelime bir cümlede kullanılır.","Vocabulary · 5–8 dk"],
    quiz:["Soruyu göster, düşünme süresi ver, cevabı aç. İstersen iki takıma puan ver.","Revision · 8–15 dk"],
    scramble:["Karışık harflerden hedef kelime bulunur; ardından kelimeyle örnek cümle kurulur.","Vocabulary · 5–8 dk"],
    missing:["Boşluğu uygun kelimeyle tamamla; ardından neden doğru olduğunu açıklat.","Grammar · 5–10 dk"],
    hotseat:["Bir öğrenci kısa sürede art arda sorulara cevap verir. Next ile tempoyu koru.","Fluency · 5–10 dk"],
    category:["Bir kategori verilir; süre içinde olabildiğince çok doğru kelime söylenir.","Vocabulary · 5 dk"],
    roleplay:["İki öğrenci rolleri alır ve verilen gerçek hayat durumunu İngilizce tamamlar.","Speaking · 8–15 dk"],
    story:["Her öğrenci hikâyeye bir cümle ekler; hedef yapı veya kelimeler korunur.","Speaking + Grammar · 8–12 dk"],
    error:["Yanlış cümleyi bul, düzelt ve kuralı kısa biçimde açıkla.","Grammar · 5–10 dk"],
    pictionary:["Bir öğrenci hedef kelimeyi çizer; diğerleri İngilizce tahmin eder.","Vocabulary · 5–10 dk"],
    findsomeone:["Öğrenciler sınıfta dolaşıp uygun kişiyi bulur, soru sorar ve cevabı raporlar.","Speaking · 10–15 dk"]
  };

  function enhanceGameCards(){
    $$("#adaptiveGameGrid article").forEach(card=>{
      if(card.querySelector(".edu-game-card-meta"))return;
      const kinds=(card.dataset.kind||"").split(/\s+/).filter(Boolean);
      const meta=document.createElement("div");
      meta.className="edu-game-card-meta";
      const mode=kinds.includes("team")?"Takım destekli":"Takımsız oynanabilir";
      const skill=kinds.includes("speaking")?"Speaking":kinds.includes("grammar")?"Grammar":"Vocabulary";
      meta.innerHTML="<span>"+mode+"</span><span>"+skill+"</span>";
      const button=card.querySelector("[data-launch-game]");
      if(button){button.textContent="Oyunu aç →";card.insertBefore(meta,button);}
      else card.appendChild(meta);
    });
  }
  enhanceGameCards();

  $$("[data-launch-game]").forEach(btn=>btn.addEventListener("click",()=>{
    const key=btn.dataset.launchGame;
    const info=gameInfo[key]||["Soruyu göster, öğrencinin cevap vermesine izin ver ve Next ile yeni tura geç.","5–10 dk"];
    if($("#gameHowText"))$("#gameHowText").textContent=info[0];
    if($("#gameBestFor"))$("#gameBestFor").textContent=info[1];
    if($("#gameBlueScore"))$("#gameBlueScore").textContent="0";
    if($("#gameOrangeScore"))$("#gameOrangeScore").textContent="0";
    setGameMode("solo");
  }));

  $("#startDemoLesson")?.addEventListener("click",()=>{
    if($("#blueScore"))$("#blueScore").textContent="0";
    if($("#orangeScore"))$("#orangeScore").textContent="0";
    setLiveMode("solo");
    paintTeamNames();
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
      if(!row.title && phaseHelp[title])row.title=phaseHelp[title];
    });
  }
  $("#lessonForm")?.addEventListener("submit",()=>setTimeout(annotatePlan,0));
  annotatePlan();
})();