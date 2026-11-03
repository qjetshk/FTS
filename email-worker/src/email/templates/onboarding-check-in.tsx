import { Text } from '@react-email/components';
import { EmailLayout, Greeting, styles } from './layout';
import type { OnboardingStage } from '../email.types';

type Props = {
  name: string | null;
  stage: OnboardingStage;
  actionUrl: string;
};

// текст под место, где юзер остановился; общий призыв — ответить на письмо (replyTo в email.service)
const BY_STAGE: Record<OnboardingStage, { lines: string[]; action: string }> = {
  no_org: {
    lines: [
      'Похоже, вы ещё не подключили магазин OZON. Чаще всего здесь останавливаются из-за API-ключа.',
      'Ключ создаётся в кабинете продавца OZON в разделе «Настройки → API», достаточно роли Admin read only: сервис только читает отчёты и товары и ничего не меняет в магазине. Если у вас нет доступа к этому разделу, ключ может создать владелец или администратор кабинета.',
      'Ключ хранится у нас в зашифрованном виде.',
    ],
    action: 'Подключить магазин',
  },
  setup: {
    lines: [
      'Магазин подключён, осталось проверить данные организации и коды ТН ВЭД у товаров. Коды мы подобрали автоматически; если в каком-то сомневаемся, товар подсвечен жёлтым.',
    ],
    action: 'Продолжить настройку',
  },
  no_runs: {
    lines: [
      'Всё настроено. Попробуйте сформировать статформу за прошлый месяц: это займёт пару минут, а готовые XML придут на почту или в Telegram и будут в личном кабинете.',
      'Дальше статформы будут формироваться сами каждый месяц.',
    ],
    action: 'Сформировать статформу',
  },
  has_runs: {
    lines: [
      'Вы уже сформировали статформу — спасибо, что попробовали. Подошли ли файлы для загрузки в личный кабинет ФТС, всё ли было понятно?',
    ],
    action: 'Открыть статформы',
  },
};

export function OnboardingCheckInTemplate({ name, stage, actionUrl }: Props) {
  const { lines, action } = BY_STAGE[stage];
  return (
    <EmailLayout
      preview="Получилось ли разобраться с easyfts?"
      title="Получилось разобраться?"
      action={{ label: action, url: actionUrl }}
    >
      <Greeting name={name} />
      <Text style={styles.text}>
        Меня зовут Антон, я разработчик easyfts. Вы зарегистрировались час назад — хочу узнать, всё ли получилось.
      </Text>
      {lines.map((line) => (
        <Text key={line} style={styles.text}>
          {line}
        </Text>
      ))}
      <Text style={styles.text}>
        Если что-то непонятно или не работает, просто ответьте на это письмо — я отвечу сам. Замечания тоже очень
        пригодятся: сервис новый, и ваш опыт помогает сделать его удобнее.
      </Text>
    </EmailLayout>
  );
}
