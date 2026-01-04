import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Users, LogOut, BookOpen, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScriptPrompt } from '../ScriptPrompt';
import { ObservationPanel } from '../ObservationPanel';
import { 
  ORFPassageScorer, 
  FluencyRubricScorer, 
  ORFSummary, 
  ORFTimer,
  type WordMark,
  type WordStatus,
  type FluencyScores,
} from './index';
import { useSessionRealtime } from '@/hooks/useSessionRealtime';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ValidityStatus = Database['public']['Enums']['validity_status'];

interface ORFAssessorViewProps {
  sessionId: string;
}

const WORD_STATUS_CYCLE: WordStatus[] = ['correct', 'error', 'self_correct'];

export function ORFAssessorView({ sessionId }: ORFAssessorViewProps) {
  const navigate = useNavigate();
  const {
    session,
    currentSubtest,
    subtests,
    isLoading,
    error,
    sessionState,
    updateSessionState,
    updateSession,
    recordResponse,
    navigateToSubtest,
  } = useSessionRealtime(sessionId);

  const [wordMarks, setWordMarks] = useState<WordMark[]>([]);
  const [lastWordIndex, setLastWordIndex] = useState<number | undefined>();
  const [fluencyScores, setFluencyScores] = useState<FluencyScores>({
    expression: 2,
    phrasing: 2,
    smoothness: 2,
    pace: 2,
  });
  const [observations, setObservations] = useState<Record<string, number | string>>({});
  const [activeTab, setActiveTab] = useState<'scoring' | 'results'>('scoring');
  const [isTimerComplete, setIsTimerComplete] = useState(false);

  // Extract passage from stimulus data
  const passage = useMemo(() => {
    if (!currentSubtest?.stimulus_data) return '';
    const data = currentSubtest.stimulus_data as { items?: Array<{ passage?: string; text?: string }> };
    const item = data.items?.[sessionState.currentItemIndex];
    return item?.passage || item?.text || '';
  }, [currentSubtest, sessionState.currentItemIndex]);

  const words = useMemo(() => passage.split(/\s+/).filter(w => w.length > 0), [passage]);
  const totalWords = words.length;

  // Calculate metrics
  const wordsAttempted = lastWordIndex !== undefined ? lastWordIndex + 1 : totalWords;
  const errorCount = wordMarks.filter(m => m.status === 'error' && m.index < wordsAttempted).length;
  const selfCorrectCount = wordMarks.filter(m => m.status === 'self_correct' && m.index < wordsAttempted).length;
  const wordsCorrect = wordsAttempted - errorCount;

  // WCPM calculation
  const wcpm = sessionState.timerSeconds > 0 
    ? Math.round((wordsCorrect / sessionState.timerSeconds) * 60)
    : 0;

  const handleWordClick = useCallback((index: number, currentStatus: WordStatus) => {
    const currentIdx = WORD_STATUS_CYCLE.indexOf(currentStatus);
    const nextStatus = WORD_STATUS_CYCLE[(currentIdx + 1) % WORD_STATUS_CYCLE.length];

    setWordMarks(prev => {
      // Remove existing mark for this word
      const filtered = prev.filter(m => m.index !== index);
      // Only add if not returning to correct
      if (nextStatus !== 'correct') {
        return [...filtered, { index, status: nextStatus }];
      }
      return filtered;
    });
  }, []);

  const handleSetLastWord = useCallback((index: number) => {
    setLastWordIndex(index);
    toast.info(`Stopping point set at word ${index + 1}`);
  }, []);

  const handleFluencyChange = useCallback((dimension: keyof FluencyScores, value: number) => {
    setFluencyScores(prev => ({ ...prev, [dimension]: value }));
  }, []);

  const handleTimerComplete = useCallback(() => {
    setIsTimerComplete(true);
    updateSessionState({ isTimerRunning: false });
    toast.success('Timer complete! Mark stopping point and review scores.');
    setActiveTab('results');
  }, [updateSessionState]);

  const handleObservationsUpdate = useCallback((obs: Record<string, number | string>) => {
    setObservations(obs);
  }, []);

  const handleSaveResults = useCallback(async () => {
    if (!currentSubtest) return;

    try {
      // Save the ORF response with all scoring data
      await recordResponse({
        subtest_id: currentSubtest.id,
        item_index: sessionState.currentItemIndex,
        score_code: 'correct', // ORF uses aggregate scoring
        response_time_ms: sessionState.timerSeconds * 1000,
        notes: JSON.stringify({
          wcpm,
          wordsAttempted,
          wordsCorrect,
          errorCount,
          selfCorrectCount,
          fluencyScores,
          wordMarks,
          lastWordIndex,
        }),
      });

      toast.success('ORF results saved');

      // Move to next subtest if available
      const currentIdx = subtests.findIndex(s => s.id === currentSubtest.id);
      if (currentIdx < subtests.length - 1) {
        await navigateToSubtest(subtests[currentIdx + 1].id);
        // Reset state for next passage
        setWordMarks([]);
        setLastWordIndex(undefined);
        setFluencyScores({ expression: 2, phrasing: 2, smoothness: 2, pace: 2 });
        setIsTimerComplete(false);
        setActiveTab('scoring');
        updateSessionState({ timerSeconds: 0, isTimerRunning: false });
      }
    } catch (err) {
      toast.error('Failed to save results');
    }
  }, [
    currentSubtest, 
    sessionState, 
    recordResponse, 
    subtests, 
    navigateToSubtest, 
    updateSessionState,
    wcpm, 
    wordsAttempted, 
    wordsCorrect, 
    errorCount, 
    selfCorrectCount, 
    fluencyScores, 
    wordMarks, 
    lastWordIndex
  ]);

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

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-sidebar text-sidebar-foreground px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="font-semibold">ORF Assessment</span>
            </div>
            <Badge variant="outline" className="bg-success/20 text-success border-success/30">
              <Users className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">WCPM: </span>
              <span className="font-bold text-lg">{wcpm}</span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-1" />
                  End Session
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>End Session</AlertDialogTitle>
                  <AlertDialogDescription>
                    Select the validity status for this session.
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
        <p className="text-sm opacity-80 mt-1">
          {currentSubtest?.name || 'No passage selected'} • {totalWords} words
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-[380px] flex flex-col border-r border-border bg-card">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Script Prompt */}
              <ScriptPrompt 
                prompt={currentSubtest?.script_prompt || "This is a story about [topic]. I want you to read this story to me. You'll have 1 minute to read as much as you can. When I say \"begin,\" start reading aloud at the top of the page. Do your best reading. If you have trouble with a word, I'll tell it to you. Do you have any questions? Begin."} 
                subtestName={currentSubtest?.name || 'ORF'} 
              />

              {/* Timer */}
              <ORFTimer
                seconds={sessionState.timerSeconds}
                isRunning={sessionState.isTimerRunning}
                maxSeconds={60}
                onStart={() => updateSessionState({ isTimerRunning: true })}
                onPause={() => updateSessionState({ isTimerRunning: false })}
                onReset={() => {
                  updateSessionState({ timerSeconds: 0, isTimerRunning: false });
                  setIsTimerComplete(false);
                  setActiveTab('scoring');
                }}
                onTick={(s) => updateSessionState({ timerSeconds: s })}
                onComplete={handleTimerComplete}
              />

              {/* Tabs for Scoring vs Results */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'scoring' | 'results')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="scoring">Fluency Scoring</TabsTrigger>
                  <TabsTrigger value="results">Results</TabsTrigger>
                </TabsList>

                <TabsContent value="scoring" className="mt-4 space-y-4">
                  <FluencyRubricScorer
                    scores={fluencyScores}
                    onScoreChange={handleFluencyChange}
                    disabled={!sessionState.isTimerRunning && sessionState.timerSeconds === 0}
                  />
                </TabsContent>

                <TabsContent value="results" className="mt-4">
                  <ORFSummary
                    totalWords={totalWords}
                    wordsAttempted={wordsAttempted}
                    wordMarks={wordMarks}
                    fluencyScores={fluencyScores}
                    elapsedSeconds={sessionState.timerSeconds}
                    gradeLevel={currentSubtest?.grade || undefined}
                  />
                  
                  {isTimerComplete && (
                    <Button 
                      onClick={handleSaveResults} 
                      className="w-full mt-4"
                      size="lg"
                    >
                      Save & Continue
                    </Button>
                  )}
                </TabsContent>
              </Tabs>

              {/* Observations */}
              <ObservationPanel
                observations={observations}
                onUpdate={handleObservationsUpdate}
              />
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Passage Scorer */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-6">
            <ORFPassageScorer
              passage={passage}
              wordMarks={wordMarks}
              onWordClick={handleWordClick}
              isTimerRunning={sessionState.isTimerRunning}
              lastWordIndex={lastWordIndex}
              onSetLastWord={handleSetLastWord}
            />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
