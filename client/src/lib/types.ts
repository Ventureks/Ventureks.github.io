export interface LoginFormData {
  username: string;
  password: string;
  captcha: string;
}

export interface AuthUser {
  id: string;
  username: string;
  role: string;
  email: string;
}

export interface Stats {
  contractors: number;
  activeTasks: number;
  openTickets: number;
  sentOffers: number;
}
