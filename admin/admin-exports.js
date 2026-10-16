/* Eryaman Speaking Club: direct Supabase -> .xlsx, never Google Sheets. */
(() => {
'use strict';
const A=window.ESCAdmin, {$,esc,toast}=A;
const PAGE=500,MAX=50000;
const labels={in_person:'Yüz yüze',online:'Online',draft:'Taslak',planned:'Planlandı',
cancelled:'İptal',completed:'Tamamlandı',registered:'Kayıtlı',attended:'Katıldı',
no_show:'Gelmedi',website:'Web sitesi',admin:'Yönetici',legacy:'Eski kayıt'};
const trDate=x=>{
 if(!x)return '';
 const d=new Date(x);
 return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('tr-TR',{
  timeZone:'Europe/Istanbul',day:'2-digit',month:'2-digit',year:'numeric',
  hour:'2-digit',minute:'2-digit',hour12:false
 }).format(d):'';
};
const safe=x=>{
 let s=String(x??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g,'').slice(0,32767);
 return /^\s*[=+@-]/.test(s)?"'"+s.slice(0,32766):s;
};
const xml=x=>safe(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[ch]));
const yes=x=>x===true?'Evet':'Hayır';
const columns={
 events:'id,event_code,title,kind,start_at,end_at,venue,theme,status,published,registration_enabled,capacity,revision,updated_at',
 regs:'id,event_id,full_name,email,status,consent,first_visit,source,created_at',
 rules:'id,slug,title,weekday,start_time,duration_minutes,kind,venue,capacity,active,published,horizon_days'
};
async function fetchAll(table,selection){
 const items=[];
 for(let from=0;from<MAX;from+=PAGE){
  const result=await A.state.db.from(table).select(selection).order('id',{ascending:true})
    .range(from,Math.min(MAX-1,from+PAGE-1));
  if(result.error)throw new Error(table+': '+result.error.message);
  const batch=Array.isArray(result.data)?result.data:[];
  items.push(...batch);
  if(batch.length<PAGE)return items;
  if(items.length>=MAX)throw new Error('50.000 satır sınırı aşıldı. Eksik rapor oluşturulmadı.');
 }
 return items;
}
async function loadAll(mode){
 // Download only data necessary for the selected report.
 const needEvents=mode!=='pricing';
 const needRegs=mode==='events'||mode==='registrations'||mode==='all';
 const needRules=mode==='all';
 const needPrices=mode==='all'||mode==='pricing';
 const [events,registrations,rules,p]=await Promise.all([
  needEvents?fetchAll('esc_events',columns.events):[],
  needRegs?fetchAll('esc_event_registrations',columns.regs):[],
  needRules?fetchAll('esc_event_rules',columns.rules):[],
  needPrices?A.state.db.from('esc_cms_settings')
    .select('published_data').eq('key','event_config').maybeSingle():{data:null,error:null}
 ]);
 if(p.error)throw new Error('Fiyatlar okunamadı: '+p.error.message);
 events.sort((a,b)=>String(a.start_at).localeCompare(String(b.start_at))||String(a.event_code).localeCompare(String(b.event_code)));
 registrations.sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at)));
 return {events,registrations,rules,pricing:p.data?.published_data||{}};
}
function sheets(data,mode){
 const {events,registrations,rules,pricing}=data;
 const byId=new Map(events.map(e=>[e.id,e]));
 const counts=new Map();
 for(const r of registrations){
  if(!counts.has(r.event_id))counts.set(r.event_id,{registered:0,attended:0,no_show:0,cancelled:0});
  const c=counts.get(r.event_id);
  if(Object.prototype.hasOwnProperty.call(c,r.status))c[r.status]++;
 }
 const tab=(name,headers,rows)=>({name,headers,rows});
 const es=tab('Etkinlikler',
 ['Etkinlik No','Başlık','Tür','Başlangıç (TR)','Bitiş (TR)','Mekân','Tema',
  'Durum','Web Sitesinde','Kayıt Açık','Kontenjan','Kayıtlı','Katıldı','Gelmedi',
  'İptal Kayıt','Son Güncelleme','Sürüm'],
 events.map(e=>{
  const c=counts.get(e.id)||{registered:0,attended:0,no_show:0,cancelled:0};
  return [e.event_code,e.title,labels[e.kind]||e.kind,trDate(e.start_at),trDate(e.end_at),
   e.venue,e.theme||'',labels[e.status]||e.status,yes(e.published),yes(e.registration_enabled),
   Number(e.capacity||0),c.registered,c.attended,c.no_show,c.cancelled,trDate(e.updated_at),Number(e.revision||1)];
 }));
 const ms=tab('Katılımcılar',
  ['Etkinlik No','Etkinlik Tarihi (TR)','Ad Soyad','E-posta','Katılım Durumu',
   'İletişim İzni','İlk Katılım','Kayıt Kaynağı','Kayıt Tarihi (TR)'],
  registrations.map(r=>{
   const e=byId.get(r.event_id);
   return [e?.event_code||'Etkinlik bulunamadı',trDate(e?.start_at),r.full_name,r.email,
    labels[r.status]||r.status,yes(r.consent),yes(r.first_visit),
    labels[r.source]||r.source,trDate(r.created_at)];
  })
 );
 const weekdays=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
 const rs=tab('Haftalık Program',
 ['Program Kodu','Başlık','Gün','Saat','Süre (dk)','Tür','Mekân',
  'Kontenjan','Otomatik Oluştur','Yayınla','İleri Planlama (gün)'],
 rules.map(r=>[r.slug,r.title,weekdays[r.weekday]||String(r.weekday),r.start_time,
  Number(r.duration_minutes||0),labels[r.kind]||r.kind,r.venue,Number(r.capacity||0),
  yes(r.active),yes(r.published),Number(r.horizon_days||0)])
 );
 const p=pricing.pricing||{},o=pricing.online||{};
 const ps=tab('Paket Fiyatları',['Tür','Paket','Fiyat (TL)','Kaynak'],[
 ['Yüz yüze','Tek buluşma',Number(p.single||0),'Yayınlanmış fiyat'],
 ['Yüz yüze','4 buluşma',Number(p.oneMonth||0),'Yayınlanmış fiyat'],
 ['Yüz yüze','12 buluşma',Number(p.threeMonth||0),'Yayınlanmış fiyat'],
 ['Online','Tek buluşma',Number(o.price||0),'Yayınlanmış fiyat'],
 ['Online','4 buluşma',Number(o.fourPack||0),'Yayınlanmış fiyat'],
 ['Online','12 buluşma',Number(o.twelvePack||0),'Yayınlanmış fiyat']]);
 const info=tab('Rapor Hakkında',['Bilgi','Açıklama'],[
 ['Kaynak','Eryaman Speaking Club / Supabase'],
 ['Oluşturulma tarihi',trDate(new Date())],
 ['Etkinlik sayısı',events.length],
 ['Katılımcı kayıt sayısı',registrations.length],
 ['Önemli','Bu rapor salt okunurdur. Excel dosyasındaki değişiklikler web sitesine yansımaz.'],
 ['Gizlilik','Katılımcı e-posta adreslerini yalnızca yetkili kişilerle paylaşın.'],
 ['Finans','Gerçek ödeme ve tahsilatlar burada bulunmaz. Yalnızca yayınlanmış fiyatlar aktarılır.'],
 ['Otomasyon','Etkinlik otomasyonu Supabase üzerinde; eski Google Sheets farklıdır.']]);
 if(mode==='events')return[es,info];
 if(mode==='registrations')return[ms,info];
 if(mode==='pricing')return[ps,info];
 return[es,ms,rs,ps,info];
}
// ZIP STORE: no CDN or external XLSX library. The file is generated locally.
const enc=s=>new TextEncoder().encode(s);
const u16=(a,p,n)=>{a[p]=n&255;a[p+1]=(n>>>8)&255};
const u32=(a,p,n)=>{a[p]=n&255;a[p+1]=(n>>>8)&255;a[p+2]=(n>>>16)&255;a[p+3]=(n>>>24)&255};
const crcTable=(()=>{
 const t=new Uint32Array(256);
 for(let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++)c=(c&1)?0xEDB88320^(c>>>1):c>>>1;t[i]=c>>>0}return t;
})();
const crc32=a=>{let x=0xFFFFFFFF;for(let i=0;i<a.length;i++)x=crcTable[(x^a[i])&255]^(x>>>8);return(x^0xFFFFFFFF)>>>0};
const col=n=>{let s='';for(let k=n+1;k>0;k=Math.floor((k-1)/26))s=String.fromCharCode(65+(k-1)%26)+s;return s};
function zip(entries){
 const parts=[],cd=[];let offset=0;
 const time=new Date();
 const dosDate=((time.getFullYear()-1980)<<9)|((time.getMonth()+1)<<5)|time.getDate();
 const dosTime=(time.getHours()<<11)|(time.getMinutes()<<5)|Math.floor(time.getSeconds()/2);
 for(const [filename,xmlData]of entries){
  const name=enc(filename),data=enc(xmlData),checksum=crc32(data),header=new Uint8Array(30);
  u32(header,0,0x04034b50);u16(header,4,20);u16(header,10,dosTime);u16(header,12,dosDate);
  u32(header,14,checksum);u32(header,18,data.length);u32(header,22,data.length);u16(header,26,name.length);
  parts.push(header,name,data);
  const center=new Uint8Array(46);
  u32(center,0,0x02014b50);u16(center,4,20);u16(center,6,20);u16(center,12,dosTime);u16(center,14,dosDate);
  u32(center,16,checksum);u32(center,20,data.length);u32(center,24,data.length);u16(center,28,name.length);u32(center,42,offset);
  cd.push(center,name);offset+=header.length+name.length+data.length;
 }
 const directorySize=cd.reduce((sum,v)=>sum+v.length,0);
 const end=new Uint8Array(22);u32(end,0,0x06054b50);u16(end,8,entries.length);
 u16(end,10,entries.length);u32(end,12,directorySize);u32(end,16,offset);
 return new Blob([...parts,...cd,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
const STYLES=[
 '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
 '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
 '<fonts count="2"><font><sz val="11"/><name val="Aptos"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Aptos"/></font></fonts>',
 '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF164875"/><bgColor indexed="64"/></patternFill></fill></fills>',
 '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>',
 '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>',
 '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFill="1" applyFont="1"/></cellXfs>',
 '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>',
 '</styleSheet>'
].join('');
function sheetXml(table){
 const rows=[table.headers,...table.rows];
 const widths=table.headers.map((name,c)=>{
  const len=rows.slice(0,Math.min(140,rows.length)).map(r=>String(r[c]??'').length);
  return Math.max(12,Math.min(46,Math.max(...len,10)+3));
 });
 const rowXml=rows.map((row,i)=>'<row r="'+(i+1)+'">'+row.map((v,k)=>{
  const ref=col(k)+(i+1),style=i?'':' s="1"';
  if(i&&typeof v==='number'&&Number.isFinite(v))return'<c r="'+ref+'"'+style+'><v>'+v+'</v></c>';
  return'<c r="'+ref+'" t="inlineStr"'+style+'><is><t xml:space="preserve">'+xml(v)+'</t></is></c>';
 }).join('')+'</row>').join('');
 const end=col(table.headers.length-1)+rows.length;
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
  '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
  '<dimension ref="A1:'+end+'"/><sheetViews><sheetView workbookViewId="0" showGridLines="0">'+
  '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'+
  '<sheetFormatPr defaultRowHeight="18"/><cols>'+
  widths.map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>').join('')+
  '</cols><sheetData>'+rowXml+'</sheetData>'+
  (table.rows.length?'<autoFilter ref="A1:'+end+'"/>':'')+'</worksheet>';
}
function makeXlsx(tables){
 const base='http://schemas.openxmlformats.org/spreadsheetml/2006/main';
 const files=[
 ['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'+
  '<Default Extension="xml" ContentType="application/xml"/>'+
  '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+
  '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+
  tables.map((_,i)=>'<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('')+'</Types>'],
 ['_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
 ['xl/workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="'+base+'" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+tables.map((s,i)=>'<sheet name="'+xml(s.name)+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>').join('')+'</sheets></workbook>'],
 ['xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
  tables.map((_,i)=>'<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>').join('')+
  '<Relationship Id="rId'+(tables.length+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
 ['xl/styles.xml',STYLES]
 ];
 tables.forEach((s,i)=>files.push(['xl/worksheets/sheet'+(i+1)+'.xml',sheetXml(s)]));
 return zip(files);
}
function download(blob,mode){
 const date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Istanbul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='Eryaman_Speaking_Club_'+mode+'_'+date+'.xlsx';
 a.style.display='none';document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),30000);
}
let busy=false;
async function exportWorkbook(mode){
 if(busy||!A.canEdit())return;
 if(['registrations','all'].includes(mode)&&!confirm(
  'Bu Excel katılımcıların adlarını ve e-posta adreslerini içerecek. Dosyayı yalnızca yetkili kişilerle paylaşacağını onaylıyor musun?'))return;
 busy=true;
 const buttons=[...$('#panel').querySelectorAll('[data-esc-export]')],status=$('#escExportStatus');
 buttons.forEach(b=>b.disabled=true);
 status.textContent='Supabase kayıtları okunuyor; Excel hazırlanıyor…';
 try{
  const data=await loadAll(mode),selected=sheets(data,mode);
  download(makeXlsx(selected),mode);
  status.textContent=selected.length+' sayfalı Excel indirildi. '+data.events.length+
   ' etkinlik, '+data.registrations.length+' katılımcı kaydı.';
  toast('Excel raporu oluşturuldu.');
 }catch(err){
  status.textContent='Excel oluşturulamadı: '+(err.message||String(err));
  console.error('ESC report export',err);
 }finally{buttons.forEach(b=>b.disabled=false);busy=false}
}
function view(){
 if(!A.canEdit()){
  $('#panel').innerHTML='<div class="notice warning">Excel raporlarını yalnızca yetkili yöneticiler indirebilir.</div>';
  return;
 }
 $('#panel').innerHTML=
  '<div class="notice"><strong>Ana veri kaynağı: Supabase.</strong> Excel yalnızca indirilen bir rapordur. Dosyadaki değişiklikler web sitesini veya Google Sheets kayıtlarını değiştirmez.</div>'+
  '<div class="card"><div class="card-head"><div><h2>Excel Raporları (.xlsx)</h2><p class="muted">Excel 2024 ile uyumlu. Güncel etkinlik, katılımcı, haftalık program ve yayınlanan fiyat verileri.</p></div></div>'+
  '<div class="grid-3">'+
  '<div class="mini-card"><h3>Tüm kayıtlar</h3><p>Etkinlikler, katılımcılar, programlar, fiyatlar.</p><button type="button" class="btn primary" data-esc-export="all">Tam Raporu İndir</button></div>'+
  '<div class="mini-card"><h3>Etkinlikler</h3><p>Güncel tarih, mekân, kontenjan ve katılım sayıları.</p><button type="button" class="btn secondary" data-esc-export="events">Etkinlikler Excel</button></div>'+
  '<div class="mini-card"><h3>Katılımcılar</h3><p>İsim, e-posta ve katılım durumu. Gizli bilgi içerir.</p><button type="button" class="btn secondary" data-esc-export="registrations">Katılımcılar Excel</button></div>'+
  '<div class="mini-card"><h3>Paket fiyatları</h3><p>Sitede yayınlanmış yüz yüze ve online paket fiyatları.</p><button type="button" class="btn secondary" data-esc-export="pricing">Fiyatlar Excel</button></div>'+
  '</div><p id="escExportStatus" role="status" aria-live="polite" class="muted"></p></div>'+
  '<div class="notice warning" style="margin-top:16px"><strong>Ödeme raporu henüz yok.</strong> Yeni sistemde tahsilat kayıtları tutulmuyor; eski Google Sheets ödeme verilerini silme.</div>';
 $('#panel').querySelectorAll('[data-esc-export]').forEach(b=>b.onclick=()=>exportWorkbook(b.dataset.escExport));
}
A.register('exports',view);
})();
