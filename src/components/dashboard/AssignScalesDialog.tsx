import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClipboardList, Loader2 } from "lucide-react";

interface AssignScalesDialogProps {
  studentId: string;
  studentName: string;
  existingScales: string[];
  onAssigned: () => void;
}

const availableScales = [
  {
    id: "seb_brief",
    name: "Brief SEB Screener",
    description: "Quick 6-question category-level check-in (2-3 min)",
  },
  {
    id: "seb_full",
    name: "Full SEB Screener",
    description: "Comprehensive 53-question behavioral assessment (15-20 min)",
  },
  {
    id: "reading_history",
    name: "Reading History Questionnaire",
    description: "Family reading history and early literacy exposure",
  },
  {
    id: "attention_screener",
    name: "Attention Screener",
    description: "Brief attention and focus questionnaire",
  },
];

export function AssignScalesDialog({
  studentId,
  studentName,
  existingScales,
  onAssigned,
}: AssignScalesDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedScales, setSelectedScales] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleScale = (scaleId: string) => {
    setSelectedScales((prev) =>
      prev.includes(scaleId)
        ? prev.filter((id) => id !== scaleId)
        : [...prev, scaleId]
    );
  };

  const handleAssign = async () => {
    if (selectedScales.length === 0) {
      toast.error("Please select at least one scale to assign");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create parent_scales entries for each selected scale
      const scaleEntries = selectedScales.map((scaleType) => ({
        student_id: studentId,
        scale_type: scaleType,
        responses: {},
      }));

      const { error } = await supabase.from("parent_scales").insert(scaleEntries);

      if (error) throw error;

      toast.success(`Assigned ${selectedScales.length} scale(s) to ${studentName}`);
      setSelectedScales([]);
      setOpen(false);
      onAssigned();
    } catch (error: any) {
      console.error("Error assigning scales:", error);
      toast.error(error.message || "Failed to assign scales");
    } finally {
      setIsSubmitting(false);
    }
  };

  const unassignedScales = availableScales.filter(
    (scale) => !existingScales.includes(scale.id)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <ClipboardList className="h-4 w-4 mr-2" />
          Assign Parent Scales
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Parent Rating Scales</DialogTitle>
          <DialogDescription>
            Select scales to assign to {studentName}'s parent. They will be able
            to complete these in the Parent Portal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {unassignedScales.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              All available scales have already been assigned.
            </p>
          ) : (
            unassignedScales.map((scale) => (
              <div
                key={scale.id}
                className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                onClick={() => handleToggleScale(scale.id)}
              >
                <Checkbox
                  id={scale.id}
                  checked={selectedScales.includes(scale.id)}
                  onCheckedChange={() => handleToggleScale(scale.id)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={scale.id}
                    className="font-medium cursor-pointer"
                  >
                    {scale.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {scale.description}
                  </p>
                </div>
              </div>
            ))
          )}

          {existingScales.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Already assigned:
              </p>
              <div className="flex flex-wrap gap-2">
                {existingScales.map((scaleId) => {
                  const scale = availableScales.find((s) => s.id === scaleId);
                  return (
                    <span
                      key={scaleId}
                      className="text-xs px-2 py-1 bg-muted rounded-full"
                    >
                      {scale?.name || scaleId}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedScales.length === 0 || isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Assign {selectedScales.length > 0 && `(${selectedScales.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
