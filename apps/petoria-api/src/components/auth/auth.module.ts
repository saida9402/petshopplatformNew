import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import MemberSchema from '../../schemas/Member.model';

@Module({
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => ({
				secret: config.get<string>('SECRET_TOKEN'),
				signOptions: { expiresIn: '30d' },
			}),
			inject: [ConfigService],
		}),
		// Register the Member model here so AuthGuard and RolesGuard can inject
		// it via @InjectModel('Member'). Exporting MongooseModule re-exports the
		// model providers to every module that imports AuthModule (all of them).
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
	],
	providers: [AuthService],
	exports: [AuthService, MongooseModule],
})
export class AuthModule {}
