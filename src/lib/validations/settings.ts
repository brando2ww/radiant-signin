import { z } from "zod";

export const generalSettingsSchema = z.object({
  language: z.enum(["pt-BR", "en-US", "es-ES"]),
  date_format: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]),
  time_format: z.enum(["12h", "24h"]),
  timezone: z.string(),
  currency: z.enum(["BRL", "USD", "EUR"]),
  theme: z.enum(["light", "dark", "system"]),
  density: z.enum(["compact", "normal", "comfortable"]),
  sidebar_expanded: z.boolean(),
});

export const financialSettingsSchema = z.object({
  default_payment_method: z.string(),
  budget_alert_percentage: z.number().min(0).max(100),
  rounding: z.enum(["up", "down", "nearest"]),
  credit_card_due_day: z.number().min(1).max(31),
  credit_card_closing_day: z.number().min(1).max(31),
  monthly_budget: z.number().min(0),
});

export const notificationsSettingsSchema = z.object({
  transactions: z.object({
    new_income: z.boolean(),
    new_expense: z.boolean(),
    edited: z.boolean(),
    daily_summary: z.boolean(),
  }),
  credit_cards: z.object({
    due_date_days: z.number().min(1).max(30),
    limit_percentage: z.number().min(0).max(100),
    invoice_closed: z.boolean(),
  }),
  tasks: z.object({
    reminder_minutes: z.number().min(0).max(1440),
    events: z.boolean(),
    overdue: z.boolean(),
  }),
  reports: z.object({
    weekly: z.boolean(),
    monthly: z.boolean(),
    trends: z.boolean(),
  }),
});

export const securitySettingsSchema = z.object({
  two_factor_enabled: z.boolean(),
  auto_logout_minutes: z.number().min(5).max(120),
  hide_values: z.boolean(),
  require_password_sensitive: z.boolean(),
});

export type GeneralSettings = z.infer<typeof generalSettingsSchema>;
export type FinancialSettings = z.infer<typeof financialSettingsSchema>;
export type NotificationsSettings = z.infer<typeof notificationsSettingsSchema>;
export type SecuritySettings = z.infer<typeof securitySettingsSchema>;
