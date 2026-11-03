import { Injectable } from '@nestjs/common';
import type { OnboardingStage } from './email.types';

export type EmailAttachment = { filename: string; content: string };
export type OnboardingCheckIn = { email: string; name: string | null; stage: OnboardingStage; actionUrl: string };

// Внутренний API бэка (x-api-key). Нужен, чтобы не класть содержимое файлов (с ПДн) в задачи очереди.
@Injectable()
export class BackApiClient {
  private readonly baseUrl = process.env.BACK_INTERNAL_URL;
  private readonly apiKey = process.env.INTERNAL_API_KEY;

  async getStatformFile(id: string): Promise<EmailAttachment> {
    const res = await this.get(`/statforms/internal/${encodeURIComponent(id)}/file`);
    if (!res.ok) throw new Error(`back: statform ${id} file → ${res.status}`);
    return (await res.json()) as EmailAttachment;
  }

  // null — аккаунт удалён или почту отвязали, письмо не нужно
  async getOnboardingCheckIn(userId: string): Promise<OnboardingCheckIn | null> {
    const res = await this.get(`/auth/internal/onboarding/${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error(`back: onboarding ${userId} → ${res.status}`);
    return ((await res.json()) as { checkIn: OnboardingCheckIn | null }).checkIn;
  }

  private get(path: string) {
    if (!this.baseUrl || !this.apiKey) throw new Error('BACK_INTERNAL_URL / INTERNAL_API_KEY не заданы');
    return fetch(`${this.baseUrl}${path}`, {
      headers: { 'x-api-key': this.apiKey },
      signal: AbortSignal.timeout(15_000),
    });
  }
}
