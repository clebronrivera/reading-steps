import { CheckCircle, XCircle, RotateCcw, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WordMark } from './ORFPassageScorer';
import type { FluencyScores } from './FluencyRubricScorer';

interface ORFSummaryProps {
  totalWords: number;
  wordsAttempted: number;
  wordMarks: WordMark[];
  fluencyScores: FluencyScores;
  elapsedSeconds: number;
  gradeLevel?: string;
}

// WCPM benchmarks by grade (end of year targets)
const WCPM_BENCHMARKS: Record<string, { low: number; target: number }> = {
  '1': { low: 40, target: 60 },
  '2': { low: 70, target: 90 },
  '3': { low: 80, target: 110 },
  '4': { low: 100, target: 120 },
  '5': { low: 110, target: 130 },
  '6': { low: 120, target: 140 },
  '7': { low: 125, target: 145 },
  '8': { low: 130, target: 150 },
};

export function ORFSummary({
  totalWords,
  wordsAttempted,
  wordMarks,
  fluencyScores,
  elapsedSeconds,
  gradeLevel,
}: ORFSummaryProps) {
  const errorCount = wordMarks.filter(m => m.status === 'error').length;
  const selfCorrectCount = wordMarks.filter(m => m.status === 'self_correct').length;
  const wordsCorrect = wordsAttempted - errorCount;
  
  // Calculate WCPM (Words Correct Per Minute)
  const wcpm = elapsedSeconds > 0 
    ? Math.round((wordsCorrect / elapsedSeconds) * 60)
    : 0;

  // Calculate accuracy percentage
  const accuracy = wordsAttempted > 0 
    ? Math.round((wordsCorrect / wordsAttempted) * 100)
    : 0;

  // Get benchmark comparison
  const benchmark = gradeLevel ? WCPM_BENCHMARKS[gradeLevel] : null;
  const getBenchmarkStatus = () => {
    if (!benchmark) return 'unknown';
    if (wcpm >= benchmark.target) return 'above';
    if (wcpm >= benchmark.low) return 'on-track';
    return 'below';
  };
  const benchmarkStatus = getBenchmarkStatus();

  // Calculate fluency average
  const fluencyAverage = (
    fluencyScores.expression + 
    fluencyScores.phrasing + 
    fluencyScores.smoothness + 
    fluencyScores.pace
  ) / 4;

  return (
    <div className="space-y-4">
      {/* Main WCPM Card */}
      <Card className="border-2 border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Oral Reading Fluency Results</span>
            {benchmark && (
              <Badge 
                variant={
                  benchmarkStatus === 'above' ? 'default' :
                  benchmarkStatus === 'on-track' ? 'secondary' : 'destructive'
                }
              >
                {benchmarkStatus === 'above' ? 'Above Target' :
                 benchmarkStatus === 'on-track' ? 'On Track' : 'Below Benchmark'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            {/* WCPM */}
            <div className="space-y-1">
              <div className="text-4xl font-bold text-primary">{wcpm}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">WCPM</div>
              {benchmark && (
                <div className="text-xs text-muted-foreground">
                  Target: {benchmark.target}
                </div>
              )}
            </div>

            {/* Accuracy */}
            <div className="space-y-1">
              <div className={`text-4xl font-bold ${
                accuracy >= 95 ? 'text-success' : 
                accuracy >= 90 ? 'text-warning' : 'text-destructive'
              }`}>
                {accuracy}%
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Accuracy</div>
              <div className="text-xs text-muted-foreground">
                {wordsCorrect}/{wordsAttempted} words
              </div>
            </div>

            {/* Fluency */}
            <div className="space-y-1">
              <div className={`text-4xl font-bold ${
                fluencyAverage >= 3 ? 'text-success' : 
                fluencyAverage >= 2 ? 'text-warning' : 'text-destructive'
              }`}>
                {fluencyAverage.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Fluency</div>
              <div className="text-xs text-muted-foreground">
                /4.0 avg
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Counts */}
      <div className="grid grid-cols-4 gap-2">
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-lg font-bold">{elapsedSeconds}s</div>
            <div className="text-xs text-muted-foreground">Time</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
          <CheckCircle className="h-4 w-4 text-success" />
          <div>
            <div className="text-lg font-bold text-success">{wordsCorrect}</div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
          <XCircle className="h-4 w-4 text-destructive" />
          <div>
            <div className="text-lg font-bold text-destructive">{errorCount}</div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg">
          <RotateCcw className="h-4 w-4 text-warning" />
          <div>
            <div className="text-lg font-bold text-warning-foreground">{selfCorrectCount}</div>
            <div className="text-xs text-muted-foreground">Self-corrects</div>
          </div>
        </div>
      </div>

      {/* Fluency Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Fluency Dimensions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            <div className="p-2 bg-muted rounded">
              <div className="font-bold">{fluencyScores.expression}</div>
              <div className="text-xs text-muted-foreground">Expression</div>
            </div>
            <div className="p-2 bg-muted rounded">
              <div className="font-bold">{fluencyScores.phrasing}</div>
              <div className="text-xs text-muted-foreground">Phrasing</div>
            </div>
            <div className="p-2 bg-muted rounded">
              <div className="font-bold">{fluencyScores.smoothness}</div>
              <div className="text-xs text-muted-foreground">Smoothness</div>
            </div>
            <div className="p-2 bg-muted rounded">
              <div className="font-bold">{fluencyScores.pace}</div>
              <div className="text-xs text-muted-foreground">Pace</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
