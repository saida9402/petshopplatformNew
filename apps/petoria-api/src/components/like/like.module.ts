import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeService } from './like.service';
import { LikeResolver } from './like.resolver';
import { AuthModule } from '../auth/auth.module';
import LikeSchema from '../../schemas/Like.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Like',
				schema: LikeSchema,
			},
		]),
		AuthModule,
	],
	providers: [LikeService, LikeResolver],
	exports: [LikeService],
})
export class LikeModule {}
