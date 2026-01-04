import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StimulusDisplay } from './StimulusDisplay';
import type { Database } from '@/integrations/supabase/types';

type Session = Database['public']['Tables']['sessions']['Row'];
type Subtest = Database['public']['Tables']['subtests']['Row'];

interface StudentViewProps {
  sessionId: string;
}

interface SessionState {
  currentItemIndex: number;
  pointerPosition: { x: number; y: number } | null;
}

export function StudentView({ sessionId }: StudentViewProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [currentSubtest, setCurrentSubtest] = useState<Subtest | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>({
    currentItemIndex: 0,
    pointerPosition: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial session data
  useEffect(() => {
    async function fetchSessionData() {
      try {
        setIsLoading(true);
        
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;
        setSession(sessionData);

        if (sessionData?.current_subtest_id) {
          const { data: subtestData } = await supabase
            .from('subtests')
            .select('*')
            .eq('id', sessionData.current_subtest_id)
            .single();
          
          if (subtestData) {
            setCurrentSubtest(subtestData);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session');
      } finally {
        setIsLoading(false);
      }
    }

    if (sessionId) fetchSessionData();
  }, [sessionId]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`session-${sessionId}-student`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`,
      }, async (payload) => {
        if (payload.new) {
          const newSession = payload.new as Session;
          setSession(newSession);
          
          // Fetch new subtest if it changed
          if (newSession.current_subtest_id && 
              newSession.current_subtest_id !== currentSubtest?.id) {
            const { data: subtestData } = await supabase
              .from('subtests')
              .select('*')
              .eq('id', newSession.current_subtest_id)
              .single();
            
            if (subtestData) {
              setCurrentSubtest(subtestData);
            }
          }
        }
      })
      .on('broadcast', { event: 'session-state' }, (payload) => {
        if (payload.payload) {
          setSessionState(prev => ({ 
            ...prev, 
            currentItemIndex: payload.payload.currentItemIndex ?? prev.currentItemIndex,
            pointerPosition: payload.payload.pointerPosition ?? prev.pointerPosition,
          }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, currentSubtest?.id]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-xl text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-xl text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  if (session?.status === 'completed') {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">All Done!</h1>
          <p className="text-xl text-muted-foreground">
            Great job! You can close this window now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <StimulusDisplay
        subtest={currentSubtest}
        currentItemIndex={sessionState.currentItemIndex}
        pointerPosition={sessionState.pointerPosition}
        isStudentView={true}
      />
    </div>
  );
}
