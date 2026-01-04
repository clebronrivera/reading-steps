import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Session = Database['public']['Tables']['sessions']['Row'];
type Subtest = Database['public']['Tables']['subtests']['Row'];
type Response = Database['public']['Tables']['responses']['Row'];

export interface SessionState {
  currentItemIndex: number;
  isTimerRunning: boolean;
  timerSeconds: number;
  pointerPosition: { x: number; y: number } | null;
}

export interface UseSessionRealtimeReturn {
  session: Session | null;
  currentSubtest: Subtest | null;
  subtests: Subtest[];
  responses: Response[];
  sessionState: SessionState;
  isLoading: boolean;
  error: string | null;
  updateSessionState: (updates: Partial<SessionState>) => void;
  navigateToSubtest: (subtestId: string) => Promise<void>;
  recordResponse: (response: Omit<Database['public']['Tables']['responses']['Insert'], 'session_id'>) => Promise<{ data: Response | null }>;
  updateSession: (updates: Partial<Database['public']['Tables']['sessions']['Update']>) => Promise<void>;
}

export function useSessionRealtime(sessionId: string): UseSessionRealtimeReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [currentSubtest, setCurrentSubtest] = useState<Subtest | null>(null);
  const [subtests, setSubtests] = useState<Subtest[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>({
    currentItemIndex: 0,
    isTimerRunning: false,
    timerSeconds: 0,
    pointerPosition: null,
  });

  // Fetch initial session data
  useEffect(() => {
    async function fetchSessionData() {
      try {
        setIsLoading(true);
        
        // Fetch session
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;
        setSession(sessionData);

        // Fetch subtests for this session's assessment
        if (sessionData?.current_subtest_id) {
          const { data: subtestData } = await supabase
            .from('subtests')
            .select('*')
            .eq('id', sessionData.current_subtest_id)
            .single();
          
          if (subtestData) {
            setCurrentSubtest(subtestData);
            
            // Fetch all subtests for the assessment
            const { data: allSubtests } = await supabase
              .from('subtests')
              .select('*')
              .eq('assessment_id', subtestData.assessment_id)
              .order('order_index');
            
            if (allSubtests) setSubtests(allSubtests);
          }
        }

        // Fetch existing responses
        const { data: responsesData } = await supabase
          .from('responses')
          .select('*')
          .eq('session_id', sessionId);
        
        if (responsesData) setResponses(responsesData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
      } finally {
        setIsLoading(false);
      }
    }

    if (sessionId) fetchSessionData();
  }, [sessionId]);

  // Set up realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`session-${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`,
      }, (payload) => {
        if (payload.new) {
          setSession(payload.new as Session);
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'responses',
        filter: `session_id=eq.${sessionId}`,
      }, (payload) => {
        if (payload.new) {
          setResponses(prev => [...prev, payload.new as Response]);
        }
      })
      .on('broadcast', { event: 'session-state' }, (payload) => {
        if (payload.payload) {
          setSessionState(prev => ({ ...prev, ...payload.payload }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Broadcast session state changes
  const updateSessionState = useCallback((updates: Partial<SessionState>) => {
    setSessionState(prev => {
      const newState = { ...prev, ...updates };
      
      // Broadcast to other clients
      supabase.channel(`session-${sessionId}`).send({
        type: 'broadcast',
        event: 'session-state',
        payload: newState,
      });
      
      return newState;
    });
  }, [sessionId]);

  // Navigate to a different subtest
  const navigateToSubtest = useCallback(async (subtestId: string) => {
    const { error } = await supabase
      .from('sessions')
      .update({ current_subtest_id: subtestId })
      .eq('id', sessionId);
    
    if (error) throw error;

    const subtest = subtests.find(s => s.id === subtestId);
    if (subtest) {
      setCurrentSubtest(subtest);
      updateSessionState({ currentItemIndex: 0, timerSeconds: 0, isTimerRunning: false });
    }
  }, [sessionId, subtests, updateSessionState]);

  // Record a response
  const recordResponse = useCallback(async (
    response: Omit<Database['public']['Tables']['responses']['Insert'], 'session_id'>
  ): Promise<{ data: Database['public']['Tables']['responses']['Row'] | null }> => {
    const { data, error } = await supabase
      .from('responses')
      .insert({
        ...response,
        session_id: sessionId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return { data };
  }, [sessionId]);

  // Update session
  const updateSession = useCallback(async (
    updates: Partial<Database['public']['Tables']['sessions']['Update']>
  ) => {
    const { error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId);
    
    if (error) throw error;
  }, [sessionId]);

  return {
    session,
    currentSubtest,
    subtests,
    responses,
    sessionState,
    isLoading,
    error,
    updateSessionState,
    navigateToSubtest,
    recordResponse,
    updateSession,
  };
}
