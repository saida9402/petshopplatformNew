import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import { graphqlUploadExpress } from 'graphql-upload';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { WsAdapter } from '@nestjs/platform-ws';

const UPLOAD_TARGETS = ['member', 'product', 'article'];

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	app.useGlobalInterceptors(new LoggingInterceptor());
	app.enableCors({ origin: true, credentials: true });

	// Ensure all upload directories exist before accepting requests
	const uploadsRoot = path.join(process.cwd(), 'uploads');
	UPLOAD_TARGETS.forEach((target) => {
		const dir = path.join(uploadsRoot, target);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
			console.log(`[Bootstrap] Created upload directory: ${dir}`);
		}
	});

	app.use('/graphql', graphqlUploadExpress({ maxFileSize: 15_000_000, maxFiles: 10 }));
	app.use('/uploads', express.static(uploadsRoot));

	app.useWebSocketAdapter(new WsAdapter(app));
	await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
