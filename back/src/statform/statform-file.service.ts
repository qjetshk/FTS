import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { decrypt, EncryptedPayload } from 'src/utils/crypto.util';

// BY + 2026-09 → BY_statform_09-26.xml
export const statformFilename = (country: string, period: string) => {
  const [year, month] = period.split('-');
  return `${country}_statform_${month}-${year.slice(2)}.xml`;
};

// Отдельно от StatformService: нужен и уведомлениям (XML в Telegram), а StatformService сам зависит от NotificationModule
@Injectable()
export class StatformFileService {
  constructor(private prisma: PrismaService) {}

  // userId — скачивание из кабинета: статформа любой организации этого юзера.
  // Без userId — внутренние вызовы (email-worker, Telegram), там доступ уже проверен
  async getStatformFile(id: string, userId?: string): Promise<{ filename: string; content: string }> {
    const statform = await this.prisma.statForm.findFirst({
      where: { id, ...(userId && { run: { organization: { userId } } }), status: 'READY' },
      select: { country: true, encryptedXml: true, run: { select: { period: true } } },
    });
    if (!statform?.encryptedXml) throw new NotFoundException('Statform not found');

    const key = Buffer.from(process.env.XML_ENCRYPTION_KEY!, 'hex');
    return {
      filename: statformFilename(statform.country, statform.run.period),
      content: decrypt(statform.encryptedXml as unknown as EncryptedPayload, key),
    };
  }
}
