import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { briefScreenerQuestions, briefRatingOptions } from './data';
import { calculateBriefResults } from './scoring';
import { RiskLevel } from './types';

interface SEBScreenerBriefProps {
  onComplete: (responses: Record<string, number>, results: {
    categoryScores: Record<string, { score: number; risk: RiskLevel }>;
    overallRisk: RiskLevel;
    requiresFollowUp: string[];
  }) => void;
  onRequestFullScreener?: () => void;
}

export function SEBScreenerBrief({ onComplete, onRequestFullScreener }: SEBScreenerBriefProps) {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof calculateBriefResults> | null>(null);

  const isComplete = briefScreenerQuestions.every(q => responses[q.id] !== undefined);

  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    const calculatedResults = calculateBriefResults(responses);
    setResults(calculatedResults);
    setShowResults(true);
  };

  const handleComplete = () => {
    if (results) {
      onComplete(responses, results);
    }
  };

  const getRiskLabel = (risk: RiskLevel) => {
    const labels: Record<RiskLevel, string> = {
      low: 'Low concern',
      moderate: 'Mild concern',
      high: 'High concern',
      critical: 'Urgent concern',
    };
    return labels[risk];
  };

  if (showResults && results) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Brief Check-In Complete
          </CardTitle>
          <CardDescription>
            Thank you for completing the brief parent check-in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {results.requiresFollowUp.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Follow-Up Recommended</AlertTitle>
              <AlertDescription>
                Some areas indicate a need for additional questions or support planning.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-3">
            <h3 className="font-medium">Category Summary</h3>
            {briefScreenerQuestions.map(q => {
              const catResult = results.categoryScores[q.id];
              return (
                <div
                  key={q.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <span className="font-medium">{q.title}</span>
                  <Badge
                    variant={
                      catResult?.risk === 'critical' ? 'destructive' :
                      catResult?.risk === 'high' ? 'destructive' :
                      catResult?.risk === 'moderate' ? 'secondary' : 'outline'
                    }
                    className={
                      catResult?.risk === 'high' ? 'bg-orange-500' : ''
                    }
                  >
                    {catResult ? getRiskLabel(catResult.risk) : 'Not rated'}
                  </Badge>
                </div>
              );
            })}
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This brief check-in helps identify areas that may need closer attention. 
              It is not a diagnosis.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            {onRequestFullScreener && results.overallRisk !== 'low' && (
              <Button variant="outline" onClick={onRequestFullScreener}>
                Complete Full Screener
              </Button>
            )}
            <Button onClick={handleComplete} className="flex-1">
              Submit Check-In
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle>Brief Parent Check-In</CardTitle>
        <CardDescription>
          Timeframe: Past 8 weeks. Rate each statement 0 to 3.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rating guide */}
        <div className="flex flex-wrap gap-3 text-sm">
          {briefRatingOptions.map(opt => (
            <Badge key={opt.value} variant="outline">
              {opt.value} = {opt.label}
            </Badge>
          ))}
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {briefScreenerQuestions.map((question, idx) => (
            <div
              key={question.id}
              className="space-y-3 p-4 rounded-lg bg-muted/30 border"
            >
              <div className="space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    {idx + 1})
                  </span>
                  <div>
                    <Label className="text-sm font-semibold">{question.title}</Label>
                    <p className="text-sm text-foreground mt-1">{question.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">{question.examples}</p>
                  </div>
                </div>
              </div>
              <RadioGroup
                value={responses[question.id]?.toString() ?? ''}
                onValueChange={(value) => handleResponse(question.id, parseInt(value))}
                className="flex gap-6 mt-3"
              >
                {briefRatingOptions.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={opt.value.toString()}
                      id={`${question.id}-${opt.value}`}
                    />
                    <Label
                      htmlFor={`${question.id}-${opt.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {opt.value}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="w-full"
        >
          View Results
        </Button>
      </CardContent>
    </Card>
  );
}
