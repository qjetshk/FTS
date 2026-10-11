import { Text } from '@react-email/components';
import { EmailLayout, styles } from './layout';

export function WelcomeEmail() {
  return (
    <EmailLayout preview="Добро пожаловать в easyfts!" title="Добро пожаловать в easyfts">
      <Text style={styles.text}>
        easyfts — сервис для автоматической классификации товаров по ТН ВЭД и
        генерации статистических форм для продавцов OZON (ЕАЭС).
      </Text>
      <Text style={styles.text}>
        Подключите ваш магазин OZON, и мы автоматически классифицируем все
        товары и подготовим отчётность.
      </Text>
    </EmailLayout>
  );
}
