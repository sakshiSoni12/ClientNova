export interface ProjectStatus {
    current_phase: string;
    delays_count: number;
    last_feedback_days_ago: number;
}

export interface PaymentHistory {
    total_invoices: number;
    paid_on_time: number;
    late_payments: number;
    outstanding_amount: number;
}

export interface RecentActivity {
    meetings_attended: number;
    missed_meetings: number;
    response_pattern: string; // e.g., "Consistent", "Sporadic", "Ghosting"
}

export interface ClientData {
    client_name: string;
    client_notes: string;
    email_summary: string;
    project_status: ProjectStatus;
    payment_history: PaymentHistory;
    recent_activity: RecentActivity;
}

export type ClientMood = "Calm" | "Anxious" | "Happy" | "Ghosting";
export type RiskLevel = "Low" | "Medium" | "High";

export interface IntelligenceOutput {
    client_mood: ClientMood;
    risk_level: RiskLevel;
    confidence_score: number;
    key_signals: [string, string, string]; // Exactly 3 signals
    next_best_action: string;
    tone_guidance: string;
}
