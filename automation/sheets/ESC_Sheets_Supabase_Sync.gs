/**
 * Eryaman Speaking Club | Google Sheets <-> Supabase (attendance authority: Sheets)
 * ONE-TIME INSTALL in the existing bound Apps Script project, as a NEW file.
 * Do NOT delete or edit Kod.gs, ESC_Email.gs, or existing attendance formulas.
 *
 * 1. In admin > Google Sheets Bağlantısı, generate a private bridge key.
 * 2. Apps Script > Project Settings > Script Properties:
 *      ESC_SHEETS_BRIDGE_TOKEN = your private bridge key
 * 3. Run ESC_SYNC_SETUP once as spreadsheet owner.
 * 4. Run ESC_SYNC_PREVIEW and ESC_SYNC_run, inspect "ESC Senkronizasyon".
 * 5. Keep LEGACY "E-posta Otomasyonu"!B2 = KAPALI always.
 *
 * Event dates: site and "Etkinlikler" two-way, with conflict detection.
 * Attendance: "Katılım Yüz Yüze" / "Katılım Online" is authoritative.
 * Email templates: "E-posta Şablonları" controls messaging copy.
 * This file NEVER sends an email. It does not enable Gmail automatically.
 */
const ESC_SYNC = Object.freeze({
  spreadsheet: '1nD5GjKPQD88UCkJJZkygEZpB2Hj2rvCqWlsFlgrhgK4',
  url: 'https://bshzakigvtyjilolsfjp.supabase.co/functions/v1/esc-sheets-bridge',
  tokenKey: 'ESC_SHEETS_BRIDGE_TOKEN',
  zone: 'Europe/Istanbul',
  owner: 'eryamanspeakingclub@gmail.com',
  control: 'ESC Senkronizasyon',
  futureDays: 35,
  historyDays: 30
});

