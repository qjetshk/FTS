import { Text } from '@react-email/components';
import { EmailLayout, Greeting, styles } from './layout';
import { countryName, formatPeriod } from './format.util';

type Props = {
  name: string | null;
  orgName: string;
  period: string;
  countries: string[];
  partial: boolean;
  actionUrl: string;
};

export function StatformReadyTemplate({ name, orgName, period, countries, partial, actionUrl }: Props) {
  const periodLabel = formatPeriod(period);
  return (
    <EmailLayout
      preview={`Статформы за ${periodLabel} готовы`}
      title={partial ? 'Статформы готовы частично' : 'Статформы готовы'}
      action={{ label: 'Скачать статформы', url: actionUrl }}
    >
      <Greeting name={name} />
      <Text style={styles.text}>
        Мы сформировали статистические формы за {periodLabel} для {orgName}:{' '}
        {countries.map(countryName).join(', ')}.
      </Text>
      {partial && (
        <Text style={styles.text}>
          По некоторым странам сформировать форму не удалось — подробности на странице статформ.
        </Text>
      )}
    </EmailLayout>
  );
}
