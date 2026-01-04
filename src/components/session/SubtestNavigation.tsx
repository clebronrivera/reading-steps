import { ChevronLeft, ChevronRight, List, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { Database } from '@/integrations/supabase/types';

type Subtest = Database['public']['Tables']['subtests']['Row'];

interface SubtestNavigationProps {
  subtests: Subtest[];
  currentSubtest: Subtest | null;
  currentItemIndex: number;
  totalItems: number;
  onNavigateSubtest: (subtestId: string) => void;
  onNavigateItem: (index: number) => void;
  onDiscontinue: () => void;
}

export function SubtestNavigation({
  subtests,
  currentSubtest,
  currentItemIndex,
  totalItems,
  onNavigateSubtest,
  onNavigateItem,
  onDiscontinue,
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
