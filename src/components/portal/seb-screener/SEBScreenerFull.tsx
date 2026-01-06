import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  Info,
  CheckCircle
} from 'lucide-react';
import { sebCategories, ratingOptions } from './data';
import { calculateSEBResults } from './scoring';
import { SEBOverallResult } from './types';

interface SEBScreenerFullProps {
  onComplete: (responses: Record<string, number>, results: SEBOverallResult) => void;
  onCancel?: () => void;
}

export function SEBScreenerFull({ onComplete, onCancel }: SEBScreenerFullProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SEBOverallResult | null>(null);

  const currentCategory = sebCategories[currentCategoryIndex];
  const totalQuestions = sebCategories.reduce((acc, cat) => acc + cat.questions.length, 0);
  const answeredQuestions = Object.keys(responses).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const isCategoryComplete = currentCategory.questions.every(
    q => responses[q.id] !== undefined
  );

  const isAllComplete = sebCategories.every(cat =>
    cat.questions.every(q => responses[q.id] !== undefined)
  );

  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentCategoryIndex < sebCategories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    } else if (isAllComplete) {
      const calculatedResults = calculateSEBResults(responses);
      setResults(calculatedResults);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (results) {
      onComplete(responses, results);
    }
  };

  if (showResults && results) {
    return (
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Screener Complete
          </CardTitle>
          <CardDescription>
            Thank you for completing the Social, Emotional, and Behavioral Screener.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {results.redFlagTriggered && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important Follow-Up Needed</AlertTitle>
              <AlertDescription>
                Some responses indicate areas that may need immediate attention. 
                Your assessor will discuss these with you.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <h3 className="font-medium">Summary by Category</h3>
            {results.categoryResults.map(cat => (
              <div
                key={cat.categoryId}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <span className="font-medium">{cat.categoryTitle}</span>
                <Badge
                  variant={
                    cat.riskLevel === 'critical' ? 'destructive' :
                    cat.riskLevel === 'high' ? 'destructive' :
                    cat.riskLevel === 'moderate' ? 'secondary' : 'outline'
                  }
                  className={
                    cat.riskLevel === 'high' ? 'bg-orange-500' : ''
                  }
                >
                  {cat.riskLevel.charAt(0).toUpperCase() + cat.riskLevel.slice(1)}
                </Badge>
              </div>
            ))}
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This checklist does not diagnose anything. It helps describe patterns 
              so the right supports can be planned. Higher scores mean these challenges 
              show up more often and may need support.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowResults(false)}>
              Review Responses
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Submit Screener
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Social, Emotional, and Behavioral Screener</CardTitle>
            <CardDescription>
              Timeframe: Please answer based on the past 8 weeks
            </CardDescription>
          </div>
          <Badge variant="secondary">
            {currentCategoryIndex + 1} of {sebCategories.length}
          </Badge>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rating guide */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How to rate</AlertTitle>
          <AlertDescription className="mt-2 grid grid-cols-2 gap-2 text-sm">
            {ratingOptions.map(opt => (
              <div key={opt.value}>
                <span className="font-medium">{opt.value} {opt.label}:</span>{' '}
                {opt.description}
              </div>
            ))}
          </AlertDescription>
        </Alert>

        {/* Current category */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{currentCategory.title}</h3>
          <p className="text-sm text-muted-foreground">{currentCategory.description}</p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {currentCategory.questions.map((question, idx) => (
            <div
              key={question.id}
              className="space-y-3 p-4 rounded-lg bg-muted/30 border"
            >
              <div className="flex gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {idx + 1}.
                </span>
                <Label className="text-sm leading-relaxed">
                  {question.question}
                </Label>
              </div>
              <RadioGroup
                value={responses[question.id]?.toString() ?? ''}
                onValueChange={(value) => handleResponse(question.id, parseInt(value))}
                className="flex flex-wrap gap-4"
              >
                {ratingOptions.map(opt => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={opt.value.toString()}
                      id={`${question.id}-${opt.value}`}
                    />
                    <Label
                      htmlFor={`${question.id}-${opt.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {opt.value} {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentCategoryIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Save & Exit
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={!isCategoryComplete}
          >
            {currentCategoryIndex === sebCategories.length - 1 ? (
              isAllComplete ? 'View Results' : 'Complete All Sections'
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Important note */}
        <p className="text-xs text-muted-foreground text-center">
          This is not a diagnosis and it does not label a child. It helps describe 
          patterns so the right supports can be planned.
        </p>
      </CardContent>
    </Card>
  );
}