function ESC_SYNC_SETUP(){
  escSyncOwner_();
  const token=PropertiesService.getScriptProperties().getProperty(ESC_SYNC.tokenKey);
  if(!token || !/^[A-Za-z0-9_-]{48,128}$/.test(token))
    throw Error('Önce Apps Script > Proje Ayarları > Komut Dosyası Özellikleri bölümüne ESC_SHEETS_BRIDGE_TOKEN ekleyin.');
  const ss=SpreadsheetApp.openById(ESC_SYNC.spreadsheet);
  const legacy=ss.getSheetByName('E-posta Otomasyonu');
  if(!legacy || legacy.getRange('B2').getDisplayValue().trim()!=='KAPALI')
    throw Error('Eski e-posta otomasyonu KAPALI olmalıdır. B2 hücresini kontrol edin.');
  const health=escSyncRequest_('pull_events',{});
  escSyncRequest_('client_checkin',{version:2,attendance_enabled:ss.getSheetByName(ESC_SYNC.control)?.getRange('B6').getDisplayValue()==='AÇIK'});
  if(!Array.isArray(health.events))throw Error('Supabase canlı takviminden sonuç gelmedi.');
  const functions=['ESC_SYNC_onEdit','ESC_SYNC_onFormSubmit','ESC_SYNC_run'];
  ScriptApp.getProjectTriggers().filter(t=>functions.indexOf(t.getHandlerFunction())>=0)
    .forEach(t=>ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('ESC_SYNC_onEdit').forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger('ESC_SYNC_onFormSubmit').forSpreadsheet(ss).onFormSubmit().create();
  ScriptApp.newTrigger('ESC_SYNC_run').timeBased().everyMinutes(5).create();
  const cfg=ss.getSheetByName(ESC_SYNC.control);
  if(!cfg)throw Error('ESC Senkronizasyon sayfası bulunamadı.');
  cfg.getRange('B2').setValue('BAĞLANDI');
  cfg.getRange('B4').setValue('YOK');
  cfg.getRange('B7').setValue('KAPALI'); // Never authorize emails as a side effect of setup.
  Logger.log('BAĞLANTI KURULDU. 5 dakikalık senkronizasyon. İlk çalıştırmada etkinlik bilgileri Supabase temel alınarak Sheet ile eşitlenecek. E-posta gönderimi KAPALI.');
}

function ESC_SYNC_PREVIEW(){
  escSyncOwner_();
  const ss=SpreadsheetApp.openById(ESC_SYNC.spreadsheet);
  const data=escSyncRequest_('pull_events',{});
  const events=Array.isArray(data.events)?data.events:[];
  const map=escSyncMembers_(ss);
  Logger.log('GÖNDERİMSİZ ÖNİZLEME. Canlı etkinlik sayısı: '+events.length);
  events.filter(e=>new Date(e.end_at).getTime()>=Date.now()-ESC_SYNC.historyDays*86400000)
    .forEach(e=>{
      const members=escSyncRoster_(ss,e,map);
      const good=members.filter(p=>p.consent&&p.member_eligible&&p.email).length;
      Logger.log(e.event_code+' '+e.kind+' | Listede '+members.length+' | İletişime uygun '+good+
        ' | Harici sistemlere henüz yazılmadı.');
    });
  Logger.log('Bu önizleme hiç kimseye e-posta göndermez; Sheet ve Supabase içeriklerini güncellemez.');
}

function ESC_SYNC_run(){
  escSyncOwner_();
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(6000))return;
  let config;
  try{
    const ss=SpreadsheetApp.openById(ESC_SYNC.spreadsheet);
    config=ss.getSheetByName(ESC_SYNC.control);
    if(!config)throw Error('ESC Senkronizasyon sekmesi yok.');
    escSyncEnsureLegacyOff_(ss);
    const attendanceActive=config.getRange('B6').getDisplayValue()==='AÇIK';
    // A client handshake is required before accepting operations from the
    // website. The server refuses requests while this client is outdated.
    escSyncRequest_('client_checkin',{
      version:2,attendance_enabled:attendanceActive
    });
    const data=escSyncRequest_('pull_events',{});
    if(!Array.isArray(data.events))throw Error('Etkinlik listesi alınamadı.');
    let changed=0,lists=0,conflicts=[];
    if(config.getRange('B5').getDisplayValue()==='AÇIK'){
      const status=escSyncCalendar_(ss,data.events);
      changed=status.changed;conflicts=status.conflicts;
    }
    if(attendanceActive){
      const members=escSyncMembers_(ss);
      // The directory lets one management screen select even currently
      // unlisted members. Only eligible active members are selectable.
      const validMembers=[...members].filter(([id,m])=>
        /^UYE-[0-9]{3,5}$/.test(id)&&String(m.name||'').trim().length>=2&&
        String(m.name||'').trim().length<=120);
      if(!validMembers.length)throw Error('Üye rehberi boş veya geçersiz; katılım aktarımı durduruldu.');
      escSyncRequest_('push_members',{members:validMembers.map(([member_code,m])=>({
        member_code,full_name:m.name,email:m.email,consent:m.consent,
        eligible:m.eligible
      }))});
      const remote=escSyncRequest_('pull_attendance',{});
      const requests=Array.isArray(remote.items)?remote.items:[];
      const operations=escSyncApplyPendingAttendance_(ss,requests,members);
      SpreadsheetApp.flush();
      const acknowledged=[],successfulEvents=new Set();
      const live=data.events.filter(e=>{
        const n=new Date(e.end_at).getTime();
        return n>=Date.now()-ESC_SYNC.historyDays*86400000
          && n<=Date.now()+(ESC_SYNC.futureDays+10)*86400000;
      });
      for(const event of live){
        const people=escSyncRoster_(ss,event,members);
        // Empty rosters never erase prior selected members during a scheduled check.
        const outcome=escSyncRequest_('push_roster',{
          event_code:event.event_code,kind:event.kind,members:people,confirm_empty:false
        });
        if(outcome.ok===false){
          if(outcome.reason==='empty_snapshot_requires_confirmation'){
            conflicts.push(event.event_code+': 0 kişilik liste mevcut verileri kaldırmadı');
          }else if(outcome.reason!=='event_not_found'){
            conflicts.push(event.event_code+': '+outcome.reason);
          }
        }else{
          lists++;
          successfulEvents.add(event.event_code);
        }
      }
      // Acknowledge only after the matching Sheets snapshot has been accepted
      // by Supabase. If a later API request fails, pending commands retry.
      acknowledged.push(...operations.conflicts);
      acknowledged.push(...operations.ready.filter(x=>successfulEvents.has(x.event_code))
        .map(x=>({id:x.id,status:'applied'})));
      if(acknowledged.length){
        const ack=escSyncRequest_('ack_attendance',{results:acknowledged});
        if(!ack.ok)throw Error('Katılım onayları kaydedilemedi.');
      }
      operations.conflicts.forEach(x=>conflicts.push(x.event_code+': '+x.reason));
      const deferred=operations.ready.filter(x=>!successfulEvents.has(x.event_code)).length;
      if(deferred)conflicts.push(deferred+' katılım değişikliği bekliyor');
    }
    escSyncTemplates_(ss,data.prices||{});
    config.getRange('B7').setValue(data.mail_approved===true?'AÇIK':'KAPALI');
    config.getRange('B3').setValue(new Date()).setNumberFormat('dd.MM.yyyy HH:mm');
    config.getRange('B2').setValue(conflicts.length?'KONTROL GEREKİYOR':'BAĞLANDI');
    config.getRange('B4').setValue(conflicts.length?conflicts.slice(0,5).join(' | ').slice(0,480):'YOK');
    Logger.log('ESC senkronizasyon: '+changed+' takvim işlemi, '+lists+
      ' etkinlik katılım listesi, '+conflicts.length+' çakışma.');
  }catch(err){
    if(config){
      config.getRange('B2').setValue('HATA');
      config.getRange('B4').setValue(String(err.message||err).slice(0,480));
    }
    Logger.log('ESC SYNC ERROR '+String(err));
    throw err;
  }finally{lock.releaseLock();}
}

