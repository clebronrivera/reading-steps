import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { BarChart3, CheckCircle, XCircle, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SubtestResult {
  subtest_id: string;
  subtest_name: string;
  module_type: string | null;
  category_name: string | null;
  total_items: number;
  correct_count: number;
  incorrect_count: number;
  accuracy: number;
  session_date: string;
  session_id: string;
}

interface AssessmentResultsCardProps {
  studentId: string;
}

export function AssessmentResultsCard({ studentId }: AssessmentResultsCardProps) {
  const [results, setResults] = useState<SubtestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchResults();
  }, [studentId]);

  const fetchResults = async () => {
    setIsLoading(true);

    // Get all sessions for this student
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, started_at, status')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false });

    if (!sessions || sessions.length === 0) {
      setIsLoading(false);
      return;
    }

    const sessionIds = sessions.map(s => s.id);

    // Get all responses for these sessions
    const { data: responses } = await supabase
      .from('responses')
      .select('session_id, subtest_id, score_code')
      .in('session_id', sessionIds);

    // Get subtest info with categories
    const { data: subtests } = await supabase
      .from('subtests')
      .select('id, name, module_type, item_count, category_id, assessment_categories(name)');

    if (!responses || !subtests) {
      setIsLoading(false);
      return;
    }

    // Group responses by session and subtest
    const resultMap = new Map<string, SubtestResult>();

    responses.forEach(response => {
      const key = `${response.session_id}-${response.subtest_id}`;
      const subtest = subtests.find(s => s.id === response.subtest_id);
      const session = sessions.find(s => s.id === response.session_id);
      
      if (!subtest || !session) return;

      if (!resultMap.has(key)) {
        resultMap.set(key, {
          subtest_id: response.subtest_id,
          subtest_name: subtest.name,
          module_type: subtest.module_type,
          category_name: (subtest.assessment_categories as { name: string } | null)?.name || 'Uncategorized',
          total_items: subtest.item_count || 0,
          correct_count: 0,
          incorrect_count: 0,
          accuracy: 0,
          session_date: session.started_at,
          session_id: session.id,
        });
      }

      const result = resultMap.get(key)!;
      if (response.score_code === 'correct' || response.score_code === 'self_correct') {
        result.correct_count++;
      } else if (response.score_code === 'incorrect' || response.score_code === 'no_response') {
        result.incorrect_count++;
      }
    });

    // Calculate accuracy for each result
    resultMap.forEach(result => {
      const total = result.correct_count + result.incorrect_count;
      result.accuracy = total > 0 ? Math.round((result.correct_count / total) * 100) : 0;
    });

    setResults(Array.from(resultMap.values()));
    setIsLoading(false);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Group results by category
  const resultsByCategory = results.reduce((acc, result) => {
    const category = result.category_name || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(result);
    return acc;
  }, {} as Record<string, SubtestResult[]>);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-success';
    if (accuracy >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 90) return 'bg-success/10 text-success border-success/20';
    if (accuracy >= 70) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  if (isLoading) {
    return (
      <Card className="card-elevated border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Assessment Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading results...</p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className="card-elevated border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Assessment Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No assessment results yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elevated border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Assessment Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3">
            {Object.entries(resultsByCategory).map(([category, categoryResults]) => (
              <Collapsible
                key={category}
                open={expandedCategories.has(category)}
                onOpenChange={() => toggleCategory(category)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    {expandedCategories.has(category) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium text-sm">{category}</span>
                    <Badge variant="outline" className="text-xs">
                      {categoryResults.length} subtest{categoryResults.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Avg: {Math.round(categoryResults.reduce((sum, r) => sum + r.accuracy, 0) / categoryResults.length)}%
                    </span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2 pl-6">
                  {categoryResults.map((result, idx) => (
                    <div
                      key={`${result.session_id}-${result.subtest_id}-${idx}`}
                      className="p-3 rounded-lg bg-card border border-border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium truncate flex-1">
                          {result.subtest_name}
                        </span>
                        <Badge variant="outline" className={getAccuracyBadge(result.accuracy)}>
                          {result.accuracy}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-success" />
                          {result.correct_count} correct
                        </span>
                        <span className="flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-destructive" />
                          {result.incorrect_count} incorrect
                        </span>
                        <span className="ml-auto">
                          {format(new Date(result.session_date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}