import { Text } from '@react-email/components';
import { EmailLayout, Greeting, styles } from './layout';

type Props = {
  name: string | null;
  orgName: string;
  actionUrl: string;
};

export function OzonApiErrorTemplate({ name, orgName, actionUrl }: Props) {
  return (
    <EmailLayout
      preview="Нет доступа к OZON — проверьте API-ключ"
      title="Нет доступа к OZON"
      action={{ label: 'Проверить API-ключ', url: actionUrl }}
    >
      <Greeting name={name} />
      <Text style={styles.text}>
        Мы не смогли получить данные из OZON для {orgName}. Скорее всего, API-ключ
        отозван, истёк или у него не хватает прав.
      </Text>
      <Text style={styles.text}>
        Пока доступа нет, товары не обновляются, а статформы не формируются. Создайте новый
        ключ в личном кабинете продавца OZON и укажите его в настройках организации.
      </Text>
    </EmailLayout>
  );
}
