(() => {
  'use strict';

  let clientPromise = null;

  function config() { return window.ESC_SUPABASE_CONFIG || {}; }
  function isConfigured() {
    const cfg = config();
    return Boolean(cfg.url && cfg.anonKey);
  }

  async function getClient() {
    if (!isConfigured()) return null;
    if (!clientPromise) {
      clientPromise = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
        .then(({ createClient }) => createClient(config().url, config().anonKey, {
          auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true }
        }));
    }
    return clientPromise;
  }

  async function ping() {
    const client = await getClient();
    if (!client) return { configured:false, database:false };
    const { data, error } = await client.from('games').select('slug,name').eq('enabled', true).limit(1);
    if (error) return { configured:true, database:false, error };
    return { configured:true, database:true, sample:data || [] };
  }

  async function getSession() {
    const client = await getClient();
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session || null;
  }

  async function signUp(email, password, redirectPath = '/esc-studio/') {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const redirectTo = new URL(redirectPath, window.location.origin).href;
    const { data, error } = await client.auth.signUp({ email, password, options:{ emailRedirectTo:redirectTo } });
    if (error) throw error;
    return data;
  }

  async function resendSignupConfirmation(email, redirectPath = '/esc-studio/') {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const redirectTo = new URL(redirectPath, window.location.origin).href;
    const { data, error } = await client.auth.resend({ type:'signup', email, options:{ emailRedirectTo:redirectTo } });
    if (error) throw error;
    return data;
  }

  async function sendPasswordReset(email, redirectPath = '/esc-studio/') {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const redirectTo = new URL(redirectPath, window.location.origin).href;
    const { data, error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
    return data;
  }

  async function updatePassword(password) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.auth.updateUser({ password });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const client = await getClient();
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw error;
  }

  async function claimFirstAdmin(code) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.rpc('claim_first_admin', { p_code:code });
    if (error) throw error;
    return data === true;
  }

  async function isAdmin() {
    const client = await getClient();
    if (!client) return false;
    const { data, error } = await client.rpc('is_esc_admin');
    if (error) throw error;
    return data === true;
  }

  async function getGameContent(gameSlug) {
    const client = await getClient();
    if (!client) return null;
    const { data, error } = await client.from('game_content')
      .select('id,game_slug,content_key,category,kind,payload,sort_order,is_active,updated_at')
      .eq('game_slug', gameSlug).eq('is_active', true)
      .order('sort_order', { ascending:true }).order('id', { ascending:true });
    if (error) throw error;
    return data || [];
  }

  async function replaceGameContent(gameSlug, items) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { error } = await client.rpc('replace_game_content', { p_game_slug:gameSlug, p_items:items });
    if (error) throw error;
  }

  async function getGameSettings(gameSlug) {
    const client = await getClient();
    if (!client) return null;
    const { data, error } = await client.from('game_settings').select('config,updated_at')
      .eq('game_slug', gameSlug).maybeSingle();
    if (error) throw error;
    return data ? data.config : null;
  }

  async function saveGameSettings(gameSlug, settings) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { error } = await client.from('game_settings')
      .upsert({ game_slug:gameSlug, config:settings }, { onConflict:'game_slug' });
    if (error) throw error;
  }

  async function ensureEducatorProfile(displayName) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const clean = String(displayName || session.user.email?.split('@')[0] || 'Teacher').trim().slice(0,80);
    const { data, error } = await client.from('educator_profiles')
      .upsert({ user_id:session.user.id, display_name:clean || 'Teacher' }, { onConflict:'user_id' })
      .select('user_id,display_name,role,plan').single();
    if (error) throw error;
    return data;
  }

  async function getEducatorProfile() {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) return null;
    const { data, error } = await client.from('educator_profiles')
      .select('user_id,display_name,role,plan').eq('user_id',session.user.id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function listEducatorClasses() {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const { data:classes, error } = await client.from('edu_classes')
      .select('id,name,age_group,level,focus,join_code,max_students,is_active,created_at,updated_at')
      .eq('teacher_id',session.user.id).order('created_at',{ ascending:false });
    if (error) throw error;
    if (!classes?.length) return [];
    const ids = classes.map(c => c.id);
    const { data:students, error:studentError } = await client.from('edu_students')
      .select('id,class_id,display_name,last_seen_at,is_active').in('class_id', ids).eq('is_active', true);
    if (studentError) throw studentError;
    const grouped = new Map();
    (students || []).forEach(s => {
      if (!grouped.has(s.class_id)) grouped.set(s.class_id, []);
      grouped.get(s.class_id).push(s);
    });
    return classes.map(c => ({ ...c, students:grouped.get(c.id) || [] }));
  }

  async function createEducatorClass(payload) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const row = {
      teacher_id:session.user.id,
      name:String(payload.name || '').trim(),
      age_group:payload.age_group,
      level:payload.level,
      focus:payload.focus || 'speaking',
      max_students:Number(payload.max_students || 40)
    };
    const { data, error } = await client.from('edu_classes').insert(row)
      .select('id,name,age_group,level,focus,join_code,max_students,is_active,created_at').single();
    if (error) throw error;
    return data;
  }

  async function saveEducatorLesson(payload) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const row = { ...payload, teacher_id:session.user.id };
    const { data, error } = await client.from('edu_lessons').insert(row).select('*').single();
    if (error) throw error;
    return data;
  }

  async function startEducatorSession(payload) {
    const client = await getClient();
    const session = await getSession();
    if (!client || !session) throw new Error('Teacher login required.');
    const { data, error } = await client.from('edu_live_sessions')
      .insert({ ...payload, teacher_id:session.user.id }).select('*').single();
    if (error) throw error;
    return data;
  }

  async function updateEducatorSession(sessionId, patch) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.from('edu_live_sessions')
      .update(patch).eq('id',sessionId).select('*').single();
    if (error) throw error;
    return data;
  }

  async function getActiveEducatorSession(classId) {
    const client = await getClient();
    if (!client) return null;
    const { data, error } = await client.from('edu_live_sessions').select('*')
      .eq('class_id',classId).in('status',['waiting','active','paused'])
      .order('started_at',{ascending:false}).limit(1).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function joinEducatorClass(joinCode, displayName, joinToken) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.rpc('edu_join_class', {
      p_join_code:joinCode, p_display_name:displayName, p_join_token:joinToken
    });
    if (error) throw error;
    return data;
  }

  async function getStudentState(joinToken) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.rpc('edu_student_state', { p_join_token:joinToken });
    if (error) throw error;
    return data;
  }

  async function submitStudentResult(joinToken, sessionId, activityType, score, payload = {}) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { data, error } = await client.rpc('edu_submit_result', {
      p_join_token:joinToken,
      p_session_id:sessionId || null,
      p_activity_type:activityType,
      p_score:score,
      p_payload:payload
    });
    if (error) throw error;
    return data === true;
  }

  window.ESCSupabase = {
    isConfigured,getClient,ping,getSession,signUp,resendSignupConfirmation,sendPasswordReset,
    updatePassword,signIn,signOut,claimFirstAdmin,isAdmin,getGameContent,replaceGameContent,
    getGameSettings,saveGameSettings,ensureEducatorProfile,getEducatorProfile,listEducatorClasses,
    createEducatorClass,saveEducatorLesson,startEducatorSession,updateEducatorSession,
    getActiveEducatorSession,joinEducatorClass,getStudentState,submitStudentResult
  };
})();

;(() => {
  try {
    const path = location.pathname || '/';
    if (path.startsWith('/admin/') || path.startsWith('/esc-studio/')) return;
    if (document.querySelector('script[data-esc-cms-runtime]')) return;
    const script = document.createElement('script');
    script.src = '/esc-cms-runtime.js?v=20260923-1';
    script.async = true;
    script.dataset.escCmsRuntime = 'true';
    document.head.appendChild(script);
  } catch (_) {}
})();
