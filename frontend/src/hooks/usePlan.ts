import { useAuth } from '../context/AuthContext';

type Plan = 'free' | 'basic' | 'premium' | 'admin';

// Features available per plan
const PLAN_RANK: Record<Plan, number> = {
    free: 0,
    basic: 1,
    premium: 2,
    admin: 999,
};

type Feature =
    | 'unlimitedAppliances'  // basic+
    | 'applianceBreakdown'   // basic+
    | 'tariffBilling'        // basic+
    | 'historicalTracking'   // basic+
    | 'advancedAlerts'       // basic+
    | 'csvUpload'            // basic+
    | 'forecast'             // premium+
    | 'recommendations'      // premium+
    | 'exportReports'        // premium+
    | 'anomalyDetection'     // premium+
    | 'multiHousehold'       // premium+
    | 'smartAlerts';         // premium+

const FEATURE_REQUIREMENTS: Record<Feature, Plan> = {
    unlimitedAppliances: 'basic',
    applianceBreakdown: 'basic',
    tariffBilling: 'basic',
    historicalTracking: 'basic',
    advancedAlerts: 'basic',
    csvUpload: 'basic',
    forecast: 'premium',
    recommendations: 'premium',
    exportReports: 'premium',
    anomalyDetection: 'premium',
    multiHousehold: 'premium',
    smartAlerts: 'premium',
};

/**
 * usePlan — tiny hook for plan-based feature access control.
 *
 * Usage:
 *   const { canDo, plan, isBasic, isPremium } = usePlan();
 *   if (!canDo('forecast')) → show upgrade prompt
 */
export function usePlan() {
    const { user } = useAuth();
    const plan: Plan = (user?.role ?? 'free') as Plan;
    const rank = PLAN_RANK[plan];

    const canDo = (feature: Feature): boolean => {
        const required = FEATURE_REQUIREMENTS[feature];
        return rank >= PLAN_RANK[required];
    };

    return {
        plan,
        isBasic: rank >= PLAN_RANK.basic,
        isPremium: rank >= PLAN_RANK.premium,
        isAdmin: plan === 'admin',
        canDo,
    };
}
