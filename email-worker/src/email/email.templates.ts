import type { ReactElement } from 'react';
import { WelcomeEmail } from './templates/welcome';
import { LoginCodeTemplate } from './templates/login-code';
import { StatformReadyTemplate } from './templates/statform-ready';
import { StatformFailedTemplate } from './templates/statform-failed';
import { OzonApiErrorTemplate } from './templates/ozon-api-error';
import { ProductsNeedReviewTemplate } from './templates/products-need-review';
import { formatPeriod, productsCount } from './templates/format.util';
import type { EmailJobData, EmailJobName } from './email.types';

type EmailTemplate<T extends EmailJobName> = {
  subject: (data: EmailJobData<T>) => string;
  render: (data: EmailJobData<T>) => ReactElement;
};

// Реестр писем: новое письмо = строка здесь + тип в email.types.ts
export const EMAIL_TEMPLATES: { [T in EmailJobName]: EmailTemplate<T> } = {
  'welcome': {
    subject: () => 'Добро пожаловать в easyfts!',
    render: () => WelcomeEmail(),
  },
  'login-code': {
    subject: (d) => `${d.code} — код для входа в easyfts`,
    render: (d) => LoginCodeTemplate({ code: d.code }),
  },
  'statform.ready': {
    subject: (d) => `Статформы за ${formatPeriod(d.period)} готовы`,
    render: (d) => StatformReadyTemplate(d),
  },
  'statform.failed': {
    subject: (d) => `Не удалось сформировать статформы за ${formatPeriod(d.period)}`,
    render: (d) => StatformFailedTemplate(d),
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
