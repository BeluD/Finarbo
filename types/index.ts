// ============================================================
// Finarbo — TypeScript types
// ============================================================

export type RiskTolerance = 'PRESERVE' | 'BALANCED' | 'GROWTH'
export type RiskProfile   = 'VERY_CONSERVATIVE' | 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'VERY_AGGRESSIVE'
export type AlertLevel    = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
export type Horizon       = 'SHORT' | 'MEDIUM' | 'LONG'
export type Objective     = 'GROW_SAVINGS' | 'SPECIFIC_GOAL' | 'LIVE_FROM_INVESTMENTS' | 'OTHER'
export type Currency      = 'ARS' | 'USD'
export type InsightType   = 'ALERT' | 'INFO' | 'POSITIVE'
export type DebtLevel     = 'LOW' | 'MEDIUM' | 'HIGH'
export type ProfitGrade   = 'WEAK' | 'BELOW_AVERAGE' | 'AVERAGE' | 'ABOVE_AVERAGE' | 'STRONG'

// ============================================================
// Portfolio
// ============================================================

export interface PortfolioKYCData {
  riskTolerance: RiskTolerance
  horizon:       Horizon
  objective:     Objective
  objectiveText: string | null
  currency:      Currency
}

export interface PortfolioSummary {
  id:                    string
  name:                  string
  calculatedRiskProfile: RiskProfile | null
  totalValue:            number | null
  currency:              Currency
  lastUpdated:           string
  kyc:                   PortfolioKYCData | null
}

export interface Position {
  id:          string
  ticker:      string
  quantity:    number
  avgBuyPrice: number
}

// ============================================================
// CSV / File Upload
// ============================================================

export interface ParsedPosition {
  ticker:      string  // abrev
  quantity:    number  // cant
  avgBuyPrice: number  // pppCompra
}

// ============================================================
// Analysis API response (mirrors backend JSON)
// ============================================================

export interface RiskScoreResult {
  name:    'riskScore'
  score:   number
  profile: RiskProfile
}

export interface DebtScoreResult {
  name:  'debtScore'
  score: number
  level: DebtLevel
}

export interface ProfitScoreResult {
  name:  'profitScore'
  level: number
  trend: number
  score: number
  grade: ProfitGrade
}

export type ScoreStat = RiskScoreResult | DebtScoreResult | ProfitScoreResult

export interface AssetAnalysis {
  symbol:             string
  exchange:           string
  holding:            number
  positionPercentage: number
  positionValue: {
    value:    number
    currency: 'USD'
  }
  score: {
    stats:           ScoreStat[]
    assetRiskScore:  number
    holdingRiskScore: number
    alertLevel:      AlertLevel
  }
}

export interface PortfolioAnalysis {
  assets:              AssetAnalysis[]
  totalRiskScore:      number
  totalPortfolioScore: number
  portfolioAlertLevel: AlertLevel
}

// ============================================================
// Insight
// ============================================================

export interface InsightData {
  id:          string
  type:        InsightType
  title:       string
  body:        string
  isUseful:    boolean | null
  dismissedAt: string | null
  createdAt:   string
}

// ============================================================
// Risk chart snapshot
// ============================================================

export interface RiskSnapshot {
  createdAt:      string
  totalRiskScore: number
  alertLevel:     AlertLevel
}
