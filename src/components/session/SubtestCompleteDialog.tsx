import { CheckCircle, Plus, LogOut, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SubtestCompleteDialogProps {
  isOpen: boolean;
  subtestName: string;
  correctCount: number;
  totalItems: number;
  onAddAnother: () => void;
  onEndSession: () => void;
}

export function SubtestCompleteDialog({
  isOpen,
  subtestName,
  correctCount,
  totalItems,
  onAddAnother,
  onEndSession,
}: SubtestCompleteDialogProps) {
  const accuracy = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;
  
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Assessment Complete
          </DialogTitle>
          <DialogDescription>
            Results for "{subtestName}" have been saved to the student's record.
          </DialogDescription>
        </DialogHeader>
        
        {/* Results Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Score</span>
            <span className="font-semibold">
              {correctCount} / {totalItems} correct
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Accuracy</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    accuracy >= 80 ? 'bg-success' : accuracy >= 60 ? 'bg-warning' : 'bg-destructive'
                  }`}
                  style={{ width: `${accuracy}%` }}
                />
              </div>
              <span className="font-semibold text-sm">{accuracy}%</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={onAddAnother} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Assessment
          </Button>
          <Button variant="outline" onClick={onEndSession} className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            End Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