function ESC_SYNC_onEdit(e){
  if(!e||!e.range)return;
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(5000))return;
  try{
    const ss=e.source||SpreadsheetApp.openById(ESC_SYNC.spreadsheet);
    escSyncEnsureLegacyOff_(ss);
    const tab=e.range.getSheet().getName();
    const row=e.range.getRow(),col=e.range.getColumn();
    const bottom=row+e.range.getNumRows()-1;
    const right=col+e.range.getNumColumns()-1;
    if(tab===ESC_SYNC.control && row<=7 && bottom>=7 && col<=2 && right>=2){
      const val=ss.getSheetByName(tab).getRange('B7').getDisplayValue().trim();
      const accepted=escSyncRequest_('mail_approval',{enabled:val==='AÇIK'});
      if(!accepted.ok){
        ss.getSheetByName(tab).getRange('B7').setValue('KAPALI');
        throw Error('Mesaj izni açılamadı: '+accepted.reason+'. Gmail kurulumunu bitirin.');
      }
    }else if(tab==='Etkinlikler' && right>=2 && col<=13 && row>=5 && row<=204){
      const remote=escSyncRequest_('pull_events',{});
      const stats=escSyncCalendar_(ss,remote.events||[],{onlyRow:row});
      if(stats.conflicts.length)throw Error(stats.conflicts.join(' | '));
    }else if((tab==='Katılım Yüz Yüze'||tab==='Katılım Online')
          && bottom>=4 && col<=9 && right>=5){
      const remote=escSyncRequest_('pull_events',{});
      const map=new Map((remote.events||[]).map(x=>[x.event_code,x]));
      const members=escSyncMembers_(ss);
      const first=Math.max(1,Math.floor((Math.max(4,row)-4)/500)+1);
      const last=Math.floor((bottom-4)/500)+1;
      for(let num=first;num<=Math.min(200,last);num++){
        const code='ETK-'+('000'+num).slice(-3);
        const event=map.get(code);
        if(!event)continue;
        const expected=event.kind==='online'?'Katılım Online':'Katılım Yüz Yüze';
        if(expected!==tab)continue;
        const people=escSyncRoster_(ss,event,members);
        const confirmed=(col<=5&&right>=5); // A deliberate edit of Listede checkbox.
        const result=escSyncRequest_('push_roster',{event_code:code,kind:event.kind,
          members:people,confirm_empty:confirmed&&people.length===0});
        if(!result.ok)throw Error(code+': '+result.reason);
      }
    }else if(tab==='E-posta Şablonları' && bottom>=2 && row<=6){
      const remote=escSyncRequest_('pull_events',{});
      escSyncTemplates_(ss,remote.prices||{},true);
    }
  }catch(err){
    const ss=e.source||SpreadsheetApp.openById(ESC_SYNC.spreadsheet);
    const cfg=ss.getSheetByName(ESC_SYNC.control);
    if(cfg)cfg.getRange('B4').setValue(String(err.message||err).slice(0,480));
    Logger.log('ESC edit reconciliation: '+String(err));
  }finally{lock.releaseLock();}
}

