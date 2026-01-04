import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Eye, 
  Zap, 
  AlertTriangle, 
  TrendingDown, 
  ArrowRight,
  Frown,
  Save
} from 'lucide-react';

interface ObservationPanelProps {
  observations: Record<string, number | string>;
  onUpdate: (observations: Record<string, number | string>) => void;
}

const OBSERVATION_CATEGORIES = [
  { key: 'attention', label: 'Attention', icon: Eye, options: ['focused', 'distracted', 'variable'] },
  { key: 'effort', label: 'Effort', icon: Zap, options: ['strong', 'adequate', 'minimal'] },
  { key: 'frustration', label: 'Frustration', icon: Frown, options: ['none', 'mild', 'moderate', 'high'] },
  { key: 'impulsivity', label: 'Impulsivity', icon: AlertTriangle, options: ['none', 'mild', 'frequent'] },
  { key: 'avoidance', label: 'Avoidance', icon: TrendingDown, options: ['none', 'some', 'significant'] },
  { key: 'responsiveness', label: 'Responsiveness', icon: ArrowRight, options: ['responsive', 'delayed', 'unresponsive'] },
];

export function ObservationPanel({ observations, onUpdate }: ObservationPanelProps) {
  const [notes, setNotes] = useState(observations.notes as string || '');
  const [localObs, setLocalObs] = useState<Record<string, string>>(
    observations as Record<string, string> || {}
  );

  const handleOptionClick = (key: string, value: string) => {
    const updated = { ...localObs, [key]: value };
    setLocalObs(updated);
  };

  const handleSave = () => {
    onUpdate({ ...localObs, notes });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Observations</h3>
        <Button size="sm" onClick={handleSave}>
          <Save className="h-3 w-3 mr-1" />
          Save
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {OBSERVATION_CATEGORIES.map(({ key, label, icon: Icon, options }) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {options.map((option) => (
                <Button
                  key={option}
                  variant={localObs[key] === option ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-6 px-2"
                  onClick={() => handleOptionClick(key, option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Additional Notes
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Note any behaviors, environmental factors, or other observations..."
          className="h-20 text-sm resize-none"
        />
      </div>
    </div>
  );
}
