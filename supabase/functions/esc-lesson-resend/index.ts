import { createClient } from 'jsr:@supabase/supabase-js@2';

// Server-to-server only. No browser, ChatGPT, Gmail API or Apps Script connection.
// Triggered by Supabase Cron using a random bearer stored in Supabase Vault.
// Credentials for Resend must be set through Supabase Edge Function Secrets.

const project = Deno.env.get('SUPABASE_URL') || '';
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const db = project && serviceKey
  ? createClient(project, serviceKey, {auth:{persistSession:false,autoRefreshToken:false}})
  : null;

const response = (status:number, body:Record<string,unknown>) =>
  new Response(JSON.stringify(body),{
    status,
    headers:{'content-type':'application/json; charset=utf-8',
      'cache-control':'private, no-store','x-content-type-options':'nosniff'}
  });

function acceptableSender(from:string):boolean {
  // Accept the club's validated domain or one of its mail subdomains.
  const match = from.match(/<([^<>@\s]+@([^<>@\s]+))>\s*$/) ||
    from.match(/^([^<>@\s]+@([^<>@\s]+))$/);
  return Boolean(match && (match[2].toLowerCase()==='eryamanspeakingclub.com' ||
    match[2].toLowerCase().endsWith('.eryamanspeakingclub.com')));
}
async function rpc(name:string, args:Record<string,unknown>) {
  if(!db)throw Error('Supabase backend is not configured');
  const {data,error}=await db.rpc(name,args);
  if(error)throw Error(name+' failed (code '+(error.code||'unknown')+')');
  return data;
}
function safeProviderError(value:unknown){
  // Avoid persisting personal message contents or credentials from responses.
  const raw = value && typeof value==='object' ?
     String((value as Record<string,unknown>).name||
       (value as Record<string,unknown>).message||'API rejected request'):
     'API rejected request';
  return raw.replace(/re_[A-Za-z0-9]+/g,'[redacted]').slice(0,180);
}
async function acknowledge(token:string,queue:string,id:number,accepted:boolean,
 providerId:string|null,httpStatus:number|null,errorText:string|null) {
  return Boolean(await rpc('esc_resend_dispatch_ack',{
    p_token:token,p_queue:queue,p_id:id,p_accepted:accepted,
    p_provider_id:providerId,p_http_status:httpStatus,p_error:errorText
  }));
}

Deno.serve(async (req:Request) => {
  if(req.method!=='POST')return response(405,{ok:false,error:'Method not allowed'});
  // The long random token is created by SQL and never stored in GitHub.
  const dispatchToken=req.headers.get('x-esc-cron-token')||'';
  if(!db||dispatchToken.length!==80)
    return response(401,{ok:false,error:'Unauthorized'});
  try {
    const authorized=await rpc('esc_resend_dispatch_authorized',{p_token:dispatchToken});
    if(authorized!==true)return response(403,{ok:false,error:'Unauthorized'});
  }catch{
    return response(403,{ok:false,error:'Unauthorized'});
  }
  const apiKey = Deno.env.get('ESC_RESEND_API_KEY') || '';
  const from = Deno.env.get('ESC_RESEND_FROM') || '';
  const activated = Deno.env.get('ESC_RESEND_ENABLED') === 'true';
  const ready=activated && apiKey.startsWith('re_') && acceptableSender(from);
  try{
    await rpc('esc_resend_dispatch_heartbeat',{
      p_token:dispatchToken,p_ready:ready,
      p_problem:ready ? null : 'Sender requires verified domain, API key and activation'
    });
  }catch(error){
    console.error('ESC mail health database error',String(error).slice(0,100));
    return response(503,{ok:false,error:'Mail status unavailable'});
  }
  if(!ready)return response(200,{ok:true,provider:'resend',state:'awaiting-domain-and-api-key',claimed:0,accepted:0});

  let items:unknown[]=[];
  try{
    const claimed=await rpc('esc_resend_dispatch_claim',{p_token:dispatchToken,p_limit:10});
    items=Array.isArray(claimed?.items)?claimed.items:[];
  }catch(error){
    console.error('ESC mail claim error',String(error).slice(0,100));
    return response(503,{ok:false,error:'Email queue unavailable'});
  }
  let accepted=0,manualReview=0;
  for(const obj of items){
    if(!obj||typeof obj!=='object')continue;
    const row=obj as Record<string,unknown>;
    const queue=String(row.queue||'');
    const id=Number(row.id);
    if(!['lesson','alternative'].includes(queue)||!Number.isSafeInteger(id)||id<1)continue;
    const recipient=String(row.recipient||'').trim();
    const subject=String(row.subject||'').slice(0,160);
    const body=String(row.body||'').replace(/\\n/g,'\n').slice(0,15000);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)||!subject||!body){
      await acknowledge(dispatchToken,queue,id,false,null,null,'Invalid recipient or empty message').catch(()=>null);
      manualReview++;
      continue;
    }
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),9000);
    let sendResponse:Response;
    try{
      sendResponse=await fetch('https://api.resend.com/emails',{
        method:'POST',signal:controller.signal,
        headers:{'Authorization':'Bearer '+apiKey,'Content-Type':'application/json',
          'Idempotency-Key':'esc-'+queue+'-'+id},
        body:JSON.stringify({
          from,to:[recipient],subject,text:body,reply_to:'eryamanspeakingclub@gmail.com'
        })
      });
    }catch(error){
      // Delivery is unknown after network failure: do NOT automatically retry.
      const explanation=error instanceof Error?error.name:'Network error';
      await acknowledge(dispatchToken,queue,id,false,null,null,'Uncertain provider response: '+explanation).catch(()=>null);
      manualReview++;
      clearTimeout(timeout);
      continue;
    }finally{clearTimeout(timeout);}
    let payload:Record<string,unknown>={};
    try { payload=await sendResponse.json() as Record<string,unknown>; }
    catch{ /* invalid provider response; cannot safely assume acceptance */ }
    const providerId=typeof payload.id==='string'?payload.id:null;
    if(sendResponse.ok && providerId){
      try{
        const didAck=await acknowledge(dispatchToken,queue,id,true,providerId,sendResponse.status,null);
        if(didAck)accepted++; else manualReview++;
      }catch{
        // Resend may already have accepted this email: leave the claim as
        // 'sending' for later 'uncertain' human review, never resend blindly.
        manualReview++;
      }
    }else{
      const reason=sendResponse.ok?'Provider accepted without an email ID':safeProviderError(payload);
      await acknowledge(dispatchToken,queue,id,false,null,sendResponse.status,reason).catch(()=>null);
      manualReview++;
    }
  }
  return response(200,{ok:true,provider:'resend',claimed:items.length,accepted,manual_review:manualReview});
});
