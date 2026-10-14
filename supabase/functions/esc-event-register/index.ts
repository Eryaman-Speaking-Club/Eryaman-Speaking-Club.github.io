// ESC public event registration. Deliberately does not send emails.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ALLOWED = new Set([
  'https://eryamanspeakingclub.com',
  'https://www.eryamanspeakingclub.com',
]);
const json = (status: number, payload: Record<string, unknown>, origin: string | null = null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Vary': 'Origin',
  };
  if (origin && ALLOWED.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, apikey, x-client-info';
  }
  return new Response(JSON.stringify(payload), {status, headers});
};
const clean = (x: unknown) => typeof x === 'string' ? x.trim() : '';
const ipFingerprint = async (ip: string, agent: string, salt: string) => {
  const bytes = new TextEncoder().encode([ip, agent, salt].join('|'));
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
  return [...digest].map(x=>x.toString(16).padStart(2,'0')).join('');
};
Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS')
    return ALLOWED.has(origin||'') ? json(200,{},origin) : json(403,{error:'Forbidden'});
  if (req.method !== 'POST') return json(405,{error:'Method not allowed'},origin);
  if (!origin || !ALLOWED.has(origin)) return json(403,{error:'Forbidden'});
  const contentLength=Number(req.headers.get('content-length')||0);
  if (contentLength>4096) return json(413,{error:'Payload too large'},origin);
  if (!String(req.headers.get('content-type')||'').toLowerCase().includes('application/json'))
    return json(415,{error:'JSON required'},origin);
  try {
    const raw=await req.text();
    if(raw.length>4096) return json(413,{error:'Payload too large'},origin);
    const body=JSON.parse(raw) as Record<string, unknown>;
    if (clean(body.website)) return json(200,{ok:true},origin); // honeypot
    const eventId=clean(body.eventId);
    const name=clean(body.fullName).replace(/\s+/g,' ');
    const email=clean(body.email).toLowerCase();
    const consent=body.consent===true;
    if (!/^[0-9a-f-]{36}$/i.test(eventId) || name.length<2 || name.length>100 ||
        email.length<5 || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !consent)
      return json(400,{error:'Lütfen ad, geçerli e-posta ve iletişim iznini kontrol edin.'},origin);
    const supabaseUrl=Deno.env.get('SUPABASE_URL');
    const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if(!supabaseUrl||!secret) {
      console.error('ESC signup: missing internal Supabase credentials');
      return json(503,{error:'Kayıt hizmeti geçici olarak kullanılamıyor.'},origin);
    }
    // The hashed fingerprint is ephemeral, never contains raw IP in the DB.
    const ip=clean(req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')||'0.0.0.0').split(',')[0];
    const agent=clean(req.headers.get('user-agent')).slice(0,255);
    const fingerprint=await ipFingerprint(ip,agent,secret.slice(-32));
    const db=createClient(supabaseUrl,secret,{auth:{persistSession:false,autoRefreshToken:false}});
    const {data,error}=await db.rpc('esc_register_for_event',{
      p_event_id:eventId,p_full_name:name,p_email:email,
      p_consent:consent,p_fingerprint:fingerprint
    });
    if(error){
      const msg=String(error.message||'');
      if(/capacity full/i.test(msg))return json(409,{error:'Bu etkinliğin kontenjanı doldu.'},origin);
      if(/not open/i.test(msg))return json(409,{error:'Bu etkinlik artık kayıt kabul etmiyor.'},origin);
      if(/signup limit/i.test(msg))return json(429,{error:'Çok fazla kayıt denemesi. Daha sonra yeniden deneyin.'},origin);
      console.error('ESC signup error',error.code||'unknown');
      return json(400,{error:'Kayıt gerçekleştirilemedi. Lütfen daha sonra tekrar deneyin.'},origin);
    }
    return json(200,{ok:!!data?.ok,message:'Etkinlik kaydınız alındı. Buluşma bilgilerini etkinlik sayfasından takip edebilirsiniz.'},origin);
  }catch(e){
    console.error('ESC signup request error',String(e).slice(0,160));
    return json(400,{error:'Geçersiz kayıt isteği.'},origin);
  }
});
