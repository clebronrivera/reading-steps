import { RiskLevel, SEBScoreResult, SEBCategoryResult, SEBOverallResult } from './types';
import { sebCategories, combinedCategories } from './data';

/**
 * Calculate risk level from mean score
 * Low: 0.00 to 0.49
 * Moderate: 0.50 to 1.24
 * High: 1.25 to 2.24
 * Critical: 2.25 to 3.00
 */
export function getRiskLevel(meanScore: number): RiskLevel {
  if (meanScore < 0.5) return 'low';
  if (meanScore < 1.25) return 'moderate';
  if (meanScore < 2.25) return 'high';
  return 'critical';
}

/**
 * Apply red-flag override rules
 * If rated 3 → Critical
 * If rated 2 → High at minimum
 */
export function applyRedFlagOverride(
  currentRisk: RiskLevel,
  redFlagScore: number
): RiskLevel {
  if (redFlagScore >= 3) return 'critical';
  if (redFlagScore >= 2) {
    if (currentRisk === 'low' || currentRisk === 'moderate') return 'high';
  }
  return currentRisk;
}

/**
 * Compare risk levels (for finding highest)
 */
function riskToNumber(risk: RiskLevel): number {
  const map: Record<RiskLevel, number> = { low: 0, moderate: 1, high: 2, critical: 3 };
  return map[risk];
}

function numberToRisk(num: number): RiskLevel {
  const map: RiskLevel[] = ['low', 'moderate', 'high', 'critical'];
  return map[Math.min(num, 3)];
}

function getHigherRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return riskToNumber(a) >= riskToNumber(b) ? a : b;
}

/**
 * Calculate mean score for a set of responses
 */
export function calculateMeanScore(
  responses: Record<string, number>,
  questionIds: string[]
): number {
  const scores = questionIds
    .map(id => responses[id])
    .filter(score => score !== undefined);
  
  if (scores.length === 0) return 0;
  
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return sum / scores.length;
}

/**
 * Get top N highest-rated items for a category
 */
