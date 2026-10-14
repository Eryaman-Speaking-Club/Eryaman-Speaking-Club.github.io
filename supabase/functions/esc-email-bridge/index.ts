// ESC secure email bridge. Only the approved Apps Script Gmail worker may use this.
// Auth: high-entropy token hashed in PostgreSQL; no privileged token in browser.
// This endpoint NEVER sends email. It only claims/acknowledges queue items.
import {createClient} from 'jsr:@supabase/supabase-js@2';

const reply=(status:number,payload:Record<string,unknown>)=>new Response(JSON.stringify(payload),{
  status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff'}
});
Deno.serve(async(req:Request)=>{
  if(req.method!=='POST')return reply(405,{error:'Method not allowed'});
  // Refuse browser-origin calls. This is server-to-server only.
  if(req.headers.get('origin'))return reply(403,{error:'Forbidden'});
  const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'').trim();
  if(!/^[A-Za-z0-9_-]{48,128}$/.test(token))return reply(401,{error:'Unauthorized'});
  if(Number(req.headers.get('content-length')||'0')>2048)return reply(413,{error:'Too large'});
  try{
    const body=await req.text();
    if(body.length>2048)return reply(413,{error:'Too large'});
    const input=JSON.parse(body||'{}') as Record<string,unknown>;
    const action=String(input.action||'');
    if(!['health','claim','ack'].includes(action))return reply(400,{error:'Invalid action'});
    const endpoint=Deno.env.get('SUPABASE_URL'),serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if(!endpoint||!serviceKey)return reply(503,{error:'Service unavailable'});
    const db=createClient(endpoint,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
    let result:{data:unknown,error:{message?:string,code?:string}|null};
    if(action==='health'){
      result=await db.rpc('esc_bridge_health',{p_token:token});
    }else if(action==='claim'){
      const count=Number(input.limit??20);
      if(!Number.isInteger(count)||count<1||count>35)return reply(400,{error:'Invalid limit'});
      result=await db.rpc('esc_claim_email_batch',{p_token:token,p_limit:count});
    }else{
      const notificationId=Number(input.id);
      if(!Number.isSafeInteger(notificationId)||notificationId<=0||typeof input.delivered!=='boolean')
        return reply(400,{error:'Invalid acknowledgment'});
      result=await db.rpc('esc_ack_email_delivery',{
        p_token:token,p_notification_id:notificationId,
        p_delivered:input.delivered===true,
        p_error_note:typeof input.error==='string'?input.error.slice(0,400):null
      });
    }
    if(result.error){
      if(/unauthorized/i.test(result.error.message||''))return reply(401,{error:'Unauthorized'});
      console.error('ESC bridge SQL error',result.error.code||'unknown');
      return reply(503,{error:'Bridge processing error'});
    }
    return reply(200,{ok:true,data:result.data});
  }catch(error){
    console.error('ESC bridge request error',String(error).slice(0,120));
    return reply(400,{error:'Invalid request'});
  }
});
