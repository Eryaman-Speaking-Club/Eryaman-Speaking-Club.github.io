(() => {
  'use strict';

  let clientPromise = null;

  function config() {
    return window.ESC_SUPABASE_CONFIG || {};
  }

  function isConfigured() {
    const cfg = config();
    return Boolean(cfg.url && cfg.anonKey);
  }

  async function getClient() {
    if (!isConfigured()) return null;
    if (!clientPromise) {
      clientPromise = import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
        .then(({ createClient }) => createClient(config().url, config().anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }));
    }
    return clientPromise;
  }

  async function ping() {
    const client = await getClient();
    if (!client) return { configured: false, database: false };
    const { data, error } = await client
      .from('games')
      .select('slug,name')
      .eq('enabled', true)
      .limit(1);
    if (error) return { configured: true, database: false, error };
    return { configured: true, database: true, sample: data || [] };
  }

  async function getSession() {
    const client = await getClient();
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session || null;
  }

  async function signUp(email, password) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const redirectTo = new URL('/esc-studio/', window.location.origin).href;
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo }
    });
    if (error) throw error;
    return data;
  }

  async function resendSignupConfirmation(email) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const redirectTo = new URL('/esc-studio/', window.location.origin).href;
    const { data, error } = await client.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: redirectTo }
    });
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
    const { data, error } = await client.rpc('claim_first_admin', { p_code: code });
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
    const { data, error } = await client
      .from('game_content')
      .select('id,game_slug,content_key,category,kind,payload,sort_order,is_active,updated_at')
      .eq('game_slug', gameSlug)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async function replaceGameContent(gameSlug, items) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { error } = await client.rpc('replace_game_content', {
      p_game_slug: gameSlug,
      p_items: items
    });
    if (error) throw error;
  }

  async function getGameSettings(gameSlug) {
    const client = await getClient();
    if (!client) return null;
    const { data, error } = await client
      .from('game_settings')
      .select('config,updated_at')
      .eq('game_slug', gameSlug)
      .maybeSingle();
    if (error) throw error;
    return data ? data.config : null;
  }

  async function saveGameSettings(gameSlug, settings) {
    const client = await getClient();
    if (!client) throw new Error('Supabase is not configured.');
    const { error } = await client
      .from('game_settings')
      .upsert({ game_slug: gameSlug, config: settings }, { onConflict: 'game_slug' });
    if (error) throw error;
  }

  window.ESCSupabase = {
    isConfigured,
    getClient,
    ping,
    getSession,
    signUp,
    resendSignupConfirmation,
    signIn,
    signOut,
    claimFirstAdmin,
    isAdmin,
    getGameContent,
    replaceGameContent,
    getGameSettings,
    saveGameSettings
  };
})();
