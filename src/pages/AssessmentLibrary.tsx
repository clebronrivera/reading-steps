import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  BookOpen,
  Calculator,
  Heart,
  Pencil,
  MessageCircle,
  Archive,
  ArchiveRestore,
  FileText,
  Music,
  Mic,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  display_order: number;
}

interface Subtest {
  id: string;
  name: string;
  description: string | null;
  grade: string | null;
  item_count: number | null;
  module_type: string | null;
  category_id: string | null;
  is_archived: boolean;
}

// Top-level areas with icons and colors
const AREAS = [
  { name: "Reading", icon: BookOpen, color: "border-l-blue-500" },
  { name: "Math Understanding", icon: Calculator, color: "border-l-purple-500" },
  { name: "Social, Emotional & Behavior", icon: Heart, color: "border-l-pink-500" },
  { name: "Writing", icon: Pencil, color: "border-l-amber-500" },
  { name: "Communication", icon: MessageCircle, color: "border-l-green-500" },
];

const MODULE_ICONS: Record<string, typeof BookOpen> = {
  orf: Mic,
  phonics: Music,
  comprehension: FileText,
  hfw: Eye,
  print_awareness: BookOpen,
  phonological_awareness: Music,
};

export default function AssessmentLibrary() {
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Fetch all categories
  const { data: categories = [] } = useQuery({
    queryKey: ["assessment-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessment_categories")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as Category[];
    },
  });

  // Fetch all subtests
  const { data: subtests = [], refetch: refetchSubtests } = useQuery({
    queryKey: ["all-subtests", showArchived],
    queryFn: async () => {
      let query = supabase
        .from("subtests")
        .select("id, name, description, grade, item_count, module_type, category_id, is_archived")
        .order("order_index");
      
      if (!showArchived) {
        query = query.eq("is_archived", false);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Subtest[];
    },
  });

  // Build hierarchy: Area -> Category -> Subcategory -> Subtests
  const hierarchy = useMemo(() => {
    const topLevelCategories = categories.filter((c) => c.parent_id === null);
    const childCategories = categories.filter((c) => c.parent_id !== null);

    return AREAS.map((area) => {
      const areaCategory = topLevelCategories.find((c) => c.name === area.name);
      return { ...area, categoryId: null, children: [], directSubtests: [] as Subtest[], subtestCount: 0 };
      // Get direct children (categories under this area)
      const areaChildren = childCategories
        .filter((c) => c.parent_id === areaCategory.id)
        .sort((a, b) => a.display_order - b.display_order);

      // Get subtests for each child category
      const childrenWithSubtests = areaChildren.map((child) => {
        // Get subcategories of this category
        const subCategories = childCategories
          .filter((c) => c.parent_id === child.id)
          .sort((a, b) => a.display_order - b.display_order);

        // Get subtests directly under this category
        const directSubtests = subtests.filter((s) => s.category_id === child.id);

        // Get subtests under subcategories
        const subCategoriesWithSubtests = subCategories.map((sub) => ({
          ...sub,
          subtests: subtests.filter((s) => s.category_id === sub.id),
        }));

        const totalSubtests =
          directSubtests.length +
          subCategoriesWithSubtests.reduce((acc, sub) => acc + sub.subtests.length, 0);

        return {
          ...child,
          directSubtests,
          subCategories: subCategoriesWithSubtests,
          subtestCount: totalSubtests,
        };
      });

      // Also get subtests directly under the area (no category)
      const directAreaSubtests = subtests.filter((s) => s.category_id === areaCategory.id);

      const totalCount =
        directAreaSubtests.length +
        childrenWithSubtests.reduce((acc, c) => acc + c.subtestCount, 0);

      return {
        ...area,
        categoryId: areaCategory.id,
        children: childrenWithSubtests,
        directSubtests: directAreaSubtests,
        subtestCount: totalCount,
      };
    });
  }, [categories, subtests]);

  // Filter by search
  const filteredHierarchy = useMemo(() => {
    if (!search.trim()) return hierarchy;

    const searchLower = search.toLowerCase();

    return hierarchy.map((area) => {
      const filteredChildren = area.children.map((child) => {
        const filteredDirect = child.directSubtests.filter(
          (s) =>
            s.name.toLowerCase().includes(searchLower) ||
            s.grade?.toLowerCase().includes(searchLower)
        );

        const filteredSubs = child.subCategories.map((sub) => ({
          ...sub,
          subtests: sub.subtests.filter(
            (s) =>
              s.name.toLowerCase().includes(searchLower) ||
              s.grade?.toLowerCase().includes(searchLower)
          ),
        }));

        return {
          ...child,
          directSubtests: filteredDirect,
          subCategories: filteredSubs,
          subtestCount:
            filteredDirect.length + filteredSubs.reduce((acc, s) => acc + s.subtests.length, 0),
        };
      });

      const filteredDirectArea = (area.directSubtests || []).filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.grade?.toLowerCase().includes(searchLower)
      );

      return {
        ...area,
        children: filteredChildren,
        directSubtests: filteredDirectArea,
        subtestCount:
          filteredDirectArea.length +
          filteredChildren.reduce((acc, c) => acc + c.subtestCount, 0),
      };
    });
  }, [hierarchy, search]);

  const handleArchive = async (subtestId: string, archive: boolean) => {
    const { error } = await supabase
      .from("subtests")
      .update({ is_archived: archive })
      .eq("id", subtestId);

    if (error) {
      toast.error("Failed to update assessment");
      return;
    }

    toast.success(archive ? "Assessment archived" : "Assessment restored");
    refetchSubtests();
  };

  const renderSubtest = (subtest: Subtest) => {
    const IconComponent = MODULE_ICONS[subtest.module_type || ""] || FileText;

    return (
      <div
        key={subtest.id}
        className={`flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
          subtest.is_archived ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-muted">
            <IconComponent className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-sm">{subtest.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {subtest.grade && <span>Grade {subtest.grade}</span>}
              {subtest.item_count && <span>• {subtest.item_count} items</span>}
              {subtest.module_type && (
                <Badge variant="outline" className="text-xs">
                  {subtest.module_type.replace("_", " ")}
                </Badge>
              )}
              {subtest.is_archived && (
                <Badge variant="secondary" className="text-xs">
                  Archived
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleArchive(subtest.id, !subtest.is_archived)}
        >
          {subtest.is_archived ? (
            <ArchiveRestore className="h-4 w-4" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Assessment Library</h1>
            <p className="text-muted-foreground">
              Browse and manage all assessments organized by area
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assessments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showArchived ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="h-4 w-4 mr-2" />
            {showArchived ? "Showing Archived" : "Show Archived"}
          </Button>
        </div>

        <Accordion type="multiple" className="space-y-4">
          {filteredHierarchy.map((area) => {
            const AreaIcon = area.icon;

            return (
              <AccordionItem
                key={area.name}
                value={area.name}
                className={`border rounded-lg overflow-hidden border-l-4 ${area.color}`}
              >
                <AccordionTrigger className="px-4 hover:no-underline hover:bg-accent/50">
                  <div className="flex items-center gap-3">
                    <AreaIcon className="h-5 w-5" />
                    <span className="font-semibold">{area.name}</span>
                    <Badge variant="secondary">{area.subtestCount} assessments</Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  {area.subtestCount === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">
                      No assessments in this area yet
                    </p>
                  ) : (
                    <Accordion type="multiple" className="space-y-2">
                      {/* Direct subtests under area */}
                      {area.directSubtests && area.directSubtests.length > 0 && (
                        <div className="space-y-2 mb-4">
                          {area.directSubtests.map(renderSubtest)}
                        </div>
                      )}

                      {/* Categories */}
                      {area.children.map((category) =>
                        category.subtestCount > 0 ? (
                          <AccordionItem
                            key={category.id}
                            value={category.id}
                            className="border rounded-md"
                          >
                            <AccordionTrigger className="px-3 py-2 text-sm hover:no-underline hover:bg-accent/50">
                              <div className="flex items-center gap-2">
                                <span>{category.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {category.subtestCount}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-3 pb-3">
                              <div className="space-y-2">
                                {/* Direct subtests under category */}
                                {category.directSubtests.map(renderSubtest)}

                                {/* Subcategories */}
                                {category.subCategories.map(
                                  (sub) =>
                                    sub.subtests.length > 0 && (
                                      <div key={sub.id} className="mt-3">
                                        <p className="text-xs font-medium text-muted-foreground mb-2 px-1">
                                          {sub.name}
                                        </p>
                                        <div className="space-y-2">
                                          {sub.subtests.map(renderSubtest)}
                                        </div>
                                      </div>
                                    )
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ) : null
                      )}
                    </Accordion>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </DashboardLayout>
  );
}
