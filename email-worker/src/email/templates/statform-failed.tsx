import { Text } from '@react-email/components';
import { EmailLayout, Greeting, styles } from './layout';
import { formatPeriod } from './format.util';

type Props = {
  name: string | null;
  orgName: string;
  period: string;
  actionUrl: string;
};

export function StatformFailedTemplate({ name, orgName, period, actionUrl }: Props) {
  const periodLabel = formatPeriod(period);
  return (
    <EmailLayout
      preview={`Не удалось сформировать статформы за ${periodLabel}`}
      title="Статформы не сформированы"
      action={{ label: 'Запустить заново', url: actionUrl }}
    >
      <Greeting name={name} />
      <Text style={styles.text}>
        При формировании статистических форм за {periodLabel} для {orgName} произошла ошибка.
      </Text>
      <Text style={styles.text}>
        Попробуйте запустить формирование заново. Если ошибка повторится — напишите нам, разберёмся.
      </Text>
    </EmailLayout>
  );
}
