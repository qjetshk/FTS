import { Text } from '@react-email/components';
import { EmailLayout, Greeting, styles } from './layout';
import { formatPeriod } from './format.util';

type Props = {
  name: string | null;
  orgName: string;
  period: string;
  cause?: 'rate_unavailable';
  reason?: string;
  actionUrl: string;
};

export function StatformFailedTemplate({ name, orgName, period, cause, reason, actionUrl }: Props) {
  const periodLabel = formatPeriod(period);
  return (
    <EmailLayout
      preview={`Не удалось сформировать статформы за ${periodLabel}`}
      title="Статформы не сформированы"
      action={{ label: 'Запустить заново', url: actionUrl }}
    >
      <Greeting name={name} />
      {cause === 'rate_unavailable' ? (
        <>
          <Text style={styles.text}>
            Для статформ за {periodLabel} для {orgName} нужен официальный курс доллара ЦБ РФ,
            а сервис ЦБ сейчас временно недоступен.
          </Text>
          <Text style={styles.text}>
            Это не связано с вашими данными. Подождите несколько часов и запустите формирование
            заново вручную на странице «Статформы».
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.text}>
            При формировании статистических форм за {periodLabel} для {orgName} произошла ошибка.
          </Text>
          {reason && <Text style={styles.text}>Причина: {reason}</Text>}
          <Text style={styles.text}>
            Попробуйте запустить формирование заново. Если ошибка повторится — напишите нам, разберёмся.
          </Text>
        </>
      )}
    </EmailLayout>
  );
}