function ESC_SYNC_onFormSubmit(){
  // A new member may appear in Kayıtlar formulas: the scheduled run reconciles
  // the roster without touching any old automatic welcome sender.
  ESC_SYNC_run();
}

// Safely apply admin attendance requests to the authoritative Sheet.
function escSyncApplyPendingAttendance_(ss,requests,members){
  const output={ready:[],conflicts:[]},cache=new Map();
  if(requests.length>100)throw Error('Too many attendance updates from server');
  for(const item of requests){
    const event_code=String(item.event_code||'');
    const member_code=String(item.member_code||'');
    const id=String(item.id||'');
    const codeNumber=Number(event_code.replace(/^ETK-/,''));
    const kind=String(item.kind||'');
    const reject=reason=>output.conflicts.push({
      id,event_code,status:'conflict',reason:String(reason).slice(0,160)
    });
    if(!/^[0-9a-fA-F-]{36}$/.test(id) || !/^ETK-[0-9]{3,5}$/.test(event_code)
       || !/^UYE-[0-9]{3,5}$/.test(member_code)
       || !Number.isInteger(codeNumber)||codeNumber<1||codeNumber>200
       || !['online','in_person'].includes(kind)
       || !members.has(member_code)){
      reject('Etkinlik veya üye bilgisi geçersiz');continue;
    }
    try{
      const tab=kind==='online'?'Katılım Online':'Katılım Yüz Yüze';
      const sheet=ss.getSheetByName(tab);
      if(!sheet){reject('Katılım sekmesi bulunamadı');continue;}
      const first=4+(codeNumber-1)*500;
      const key=tab+':'+event_code;
      if(!cache.has(key)){
        const cells=sheet.getRange(first,2,500,5).getValues();
        const lookup=new Map();
        cells.forEach((r,index)=>{
          const code=String(r[0]||'').trim();
          if(/^UYE-[0-9]{3,5}$/.test(code)){
            if(lookup.has(code))lookup.set(code,-1); // duplicate = unsafe
            else lookup.set(code,index);
          }
        });
        cache.set(key,{cells,lookup,sheet,first});
      }
      const block=cache.get(key);
      const index=block.lookup.get(member_code);
      if(index===undefined || index<0){
        reject('Üye bu etkinliğin 500 satırlık Sheet bloğunda bulunamadı');continue;
      }
      const row=block.cells[index],actualListed=row[3]===true,
        actualAttended=row[4]===true;
      const oldListed=item.expected_listed===true,
        oldAttended=item.expected_attended===true,
        newListed=item.desired_listed===true,
        newAttended=item.desired_attended===true;
      if(newAttended&&!newListed){reject('Katılan kişi Listede olmalı');continue;}
      if(actualListed===newListed&&actualAttended===newAttended){
        output.ready.push({id,event_code});continue; // already applied after retry
      }
      if(actualListed!==oldListed||actualAttended!==oldAttended){
        reject('Sheets sonradan değişmiş: manuel kontrol gerekli');continue;
      }
      // E = Listede, F = Katıldı. No other formula/field is touched.
      block.sheet.getRange(block.first+index,5,1,2).setValues([[newListed,newAttended]]);
      row[3]=newListed;row[4]=newAttended;
      output.ready.push({id,event_code});
    }catch(err){
      reject('Sheet üzerinde değişiklik yapılamadı: '+String(err.message||err).slice(0,100));
    }
  }
  return output;
}