export function getTopItems(
  responses: Record<string, number>,
  questionIds: string[],
  categoryQuestions: { id: string; question: string }[],
  topN: number = 2
): { question: string; score: number }[] {
  const items = categoryQuestions
    .map(q => ({
      question: q.question,
      score: responses[q.id] ?? 0,
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
  
  return items;
}

/**
 * Calculate specific area scores (14 subscales)
 */
export function calculateSpecificAreaScores(
  responses: Record<string, number>
): Record<string, SEBScoreResult> {
  const results: Record<string, SEBScoreResult> = {};
  
  for (const category of sebCategories) {
    const questionIds = category.questions.map(q => q.id);
    const meanScore = calculateMeanScore(responses, questionIds);
    let riskLevel = getRiskLevel(meanScore);
    
    // Check for red flags in this category
    for (const question of category.questions) {
      if (question.isRedFlag) {
        const score = responses[question.id];
        if (score !== undefined) {
          riskLevel = applyRedFlagOverride(riskLevel, score);
        }
      }
    }
    
    results[category.id] = {
      meanScore: Math.round(meanScore * 100) / 100,
      riskLevel,
      topItems: getTopItems(responses, questionIds, category.questions),
    };
  }
  
  return results;
}

/**
 * Calculate combined category scores (6 parent-facing categories)
 */
export function calculateCombinedCategoryScores(
  specificAreaScores: Record<string, SEBScoreResult>
): SEBCategoryResult[] {
  const results: SEBCategoryResult[] = [];
  
  for (const combined of combinedCategories) {
    // Option A: Average the subscale means
    const subcategoryMeans = combined.subcategories
      .map(subId => specificAreaScores[subId]?.meanScore ?? 0);
    
    const categoryMean = subcategoryMeans.length > 0
      ? subcategoryMeans.reduce((a, b) => a + b, 0) / subcategoryMeans.length
      : 0;
    
    let riskLevel = getRiskLevel(categoryMean);
    
    // Check for red flag overrides in any subcategory
    for (const subId of combined.subcategories) {
      const subScore = specificAreaScores[subId];
      if (subScore) {
        riskLevel = getHigherRisk(riskLevel, subScore.riskLevel);
      }
    }
    
    // Collect top items across subcategories
    const allTopItems = combined.subcategories
      .flatMap(subId => specificAreaScores[subId]?.topItems ?? [])
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    results.push({
      categoryId: combined.id,
      categoryTitle: combined.title,
      meanScore: Math.round(categoryMean * 100) / 100,
      riskLevel,
      topItems: allTopItems,
    });
  }
  
  return results;
}

/**
 * Calculate overall risk level with breadth and safety rules
 */
export function calculateOverallRisk(
  categoryResults: SEBCategoryResult[],
  responses: Record<string, number>
): { overallRisk: RiskLevel; redFlagTriggered: boolean; redFlagItems: string[] } {
  // Base rule: highest combined category risk
  let overallRisk: RiskLevel = 'low';
  for (const cat of categoryResults) {
    overallRisk = getHigherRisk(overallRisk, cat.riskLevel);
  }
  
  // Breadth rule: increase if pattern is broad
  const highOrCriticalCount = categoryResults.filter(
    c => c.riskLevel === 'high' || c.riskLevel === 'critical'
  ).length;
  
  const moderateOrHigherCount = categoryResults.filter(
    c => c.riskLevel !== 'low'
  ).length;
  
  if (highOrCriticalCount >= 2 || moderateOrHigherCount >= 3) {
    const currentNum = riskToNumber(overallRisk);
    overallRisk = numberToRisk(Math.min(currentNum + 1, 3));
  }
  
  // Safety override: check all red flag items
  let redFlagTriggered = false;
  const redFlagItems: string[] = [];
  
  for (const category of sebCategories) {
    for (const question of category.questions) {
      if (question.isRedFlag) {
        const score = responses[question.id];
        if (score !== undefined && score >= 2) {
          redFlagTriggered = true;
          redFlagItems.push(question.question);
          
          if (score >= 3) {
            overallRisk = 'critical';
          } else if (score >= 2 && riskToNumber(overallRisk) < 2) {
            overallRisk = 'high';
          }
        }
      }
    }
  }
  
  return { overallRisk, redFlagTriggered, redFlagItems };
}

/**
 * Calculate complete SEB screener results
 */
export function calculateSEBResults(
  responses: Record<string, number>
): SEBOverallResult {
  const specificAreaResults = calculateSpecificAreaScores(responses);
  const categoryResults = calculateCombinedCategoryScores(specificAreaResults);
  const { overallRisk, redFlagTriggered, redFlagItems } = calculateOverallRisk(
    categoryResults,
    responses
  );
  
  return {
    overallRisk,
    categoryResults,
    specificAreaResults,
    redFlagTriggered,
    redFlagItems,
  };
}

/**
 * Calculate brief screener results
 */
export function calculateBriefResults(
  responses: Record<string, number>
): {
  categoryScores: Record<string, { score: number; risk: RiskLevel }>;
  overallRisk: RiskLevel;
  requiresFollowUp: string[];
} {
  const categoryScores: Record<string, { score: number; risk: RiskLevel }> = {};
  let overallRisk: RiskLevel = 'low';
  const requiresFollowUp: string[] = [];
  
  // Brief screener uses single-item scoring: 0=Low, 1=Mild, 2=High, 3=Urgent
  const briefRiskMap: RiskLevel[] = ['low', 'moderate', 'high', 'critical'];
  
  for (const [categoryId, score] of Object.entries(responses)) {
    const risk = briefRiskMap[Math.min(score, 3)];
    categoryScores[categoryId] = { score, risk };
    overallRisk = getHigherRisk(overallRisk, risk);
    
    // Check follow-up triggers
    if (
      (categoryId === 'safety_behavior' || categoryId === 'repetitive_unusual') &&
      score >= 2
    ) {
      requiresFollowUp.push(categoryId);
    }
  }
  
  return { categoryScores, overallRisk, requiresFollowUp };
}
