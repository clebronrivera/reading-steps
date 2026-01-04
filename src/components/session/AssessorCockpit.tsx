import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Monitor, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { StimulusDisplay } from './StimulusDisplay';
import { SessionTimer } from './SessionTimer';
import { ScoringButtons } from './ScoringButtons';
import { ObservationPanel } from './ObservationPanel';
import { SubtestNavigation } from './SubtestNavigation';
import { ScriptPrompt } from './ScriptPrompt';
import { useSessionRealtime } from '@/hooks/useSessionRealtime';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ResponseCode = Database['public']['Enums']['response_code'];
type ValidityStatus = Database['public']['Enums']['validity_status'];

interface AssessorCockpitProps {
  sessionId: string;
}

export function AssessorCockpit({ sessionId }: AssessorCockpitProps) {
  const navigate = useNavigate();
  const {
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
  } = useSessionRealtime(sessionId);

  const [observations, setObservations] = useState<Record<string, number | string>>({});

  // Calculate total items from stimulus data
  const totalItems = useMemo(() => {
    if (!currentSubtest?.stimulus_data) return 0;
    const data = currentSubtest.stimulus_data as { items?: unknown[] };
    return data.items?.length || currentSubtest.item_count || 0;
  }, [currentSubtest]);

  // Determine if we should show error types based on module
  const showErrorTypes = currentSubtest?.module_type === 'orf' || 
                         currentSubtest?.module_type === 'phonics';
  
  const showStrategyTags = currentSubtest?.module_type === 'phonics' || 
                           currentSubtest?.module_type === 'hfw';

  // Get timing config for timer
  const timerConfig = useMemo(() => {
    if (!currentSubtest?.timing_config) return null;
    const config = currentSubtest.timing_config as { duration_seconds?: number };
    return config.duration_seconds;
  }, [currentSubtest]);

  const handleScore = useCallback(async (
    code: ResponseCode, 
    extras?: { errorType?: string; strategyTag?: string }
  ) => {
    if (!currentSubtest) return;

    try {
      await recordResponse({
        subtest_id: currentSubtest.id,
        item_index: sessionState.currentItemIndex,
        score_code: code,
        error_type: extras?.errorType || null,
        strategy_tag: extras?.strategyTag || null,
        response_time_ms: sessionState.isTimerRunning ? sessionState.timerSeconds * 1000 : null,
      });

      // Auto-advance to next item
      if (sessionState.currentItemIndex < totalItems - 1) {
        updateSessionState({ currentItemIndex: sessionState.currentItemIndex + 1 });
      }

      toast.success(`Scored: ${code}`);
    } catch (err) {
      toast.error('Failed to record response');
    }
  }, [currentSubtest, sessionState, recordResponse, updateSessionState, totalItems]);

  const handleDiscontinue = useCallback(async () => {
    const currentIndex = subtests.findIndex(s => s.id === currentSubtest?.id);
    if (currentIndex < subtests.length - 1) {
      await navigateToSubtest(subtests[currentIndex + 1].id);
      toast.info('Module discontinued, moved to next');
    } else {
      toast.info('No more subtests available');
    }
  }, [subtests, currentSubtest, navigateToSubtest]);

  const handleEndSession = useCallback(async (validity: ValidityStatus) => {
    try {
      await updateSession({
        status: 'completed',
        ended_at: new Date().toISOString(),
        validity_status: validity,
        observations: observations,
      });
      toast.success('Session ended');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to end session');
    }
  }, [updateSession, observations, navigate]);

  const handleObservationsUpdate = useCallback((obs: Record<string, number | string>) => {
    setObservations(obs);
    updateSession({ observations: obs });
  }, [updateSession]);

  // Pointer tracking for laser pointer feature
  const handlePointerMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    updateSessionState({ pointerPosition: { x, y } });
  }, [updateSessionState]);

  const handlePointerLeave = useCallback(() => {
    updateSessionState({ pointerPosition: null });
  }, [updateSessionState]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  // Count responses for current subtest
  const subtestResponses = responses.filter(r => r.subtest_id === currentSubtest?.id);
  const correctCount = subtestResponses.filter(r => r.score_code === 'correct' || r.score_code === 'self_correct').length;
  const incorrectCount = subtestResponses.filter(r => r.score_code === 'incorrect').length;

  return (
    <div className="h-screen flex bg-background">
      {/* Left Panel - Assessor Controls */}
      <div className="w-[400px] flex flex-col border-r border-border bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border bg-sidebar text-sidebar-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              <span className="font-semibold">Assessor Cockpit</span>
            </div>
            <Badge variant="outline" className="bg-success/20 text-success border-success/30">
              <Users className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
          <p className="text-sm opacity-80 mt-1">
            {currentSubtest?.name || 'No subtest selected'}
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Script Prompt */}
            <ScriptPrompt 
              prompt={currentSubtest?.script_prompt || null} 
              subtestName={currentSubtest?.name || ''} 
            />

            {/* Timer (if timed module) */}
            {timerConfig && (
              <SessionTimer
                seconds={sessionState.timerSeconds}
                isRunning={sessionState.isTimerRunning}
                maxSeconds={timerConfig}
                onStart={() => updateSessionState({ isTimerRunning: true })}
                onPause={() => updateSessionState({ isTimerRunning: false })}
                onReset={() => updateSessionState({ timerSeconds: 0, isTimerRunning: false })}
                onTick={(s) => updateSessionState({ timerSeconds: s })}
              />
            )}

            {/* Running Score */}
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-xl font-bold text-success">{correctCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <span className="text-xl font-bold text-destructive">{incorrectCount}</span>
              </div>
              {timerConfig && sessionState.timerSeconds > 0 && (
                <div className="ml-auto text-sm text-muted-foreground">
                  WCPM: {Math.round((correctCount / sessionState.timerSeconds) * 60)}
                </div>
              )}
            </div>

            {/* Scoring Buttons */}
            <ScoringButtons
              onScore={handleScore}
              showErrorTypes={showErrorTypes}
              showStrategyTags={showStrategyTags}
            />

            {/* Navigation */}
            <SubtestNavigation
              subtests={subtests}
              currentSubtest={currentSubtest}
              currentItemIndex={sessionState.currentItemIndex}
              totalItems={totalItems}
              onNavigateSubtest={navigateToSubtest}
              onNavigateItem={(idx) => updateSessionState({ currentItemIndex: idx })}
              onDiscontinue={handleDiscontinue}
            />

            {/* Observations */}
            <ObservationPanel
              observations={observations}
              onUpdate={handleObservationsUpdate}
            />
          </div>
        </ScrollArea>

        {/* End Session Footer */}
        <div className="p-4 border-t border-border bg-muted/50">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                End Session
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>End Session</AlertDialogTitle>
                <AlertDialogDescription>
                  Select the validity status for this session based on testing conditions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid grid-cols-3 gap-2 py-4">
                <Button
                  variant="outline"
                  className="flex-col h-20 border-success text-success hover:bg-success/10"
                  onClick={() => handleEndSession('valid')}
                >
                  <CheckCircle className="h-6 w-6 mb-1" />
                  Valid
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-20 border-warning text-warning hover:bg-warning/10"
                  onClick={() => handleEndSession('questionable')}
                >
                  <AlertTriangle className="h-6 w-6 mb-1" />
                  Questionable
                </Button>
                <Button
                  variant="outline"
                  className="flex-col h-20 border-destructive text-destructive hover:bg-destructive/10"
                  onClick={() => handleEndSession('invalid')}
                >
                  <XCircle className="h-6 w-6 mb-1" />
                  Invalid
                </Button>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Right Panel - Stimulus Display (what student sees) */}
      <div 
        className="flex-1 relative"
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
      >
        <StimulusDisplay
          subtest={currentSubtest}
          currentItemIndex={sessionState.currentItemIndex}
          pointerPosition={sessionState.pointerPosition}
          isStudentView={false}
        />
        
        {/* Assessor-only overlay info */}
        <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm rounded-lg p-2 text-xs text-muted-foreground">
          Student sees this screen • Hover to show pointer
        </div>
      </div>
    </div>
  );
}
