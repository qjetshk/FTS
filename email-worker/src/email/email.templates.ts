import type { ReactElement } from 'react';
import { WelcomeEmail } from './templates/welcome';
import { LoginCodeTemplate } from './templates/login-code';
import { OnboardingCheckInTemplate } from './templates/onboarding-check-in';
import { StatformReadyTemplate } from './templates/statform-ready';
import { StatformFailedTemplate } from './templates/statform-failed';
import { StatformNoSalesTemplate } from './templates/statform-no-sales';
import { OzonApiErrorTemplate } from './templates/ozon-api-error';
import { ProductsNeedReviewTemplate } from './templates/products-need-review';
import { formatPeriod, productsCount } from './templates/format.util';
import type { EmailJobData, EmailJobName } from './email.types';
import type { BackApiClient, EmailAttachment } from './back-api.client';

type EmailTemplate<T extends EmailJobName> = {
  // дополняет данные задачи в момент отправки (то, что могло измениться, пока задача ждала); null — письмо не нужно
  prepare?: (data: EmailJobData<T>, back: BackApiClient) => Promise<EmailJobData<T> | null>;
  subject: (data: EmailJobData<T>) => string;
  render: (data: EmailJobData<T>) => ReactElement;
  // вложения подтягиваются в момент отправки, в задаче очереди лежат только ссылки (id)
  attachments?: (data: EmailJobData<T>, back: BackApiClient) => Promise<EmailAttachment[]>;
};

// Реестр писем: новое письмо = строка здесь + тип в email.types.ts
export const EMAIL_TEMPLATES: { [T in EmailJobName]: EmailTemplate<T> } = {
  'welcome': {
    subject: () => 'Добро пожаловать в easyfts!',
    render: () => WelcomeEmail(),
  },
  'onboarding.check-in': {
    // за час юзер мог пройти онбординг, сменить или отвязать почту — берём актуальное
    prepare: async (d, back) => {
      const checkIn = await back.getOnboardingCheckIn(d.userId);
      if (!checkIn || checkIn.email !== d.to) return null;
      return { ...d, name: checkIn.name, stage: checkIn.stage, actionUrl: checkIn.actionUrl };
    },
    subject: () => 'Получилось разобраться с easyfts?',
    render: (d) =>
      OnboardingCheckInTemplate({ name: d.name ?? null, stage: d.stage ?? 'no_org', actionUrl: d.actionUrl ?? '' }),
  },
  'login-code': {
    subject: (d) => `${d.code} — код для входа в easyfts`,
    render: (d) => LoginCodeTemplate({ code: d.code }),
  },
  'statform.ready': {
    subject: (d) => `Статформы за ${formatPeriod(d.period)} готовы`,
    render: (d) => StatformReadyTemplate(d),
    attachments: (d, back) => Promise.all(d.statformIds.map((id) => back.getStatformFile(id))),
  },
  'statform.failed': {
    subject: (d) => `Не удалось сформировать статформы за ${formatPeriod(d.period)}`,
    render: (d) => StatformFailedTemplate(d),
  },
  'statform.no-sales': {
    subject: (d) => `Статформа за ${formatPeriod(d.period)} не нужна — продаж в ЕАЭС не было`,
    render: (d) => StatformNoSalesTemplate(d),
  },
  'products.need-review': {
    subject: (d) => `Статформы за ${formatPeriod(d.period)}: проверьте ТН ВЭД (${productsCount(d.products.length)})`,
    render: (d) => ProductsNeedReviewTemplate(d),
  },
  'ozon.api-error': {
    subject: () => 'Нет доступа к OZON — проверьте API-ключ',
    render: (d) => OzonApiErrorTemplate(d),
  },
};
