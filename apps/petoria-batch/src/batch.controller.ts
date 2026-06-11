import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron, Timeout } from '@nestjs/schedule';
import { BATCH_ROLLBACK, BATCH_TOP_PRODUCTS, BATCH_TOP_SELLERS } from './lib/config';

@Controller()
export class BatchController {
	private logger: Logger = new Logger('BatchController');

	constructor(private readonly batchService: BatchService) {}

	@Timeout(1000)
	handleTimeout() {
		this.logger.debug('BATCH SERVER READY!');
	}

	@Cron('00 * * * * *', { name: BATCH_ROLLBACK })
	public async batchRollback() {
		try {
			this.logger.log(`[${BATCH_ROLLBACK}] Starting`);
			await this.batchService.batchRollback();
			this.logger.log(`[${BATCH_ROLLBACK}] Completed`);
		} catch (err) {
			this.logger.error(`[${BATCH_ROLLBACK}] Failed`, err);
		}
	}

	@Cron('20 * * * * *', { name: BATCH_TOP_PRODUCTS })
	public async batchTopProducts() {
		try {
			this.logger.log(`[${BATCH_TOP_PRODUCTS}] Starting`);
			await this.batchService.batchTopProducts();
			this.logger.log(`[${BATCH_TOP_PRODUCTS}] Completed`);
		} catch (err) {
			this.logger.error(`[${BATCH_TOP_PRODUCTS}] Failed`, err);
		}
	}

	@Cron('40 * * * * *', { name: BATCH_TOP_SELLERS })
	public async batchTopSellers() {
		try {
			this.logger.log(`[${BATCH_TOP_SELLERS}] Starting`);
			await this.batchService.batchTopSellers();
			this.logger.log(`[${BATCH_TOP_SELLERS}] Completed`);
		} catch (err) {
			this.logger.error(`[${BATCH_TOP_SELLERS}] Failed`, err);
		}
	}

	@Get()
	getHello(): string {
		return this.batchService.getHello();
	}
}
