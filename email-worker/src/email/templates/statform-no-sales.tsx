import { Text } from '@react-email/components';
import { EmailLayout, Greeting, styles } from './layout';
import { formatPeriod } from './format.util';

type Props = {
  name: string | null;
  orgName: string;
  period: string;
  actionUrl: string;
};

export function StatformNoSalesTemplate({ name, orgName, period, actionUrl }: Props) {
  const periodLabel = formatPeriod(period);
  return (
    <EmailLayout
      preview={`За ${periodLabel} статформа не нужна`}
      title="Статформа не нужна"
      action={{ label: 'Открыть статформы', url: actionUrl }}
    >
      <Greeting name={name} />
      <Text style={styles.text}>
        Мы проверили отчёт OZON за {periodLabel} для {orgName}: в этом месяце не было отгрузок в страны ЕАЭС,
        по которым статформу подаёт продавец.
      </Text>
      <Text style={styles.text}>Подавать статформу за этот месяц не нужно, ничего делать не требуется.</Text>
    </EmailLayout>
  );
}
