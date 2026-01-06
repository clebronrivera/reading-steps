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
  completedSubtestIds: string[];
  updateSessionState: (updates: Partial<SessionState>) => void;
  navigateToSubtest: (subtestId: string) => Promise<void>;
  addSubtest: (subtest: Subtest) => Promise<void>;
  completeCurrentSubtest: () => Promise<void>;
  recordResponse: (response: Omit<Database['public']['Tables']['responses']['Insert'], 'session_id'>) => Promise<{ data: Response | null }>;
  updateSession: (updates: Partial<Database['public']['Tables']['sessions']['Update']>) => Promise<void>;
}

export function useSessionRealtime(sessionId: string): UseSessionRealtimeReturn {
  const [session, setSession] = useState<Session | null>(null);
  const [currentSubtest, setCurrentSubtest] = useState<Subtest | null>(null);
  const [subtests, setSubtests] = useState<Subtest[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [completedSubtestIds, setCompletedSubtestIds] = useState<string[]>([]);
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
          .maybeSingle();

        if (sessionError) throw sessionError;
        if (!sessionData) {
          setError('Session not found');
          setIsLoading(false);
          return;
        }
        setSession(sessionData);

        // Get selected subtests from observations (new multi-subtest flow)
        const observations = sessionData.observations as { selected_subtests?: string[] } | null;
        const selectedSubtestIds = observations?.selected_subtests;

        if (selectedSubtestIds && selectedSubtestIds.length > 0) {
          // Fetch all selected subtests by their IDs
          const { data: selectedSubtests, error: subtestsError } = await supabase
            .from('subtests')
            .select('*')
            .in('id', selectedSubtestIds);
          
          if (subtestsError) throw subtestsError;
          
          if (selectedSubtests && selectedSubtests.length > 0) {
            // Sort subtests in the order they were selected
            const sortedSubtests = selectedSubtestIds
              .map(id => selectedSubtests.find(s => s.id === id))
              .filter((s): s is typeof selectedSubtests[0] => s !== undefined);
            
            setSubtests(sortedSubtests);
            
            // Set current subtest from session or first in list
            if (sessionData.current_subtest_id) {
              const current = sortedSubtests.find(s => s.id === sessionData.current_subtest_id);
              setCurrentSubtest(current || sortedSubtests[0]);
            } else {
              // No current set, use first selected subtest
              setCurrentSubtest(sortedSubtests[0]);
              // Update session with first subtest
              await supabase
                .from('sessions')
                .update({ current_subtest_id: sortedSubtests[0].id })
                .eq('id', sessionId);
            }
          }
        } else if (sessionData.current_subtest_id) {
          // Fallback: single subtest flow (legacy)
          const { data: subtestData } = await supabase
            .from('subtests')
            .select('*')
            .eq('id', sessionData.current_subtest_id)
            .maybeSingle();
          
          if (subtestData) {
            setCurrentSubtest(subtestData);
            setSubtests([subtestData]);
          }
        } else {
          // No subtests pre-selected - this is fine for live picking mode
          // The assessor will pick subtests from the cockpit
          setCurrentSubtest(null);
          setSubtests([]);
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
    // First check if subtest is already in our list
    let subtest = subtests.find(s => s.id === subtestId);
    
    // If not, fetch it
    if (!subtest) {
      const { data } = await supabase
        .from('subtests')
        .select('*')
        .eq('id', subtestId)
        .maybeSingle();
      
      if (data) {
        subtest = data;
        setSubtests(prev => [...prev, data]);
      }
    }
    
    if (subtest) {
      // Update session in DB
      const { error } = await supabase
        .from('sessions')
        .update({ current_subtest_id: subtestId })
        .eq('id', sessionId);
      
      if (error) throw error;

      setCurrentSubtest(subtest);
      updateSessionState({ currentItemIndex: 0, timerSeconds: 0, isTimerRunning: false });
    }
  }, [sessionId, subtests, updateSessionState]);

  // Add a new subtest to the session
  const addSubtest = useCallback(async (subtest: Subtest) => {
    // Add to local list if not already there
    setSubtests(prev => {
      if (prev.find(s => s.id === subtest.id)) return prev;
      return [...prev, subtest];
    });
    
    // Update session observations with new subtest list
    const currentObservations = session?.observations as { selected_subtests?: string[] } | null;
    const currentSelected = currentObservations?.selected_subtests || [];
    const newSelected = currentSelected.includes(subtest.id) 
      ? currentSelected 
      : [...currentSelected, subtest.id];
    
    await supabase
      .from('sessions')
      .update({ 
        observations: { ...currentObservations, selected_subtests: newSelected },
        current_subtest_id: subtest.id,
        status: 'in_progress'
      })
      .eq('id', sessionId);
    
    setCurrentSubtest(subtest);
    updateSessionState({ currentItemIndex: 0, timerSeconds: 0, isTimerRunning: false });
  }, [sessionId, session, updateSessionState]);

  // Mark current subtest as completed
  const completeCurrentSubtest = useCallback(async () => {
    if (currentSubtest) {
      setCompletedSubtestIds(prev => 
        prev.includes(currentSubtest.id) ? prev : [...prev, currentSubtest.id]
      );
      // Clear current subtest - will show picker
      setCurrentSubtest(null);
      await supabase
        .from('sessions')
        .update({ current_subtest_id: null })
        .eq('id', sessionId);
    }
  }, [currentSubtest, sessionId]);

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
    completedSubtestIds,
    updateSessionState,
    navigateToSubtest,
    addSubtest,
    completeCurrentSubtest,
    recordResponse,
    updateSession,
  };
}