function escSyncCalendar_(ss,events,options){
  const opts=options||{},sheet=ss.getSheetByName('Etkinlikler');
  if(!sheet)throw Error('Etkinlikler sekmesi bulunamadı');
  const ids=sheet.getRange(5,1,200,1).getDisplayValues();
  const rowByCode=new Map();
  for(let i=0;i<ids.length;i++){const id=String(ids[i][0]||'').trim();if(id)rowByCode.set(id,i+5);}
  const props=PropertiesService.getScriptProperties();
  const result={changed:0,conflicts:[]};
  for(const event of events){
    const row=rowByCode.get(event.event_code);
    if(!row||opts.onlyRow&&row!==opts.onlyRow)continue;
    const key='ESC_SYNC_EVT_'+event.event_code;
    const stateJSON=props.getProperty(key);
    const state=stateJSON?JSON.parse(stateJSON):null;
    const remoteFields=escSyncRemoteFields_(event);
    const current=sheet.getRange(row,2,1,6).getDisplayValues()[0];
    const status=sheet.getRange(row,13).getDisplayValue();
    const localFields=[...current.map(x=>String(x).trim()),String(status||'').trim()];
    const localHash=JSON.stringify(localFields);
    const remoteHash=JSON.stringify(remoteFields);
    const revision=Number(event.revision||1);
    const saveState=(fields,rev)=>props.setProperty(key,JSON.stringify({
      hash:JSON.stringify(fields),revision:rev
    }));
    if(!state){
      // First connection: Supabase is the existing authoritative event calendar.
      // Do not change formulas/financials/attendance, only B:G and M.
      if(localHash!==remoteHash)escSyncWriteEvent_(sheet,row,event,remoteFields);
      saveState(remoteFields,revision);
      result.changed++;
      continue;
    }
    const localChanged=localHash!==state.hash;
    const remoteChanged=revision!==state.revision;
    if(localHash===remoteHash){
      saveState(remoteFields,revision);continue;
    }
    if(localChanged && remoteChanged){
      result.conflicts.push(event.event_code+' hem Sheets hem panelde değişmiş; eski değerler korunuyor');
      continue;
    }
    if(remoteChanged){
      escSyncWriteEvent_(sheet,row,event,remoteFields);
      saveState(remoteFields,revision);result.changed++;continue;
    }
    if(localChanged){
      try{
        const payload=escSyncLocalEvent_(event,localFields);
        const out=escSyncRequest_('push_event',{
          event_code:event.event_code,expected_revision:state.revision,data:payload
        });
        if(!out.ok){result.conflicts.push(event.event_code+': '+out.reason);continue;}
        saveState(localFields,Number(out.revision));
        result.changed++;
      }catch(error){
        result.conflicts.push(event.event_code+': '+String(error.message||error).slice(0,130));
      }
    }
  }
  return result;
}

function escSyncRemoteFields_(event){
  const start=new Date(event.start_at),end=new Date(event.end_at);
  const day=Utilities.formatDate(start,ESC_SYNC.zone,'dd.MM.yyyy');
  const time=Utilities.formatDate(start,ESC_SYNC.zone,'HH.mm')+'-'+
    Utilities.formatDate(end,ESC_SYNC.zone,'HH.mm');
  const status={planned:'Planlandı',completed:'Tamamlandı',cancelled:'İptal',draft:'Taslak'};
  return [day,time,event.kind==='online'?'Online':'Face to face',
    String(event.theme||'').trim(),String(event.venue||'').trim(),
    String(event.capacity||15),status[event.status]||'Taslak'];
}

function escSyncWriteEvent_(sheet,row,event,fields){
  const d=fields[0].match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if(!d)throw Error('Invalid date in live calendar: '+event.event_code);
  const dateValue=new Date(Date.UTC(Number(d[3]),Number(d[2])-1,Number(d[1]),0,0,0));
  sheet.getRange(row,2,1,6).setValues([[
    dateValue,fields[1],fields[2],fields[3],fields[4],Number(fields[5])
  ]]);
  sheet.getRange(row,2).setNumberFormat('dd.MM.yyyy');
  sheet.getRange(row,13).setValue(fields[6]);
}

