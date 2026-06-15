export interface Dashboard {
  renewals: Renewals;
  expiry: Expiry;
  family: Family;
  revenue: Revenue;
  monthly_revenue?: MonthlyRevenue;
  trials: Trials;
  summary: Summary;
  recent_transactions?: RecentTransaction[];
  recent_users?: RecentUser[];
}

export interface Renewals {
  total_renewals: number;
  renewals_this_month: number;
  renewals_this_week: number;
  by_plan: PlanCount[];
}

export interface Expiry {
  trial_expiry_alerts_sent: number;
  renewal_7_day_alerts_sent: number;
  renewal_1_day_alerts_sent: number;
  expiring_in_7_days: number;
  expiring_in_1_day: number;
}

export interface Family {
  total_family_owners: number;
  total_family_members: number;
  pending_invites: number;
  accepted_members: number;
  avg_members_per_family: number;
  families_at_limit: number;
}

export interface Revenue {
  total_revenue: number;
  revenue_this_month: number;
  revenue_this_week: number;
  mrr: number;
  by_plan: RevenueByPlan[];
  by_week: RevenueByWeek[];
}

export interface RevenueByPlan {
  plan_name: string;
  revenue: number;
}

export interface RevenueByWeek {
  week: string;
  revenue: number;
}

export interface MonthlyRevenue {
  year: number;
  months: MonthlyRevenueItem[];
}

export interface MonthlyRevenueItem {
  month: string;
  month_number: number;
  revenue: number;
}

export interface Trials {
  total_trialing: number;
  trial_expired_converted: number;
  trial_expired_dropped: number;
  trial_active: number;
  conversion_rate_percent: number;
}

export interface Summary {
  total_subscribers: number;
  active: number;
  trialing: number;
  cancelled: number;
  expired: number;
  referral_grace: number;
  currently_access_granted: number;
  plans_breakdown: PlanCount[];
}

export interface PlanCount {
  plan_name: string;
  count: number;
}

export interface RecentTransaction {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  profile_picture: string | null;
  plan_name: string;
  amount: number;
  event_type: string;
  payment_source: string;
  created_at: string;
}

export interface RecentUser {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  profile_picture: string | null;
  created_at: string;
}
