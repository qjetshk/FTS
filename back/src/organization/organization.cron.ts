import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizationService } from './organization.service';
import { decryptField } from '../utils/field-crypto.util';

@Injectable()
export class OrganizationCron {
  private readonly logger = new Logger(OrganizationCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly organizationService: OrganizationService,
  ) {}

  // ежедневно до statform-крона (06:00 1-го числа), чтобы товары и ТН ВЭД были свежими
  @Cron('0 3 * * *')
  async syncProducts(): Promise<void> {
    const orgs = await this.prisma.organization.findMany({
      select: { ozonClientId: true, ozonApiKey: true },
    });
    this.logger.log(`Daily classify for ${orgs.length} organizations`);

    // по очереди, чтобы не запускать N параллельных прогонов LLM в n8n
    for (const org of orgs) {
      try {
        await this.organizationService.triggerClassify(String(org.ozonClientId), decryptField(org.ozonApiKey));
      } catch (e) {
        this.logger.warn(`Classify failed for client ${org.ozonClientId}: ${(e as Error).message}`);
      }
    }
  }
}