function escSyncLocalEvent_(remote,fields){
  const day=fields[0].match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  const time=fields[1].match(/^(\d{1,2})[.:](\d{2})\s*[-–]\s*(\d{1,2})[.:](\d{2})$/);
  if(!day||!time)throw Error('Tarih dd.MM.yyyy ve saat 18.00-20.00 biçiminde olmalı.');
  const year=Number(day[3]),month=Number(day[2]),d=Number(day[1]);
  const valid=new Date(Date.UTC(year,month-1,d));
  if(valid.getUTCDate()!==d||valid.getUTCMonth()!==month-1)throw Error('Geçersiz gün');
  const h=Number(time[1]),min=Number(time[2]),h2=Number(time[3]),min2=Number(time[4]);
  if(h>23||h2>23||min>59||min2>59)throw Error('Geçersiz saat');
  // Türkiye currently uses permanent UTC+3; fixed offset is intentional here.
  const start=Date.UTC(year,month-1,d,h-3,min);
  let end=Date.UTC(year,month-1,d,h2-3,min2);
  if(end<=start)end+=86400000;
  const kind=fields[2]==='Online'?'online':
    fields[2]==='Face to face'?'in_person':null;
  if(!kind)throw Error('Tür sadece Online veya Face to face olabilir.');
  const state={'Planlandı':'planned','Tamamlandı':'completed','İptal':'cancelled','Taslak':'draft'};
  const status=state[fields[6]];
  if(!status)throw Error('Etkinlik durumu listeden seçilmeli.');
  const capacity=Number(fields[5]);
  if(!Number.isInteger(capacity)||capacity<1||capacity>500)throw Error('Kapasite 1–500 arası tam sayı olmalı.');
  return {title:remote.title,kind,start_at:new Date(start).toISOString(),
    end_at:new Date(end).toISOString(),venue:fields[4],
    theme:fields[3],status,capacity};
}

