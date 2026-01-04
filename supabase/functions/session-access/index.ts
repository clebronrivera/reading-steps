import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SessionAccessRequest {
  action: 'validate' | 'get_session_data';
  token: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, token }: SessionAccessRequest = await req.json();
    console.log(`Session access request: action=${action}`);

    if (!token) {
      console.error('No token provided');
      return new Response(
        JSON.stringify({ error: 'Token required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate token and get session ID
    const { data: sessionId, error: tokenError } = await supabase
      .rpc('validate_assessor_token', { token_value: token });

    if (tokenError || !sessionId) {
      console.error('Token validation failed:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Token validated for session: ${sessionId}`);

    if (action === 'validate') {
      return new Response(
        JSON.stringify({ valid: true, sessionId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_session_data') {
      // Fetch session with student info
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          *,
          students (
            id,
            full_name,
            grade,
            date_of_birth,
            primary_concerns
          ),
          appointments (
            scheduled_at,
            zoom_join_url
          )
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('Failed to fetch session:', sessionError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch session data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Fetch subtests for the session
      const { data: subtests, error: subtestsError } = await supabase
        .from('subtests')
        .select('*')
        .order('order_index', { ascending: true });

      if (subtestsError) {
        console.error('Failed to fetch subtests:', subtestsError);
      }

      // Fetch existing responses for this session
      const { data: responses, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('session_id', sessionId);

      if (responsesError) {
        console.error('Failed to fetch responses:', responsesError);
      }

      return new Response(
        JSON.stringify({
          session,
          subtests: subtests || [],
          responses: responses || [],
          accessLevel: 'substitute' // Indicates limited access
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Session access error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
