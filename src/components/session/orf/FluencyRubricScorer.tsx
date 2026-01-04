import { cn } from '@/lib/utils';

export interface FluencyScores {
  expression: number; // 1-4
  phrasing: number;   // 1-4
  smoothness: number; // 1-4
  pace: number;       // 1-4
}

interface FluencyRubricScorerProps {
  scores: FluencyScores;
  onScoreChange: (dimension: keyof FluencyScores, value: number) => void;
  disabled?: boolean;
}

const DIMENSIONS: Array<{
  key: keyof FluencyScores;
  label: string;
  levels: string[];
}> = [
  {
    key: 'expression',
    label: 'Expression & Tone',
    levels: ['Monotone/flat', 'Inconsistent', 'Generally appropriate', 'Highly expressive'],
  },
  {
    key: 'phrasing',
    label: 'Phrasing',
    levels: ['Word-by-word', 'Awkward breaks', 'Mostly natural', 'Clause-level/fluent'],
  },
  {
    key: 'smoothness',
    label: 'Smoothness',
    levels: ['Frequent hesitations', 'Occasional breaks', 'Generally smooth', 'Effortless/fluid'],
  },
  {
    key: 'pace',
    label: 'Pace',
    levels: ['Slow or rushed', 'Inconsistent', 'Conversational', 'Flexible/natural'],
  },
];

const LEVEL_LABELS = ['1 - Emerging', '2 - Developing', '3 - Proficient', '4 - Advanced'];

export function FluencyRubricScorer({ 
  scores, 
  onScoreChange,
  disabled = false 
}: FluencyRubricScorerProps) {
  const totalScore = scores.expression + scores.phrasing + scores.smoothness + scores.pace;
  const averageScore = totalScore / 4;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Fluency Rubric</h3>
        <div className="text-sm text-muted-foreground">
          Average: <span className="font-bold text-foreground">{averageScore.toFixed(1)}</span>/4
        </div>
      </div>

      <div className="space-y-3">
        {DIMENSIONS.map((dim) => (
          <div key={dim.key} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{dim.label}</span>
              <span className="text-xs text-muted-foreground">
                {dim.levels[scores[dim.key] - 1]}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((level) => (
                <button
                  key={level}
                  onClick={() => onScoreChange(dim.key, level)}
                  disabled={disabled}
                  className={cn(
                    'h-9 rounded text-sm font-medium transition-all',
                    'border-2',
                    scores[dim.key] === level
                      ? level <= 1
                        ? 'bg-destructive/20 border-destructive text-destructive'
                        : level === 2
                        ? 'bg-warning/20 border-warning text-warning-foreground'
                        : level === 3
                        ? 'bg-success/20 border-success text-success'
                        : 'bg-primary/20 border-primary text-primary'
                      : 'bg-card border-border text-muted-foreground hover:border-primary/50',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  title={LEVEL_LABELS[level - 1]}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comprehension Recall (optional) */}
      <div className="pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">
          Fluency scores help qualify WCPM data. A high WCPM with low expression may indicate word-calling without comprehension.
        </div>
      </div>
    </div>
  );
}
