export type Bindings = {
  DB: D1Database;
};

export type Variables = {
  user?: User;
};

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  last_login?: string;
}

export interface TrainingDay {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  order_num: number;
}

export interface TrainingStep {
  id: number;
  day_id: number;
  step_number: number;
  title: string;
  description: string;
  tools?: string; // JSON array
  importance?: string;
  limitations?: string;
  instructions?: string;
}

export interface UserProgress {
  id: number;
  user_id: number;
  day_id: number;
  step_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
  last_updated: string;
}

export interface UserResponse {
  id: number;
  user_id: number;
  day_id: number;
  step_id: number;
  field_name: string;
  field_value: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

export interface AuthPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
}
