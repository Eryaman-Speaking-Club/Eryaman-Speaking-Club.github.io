// Server-only Google Apps Script <-> Supabase transport.
// This service DOES NOT send participant messages.
import {createClient} from 'jsr:@supabase/supabase-js@2';
const reply=(status:number,value:unknown)=>new Response(JSON.stringify(value),{
 status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}
});
Deno.serve(async (request:Request)=>{
 if(request.method!=='POST')return reply(405,{ok:false,error:'POST required'});
 if(request.headers.has('origin'))return reply(403,{ok:false,error:'Server-to-server only'});
 if(!String(request.headers.get('content-type')||'').includes('application/json'))
   return reply(415,{ok:false,error:'Expected JSON'});
 const token=String(request.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
 if(!/^[A-Za-z0-9_-]{48,128}$/.test(token))return reply(401,{ok:false,error:'Unauthorized'});
 if(Number(request.headers.get('content-length')||0)>180000)return reply(413,{ok:false,error:'Payload exceeds limit'});
 try{
  const raw=await request.text();
  if(raw.length>180000)return reply(413,{ok:false,error:'Payload exceeds limit'});
  const input=JSON.parse(raw) as Record<string,unknown>;
  const action=String(input.action||'');
  const actions=['pull_events','push_event','push_roster','push_templates','mail_approval'];
  if(!actions.includes(action))return reply(400,{ok:false,error:'Unknown operation'});
  const url=Deno.env.get('SUPABASE_URL'),secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!url||!secret)return reply(503,{ok:false,error:'Bridge unavailable'});
  const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  let result:{data:unknown,error:{message?:string;code?:string}|null};
  if(action==='pull_events'){
   result=await db.rpc('esc_sheets_pull_events',{p_token:token});
  }else if(action==='push_event'){
   const code=String(input.event_code||'');
   const version=Number(input.expected_revision);
   if(!/^ETK-[0-9]{3,5}$/.test(code)||!Number.isInteger(version)||version<1||
      !input.data||typeof input.data!=='object'||Array.isArray(input.data))
      return reply(400,{ok:false,error:'Invalid event update'});
   result=await db.rpc('esc_sheets_push_event',{
    p_token:token,p_code:code,p_revision:version,p_data:input.data
   });
  }else if(action==='push_roster'){
   const code=String(input.event_code||'');
   const kind=String(input.kind||'');
   if(!/^ETK-[0-9]{3,5}$/.test(code)||!['online','in_person'].includes(kind)||
       !Array.isArray(input.members)||input.members.length>500)
     return reply(400,{ok:false,error:'Invalid attendance snapshot'});
   result=await db.rpc('esc_sheets_push_roster',{
    p_token:token,p_code:code,p_kind:kind,p_members:input.members,
    p_confirm_empty:input.confirm_empty===true
   });
  }else if(action==='push_templates'){
   if(!Array.isArray(input.templates)||input.templates.length>6)
     return reply(400,{ok:false,error:'Invalid templates'});
   result=await db.rpc('esc_sheets_push_templates',{
    p_token:token,p_templates:input.templates
   });
  }else{
   if(typeof input.enabled!=='boolean')return reply(400,{ok:false,error:'Invalid switch'});
   result=await db.rpc('esc_sheets_set_mail_approval',{
    p_token:token,p_enabled:input.enabled
   });
  }
  if(result.error){
   if(/unauthorized/i.test(String(result.error.message||'')))
    return reply(401,{ok:false,error:'Unauthorized'});
   console.error('ESC Sheets RPC failure',String(result.error.code||'unknown'));
   return reply(422,{ok:false,error:'Unable to reconcile Sheets changes',reason:result.error.code||'unknown'});
  }
  return reply(200,{ok:true,data:result.data});
 }catch(error){
  console.error('ESC Sheets bridge request error',String(error).slice(0,140));
  return reply(400,{ok:false,error:'Unable to process request'});
 }
});
