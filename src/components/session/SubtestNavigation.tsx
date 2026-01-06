import { ChevronLeft, ChevronRight, List, AlertCircle, Save, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import type { Database } from '@/integrations/supabase/types';

type Subtest = Database['public']['Tables']['subtests']['Row'];

interface SubtestNavigationProps {
  subtests: Subtest[];
  currentSubtest: Subtest | null;
  currentItemIndex: number;
  totalItems: number;
  responsesCount?: number;
  onNavigateSubtest: (subtestId: string) => void;
  onNavigateItem: (index: number) => void;
  onDiscontinue: () => void;
  onSubmitSubtest?: () => Promise<void>;
  isSubmitting?: boolean;
}

export function SubtestNavigation({
  subtests,
  currentSubtest,
  currentItemIndex,
  totalItems,
  responsesCount = 0,
  onNavigateSubtest,
  onNavigateItem,
  onDiscontinue,
  onSubmitSubtest,
  isSubmitting = false,
}: SubtestNavigationProps) {
  const currentIndex = subtests.findIndex(s => s.id === currentSubtest?.id);
  const hasPrevSubtest = currentIndex > 0;
  const hasNextSubtest = currentIndex < subtests.length - 1;
  const hasPrevItem = currentItemIndex > 0;
  const hasNextItem = currentItemIndex < totalItems - 1;

  return (
    <div className="bg-card rounded-lg border border-border p-3 space-y-3">
      {/* Current position indicator */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Subtest {currentIndex + 1} of {subtests.length}
        </span>
        <span className="font-medium text-foreground">
          Item {currentItemIndex + 1} / {totalItems || '?'}
        </span>
      </div>

      {/* Responses progress */}
      {totalItems > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle className="h-3 w-3" />
          <span>{responsesCount} of {totalItems} items scored</span>
        </div>
      )}

      {/* Item navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigateItem(currentItemIndex - 1)}
          disabled={!hasPrevItem}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Prev Item
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigateItem(currentItemIndex + 1)}
          disabled={!hasNextItem}
          className="flex-1"
        >
          Next Item
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Submit Subtest Button */}
      {onSubmitSubtest && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
              disabled={isSubmitting || responsesCount === 0}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Submit & Continue'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Subtest Results</AlertDialogTitle>
              <AlertDialogDescription>
                You've scored {responsesCount} of {totalItems} items for "{currentSubtest?.name}".
                {responsesCount < totalItems && (
                  <span className="block mt-2 text-warning">
                    Warning: Not all items have been scored.
                  </span>
                )}
                <span className="block mt-2">
                  Results will be saved to the student's record and you'll move to the next subtest.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onSubmitSubtest}>
                Submit Results
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Subtest navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => hasPrevSubtest && onNavigateSubtest(subtests[currentIndex - 1].id)}
          disabled={!hasPrevSubtest}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev Subtest
        </Button>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <List className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Subtests</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              {subtests.map((subtest, idx) => (
                <Button
                  key={subtest.id}
                  variant={subtest.id === currentSubtest?.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => onNavigateSubtest(subtest.id)}
                >
                  <span className="mr-2 text-xs opacity-60">{idx + 1}.</span>
                  {subtest.name}
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => hasNextSubtest && onNavigateSubtest(subtests[currentIndex + 1].id)}
          disabled={!hasNextSubtest}
          className="flex-1"
        >
          Next Subtest
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Discontinue button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
        onClick={onDiscontinue}
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        Discontinue Module
      </Button>
    </div>
  );
}
