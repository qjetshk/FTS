import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_STATFORM, JOB_GENERATE_XML } from '../queue/queue.constants';
import { StatformJobData } from '../queue/queue.types';

@Injectable()
export class StatformProducer {
  constructor(@InjectQueue(QUEUE_STATFORM) private queue: Queue<StatformJobData>) {}

  async enqueue(data: StatformJobData) {
    const jobId = `statform:${data.organizationId}:${data.period}`;
    const existing = await this.queue.getJob(jobId);
    if (existing) {
      const state = await existing.getState();
      if (state === 'failed' || state === 'completed') {
        await existing.remove();
      }
    }
    return this.queue.add(JOB_GENERATE_XML, data, { jobId });
  }

  async enqueueBulk(orgs: StatformJobData[]) {
    for (const d of orgs) {
      const jobId = `statform:${d.organizationId}:${d.period}`;
      const existing = await this.queue.getJob(jobId);
      if (existing) {
        const state = await existing.getState();
        if (state === 'failed' || state === 'completed') {
          await existing.remove();
        }
      }
    }
    return this.queue.addBulk(
      orgs.map((d) => ({
        name: JOB_GENERATE_XML,
        data: d,
        opts: { jobId: `statform:${d.organizationId}:${d.period}` },
      })),
    );
  }
}
