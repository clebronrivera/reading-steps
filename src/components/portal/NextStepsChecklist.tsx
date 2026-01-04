import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Home, School, Briefcase, AlertCircle } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string | null;
  category: "immediate" | "school" | "home" | "professional";
  priority: number;
  is_completed: boolean;
  due_date: string | null;
}

interface NextStepsChecklistProps {
  items: ChecklistItem[];
  onToggle: (itemId: string, isCompleted: boolean) => void;
}

const categoryConfig = {
  immediate: {
    icon: AlertCircle,
    label: "Immediate",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  school: {
    icon: School,
    label: "School Action",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  home: {
    icon: Home,
    label: "At Home",
    className: "bg-success/10 text-success border-success/20",
  },
  professional: {
    icon: Briefcase,
    label: "Professional",
    className: "bg-warning/10 text-warning border-warning/20",
  },
};

export function NextStepsChecklist({ items, onToggle }: NextStepsChecklistProps) {
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const completedCount = items.filter((i) => i.is_completed).length;
  const totalCount = items.length;

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Next Steps Checklist
          </CardTitle>
          <Badge variant="secondary">
            {completedCount} / {totalCount} completed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedItems).map(([category, categoryItems]) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          const Icon = config.icon;

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded",
                    config.className.replace("border-", "").split(" ")[0]
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium">{config.label}</span>
              </div>
              <div className="space-y-2 pl-8">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                      item.is_completed
                        ? "bg-muted/50 border-muted"
                        : "bg-background border-border hover:border-primary/30"
                    )}
                  >
                    <Checkbox
                      id={item.id}
                      checked={item.is_completed}
                      onCheckedChange={(checked) =>
                        onToggle(item.id, checked as boolean)
                      }
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={item.id}
                      className={cn(
                        "flex-1 cursor-pointer",
                        item.is_completed && "line-through opacity-60"
                      )}
                    >
                      <p className="text-sm font-medium">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                      {item.due_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {new Date(item.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Next steps will appear here after your screening session.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