function escSyncMembers_(ss){
  const sheet=ss.getSheetByName('Kayıtlar');
  if(!sheet)throw Error('Kayıtlar sekmesi bulunamadı.');
  const rows=sheet.getRange(5,1,500,17).getDisplayValues(),out=new Map();
  rows.forEach(r=>{
    const id=String(r[0]||'').trim();
    if(!/^UYE-[0-9]{3,5}$/.test(id))return;
    const email=String(r[3]||'').trim().toLowerCase();
    const consent=String(r[15]||'').toLowerCase();
    out.set(id,{
      name:String(r[2]||'').trim(),
      email:/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)?email:null,
      consent:consent.startsWith('i agree that my shared contact information')||
         (consent.includes('kabul')&&consent.includes('iletişim')),
      eligible:!['ayrıldı','ayrildi'].includes(String(r[16]||'').trim().toLowerCase())
    });
  });
  return out;
}
function escSyncRoster_(ss,event,members){
  const num=Number(String(event.event_code||'').replace(/^ETK-/,'')),
    expected=event.kind==='online'?'Katılım Online':'Katılım Yüz Yüze';
  if(!Number.isInteger(num)||num<1||num>200)return [];
  const sh=ss.getSheetByName(expected);
  if(!sh)throw Error(expected+' sayfası bulunamadı.');
  const start=4+(num-1)*500;
  const rows=sh.getRange(start,2,500,6).getValues();
  const out=[];
  rows.forEach((r,i)=>{
    const listed=r[3]===true||String(r[3]).toUpperCase()==='TRUE';
    if(!listed)return;
    const code=String(r[0]||'').trim(),member=members.get(code)||{};
    if(!/^UYE-[0-9]{3,5}$/.test(code))return;
    out.push({
      member_code:code,full_name:member.name||String(r[1]||'').trim(),
      email:member.email||null,consent:member.consent===true,
      member_eligible:member.eligible!==false,
      attended:r[4]===true||String(r[4]).toUpperCase()==='TRUE',
      first_visit:String(r[5]||'').trim().toLocaleLowerCase('tr-TR')==='yeni',
      sheet_row:start+i
    });
  });
  return out;
}
function escSyncTemplates_(ss,prices,force){
  const sheet=ss.getSheetByName('E-posta Şablonları');
  if(!sheet)throw Error('E-posta Şablonları sayfası bulunamadı.');
  const rows=sheet.getRange(2,1,5,4).getValues();
  const translate={
    'ReminderFaceToFace':'reminder_in_person','ReminderOnline':'reminder_online',
    'Welcome':'welcome','Thanks':'thanks'
  };
  const out=[];
  for(const r of rows){
    const kind=translate[String(r[0]||'').trim()];
    if(!kind)continue;
    const value={
      kind,subject:String(r[1]||'').trim(),body:String(r[2]||'').trim(),
      enabled:String(r[3]||'').trim()==='AKTİF'
    };
    if(kind==='reminder_in_person'||kind==='reminder_online'){
      const p=kind==='reminder_online'?prices.online:prices.in_person;
      if(!p)throw Error('Canlı sitedeki fiyatlar alınamadı.');
      const values=kind==='reminder_online'
        ?[p.price,p.fourPack,p.twelvePack]
        :[p.single,p.oneMonth,p.threeMonth];
      if(values.some(x=>!Number.isFinite(Number(x))||Number(x)<0))
        throw Error('Canlı sitede geçerli paket fiyatı bulunamadı.');
      const keys=['{{tek_fiyat}}','{{dort_fiyat}}','{{oniki_fiyat}}'];
      keys.forEach((key,i)=>{
        const price=Number(values[i]).toLocaleString('tr-TR');
        value.body=value.body.split(key).join(price);
        value.subject=value.subject.split(key).join(price);
      });
    }
    out.push(value);
  }
  if(out.length!==4)throw Error('Dört mesaj şablonu bulunamadı; ReminderOnline ve ReminderFaceToFace satırlarını kontrol edin.');
  const signature=JSON.stringify(out);
  const props=PropertiesService.getScriptProperties();
  if(!force && signature===props.getProperty('ESC_SYNC_TEMPLATE_HASH'))return;
  const saved=escSyncRequest_('push_templates',{templates:out});
  if(!saved.ok)throw Error('Mesaj şablonları sunucuya kaydedilemedi.');
  props.setProperty('ESC_SYNC_TEMPLATE_HASH',signature);
}

function escSyncEnsureLegacyOff_(ss){
  const sh=ss.getSheetByName('E-posta Otomasyonu');
  if(!sh || sh.getRange('B2').getDisplayValue().trim()!=='KAPALI')
    throw Error('Eski E-posta Otomasyonu B2 anahtarı KAPALI olmalı; iki ayrı otomasyon aynı anda çalışamaz.');
}
function escSyncOwner_(){
  const user=String(Session.getEffectiveUser().getEmail()||'').toLowerCase();
  if(user!==ESC_SYNC.owner)
    throw Error('Senkronizasyon '+ESC_SYNC.owner+' hesabıyla kurulmalı. Şu anki kullanıcı: '+user);
}
function escSyncRequest_(action,payload){
  const token=PropertiesService.getScriptProperties().getProperty(ESC_SYNC.tokenKey);
  if(!token||!/^[A-Za-z0-9_-]{48,128}$/.test(token))
    throw Error('ESC_SHEETS_BRIDGE_TOKEN eksik.');
  const data=Object.assign({action},payload||{});
  const res=UrlFetchApp.fetch(ESC_SYNC.url,{
    method:'post',contentType:'application/json',
    headers:{Authorization:'Bearer '+token},
    payload:JSON.stringify(data),muteHttpExceptions:true,
    followRedirects:false
  });
  const status=res.getResponseCode();
  let parsed;
  try{parsed=JSON.parse(res.getContentText())}
  catch(err){throw Error('Sunucu JSON yerine hata döndürdü: HTTP '+status);}
  if(status!==200||parsed.ok!==true)
    throw Error('Senkronizasyon bağlantısı başarısız: HTTP '+status+' ('+(parsed.error||parsed.reason||'unknown')+')');
  return parsed.data||{};
}
