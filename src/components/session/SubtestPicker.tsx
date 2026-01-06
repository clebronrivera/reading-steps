import { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, FileText, Mic, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Subtest = Database['public']['Tables']['subtests']['Row'];
type Category = Database['public']['Tables']['assessment_categories']['Row'];

interface SubtestPickerProps {
  onSelectSubtest: (subtest: Subtest) => void;
  completedSubtestIds?: string[];
  currentSubtestId?: string | null;
}

const moduleIcons: Record<string, React.ReactNode> = {
  orf: <BookOpen className="h-4 w-4" />,
  phonics: <FileText className="h-4 w-4" />,
  phonological_awareness: <Mic className="h-4 w-4" />,
  comprehension: <Brain className="h-4 w-4" />,
};

export function SubtestPicker({ 
  onSelectSubtest, 
  completedSubtestIds = [],
  currentSubtestId 
}: SubtestPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subtests, setSubtests] = useState<Subtest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setIsLoading(true);
    
    const [categoriesRes, subtestsRes] = await Promise.all([
      supabase
        .from('assessment_categories')
        .select('*')
        .order('display_order'),
      supabase
        .from('subtests')
        .select('*')
        .not('stimulus_data', 'is', null)
        .order('order_index'),
    ]);

    if (categoriesRes.data) setCategories(categoriesRes.data);
    if (subtestsRes.data) setSubtests(subtestsRes.data);
    setIsLoading(false);
  };

  // Filter subtests by search
  const filteredSubtests = subtests.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.module_type?.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const readingAreaId = categories.find(c => c.name === 'Reading' && !c.parent_id)?.id;
  const readingCategories = categories.filter(c => c.parent_id === readingAreaId);
  
  const subtestsByCategory = filteredSubtests.reduce((acc, subtest) => {
    const catId = subtest.category_id || 'uncategorized';
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(subtest);
    return acc;
  }, {} as Record<string, Subtest[]>);

  const handleSelect = (subtest: Subtest) => {
    onSelectSubtest(subtest);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Assessment
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96 sm:w-[450px]">
        <SheetHeader>
          <SheetTitle>Select Assessment</SheetTitle>
        </SheetHeader>
        
        <div className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assessments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Subtests by category */}
          <ScrollArea className="h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-6 pr-4">
                {readingCategories.map((category) => {
                  const catSubtests = subtestsByCategory[category.id] || [];
                  if (catSubtests.length === 0) return null;
                  
                  return (
                    <div key={category.id} className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {category.name}
                      </h4>
                      <div className="space-y-1">
                        {catSubtests.map((subtest) => {
                          const isCompleted = completedSubtestIds.includes(subtest.id);
                          const isCurrent = subtest.id === currentSubtestId;
                          
                          return (
                            <button
                              key={subtest.id}
                              onClick={() => handleSelect(subtest)}
                              disabled={isCurrent}
                              className={`
                                w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors
                                ${isCurrent 
                                  ? 'bg-primary/10 border border-primary/30 cursor-default' 
                                  : isCompleted
                                    ? 'bg-success/10 hover:bg-success/20 border border-success/30'
                                    : 'bg-card hover:bg-muted border border-border'
                                }
                              `}
                            >
                              <div className={`
                                flex items-center justify-center w-8 h-8 rounded-md
                                ${isCurrent ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
                              `}>
                                {moduleIcons[subtest.module_type || ''] || <FileText className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{subtest.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {subtest.grade && (
                                    <span className="text-xs text-muted-foreground">{subtest.grade}</span>
                                  )}
                                  {subtest.item_count && (
                                    <span className="text-xs text-muted-foreground">
                                      {subtest.item_count} items
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isCurrent && (
                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                                  Current
                                </Badge>
                              )}
                              {isCompleted && !isCurrent && (
                                <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                                  Done
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Uncategorized */}
                {subtestsByCategory['uncategorized']?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Other
                    </h4>
                    <div className="space-y-1">
                      {subtestsByCategory['uncategorized'].map((subtest) => (
                        <button
                          key={subtest.id}
                          onClick={() => handleSelect(subtest)}
                          className="w-full flex items-center gap-3 p-3 rounded-lg text-left bg-card hover:bg-muted border border-border transition-colors"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted text-muted-foreground">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{subtest.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
