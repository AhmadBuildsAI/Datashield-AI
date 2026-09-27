export interface DetectedEntity {
  type: string;
  value: string;
  start: number;
  end: number;
  confidence: number;
  source: string;
  severity: string;
}

export interface ScanResponse {
  scan_id: string;
  scan_ref: string;
  filename: string | null;
  source_type: string;
  content_chars: number;
  original_text: string;
  masked_text: string | null;
  entities: DetectedEntity[];
  entity_counts: Record<string, number>;
  risk_score: number;
  risk_level: string;
  high_count: number;
  medium_count: number;
  low_count: number;
  mask_mode: string;
  created_at: string;
}

export interface ScanListItem {
  id: string;
  scan_ref: string;
  filename: string | null;
  risk_score: number;
  risk_level: string;
  total_entities: number;
  high_count: number;
  created_at: string;
}

export interface DashboardData {
  total_scans: number;
  high_risk_scans: number;
  total_entities: number;
  entity_distribution: { type: string; count: number }[];
  avg_risk_score: number;
}
