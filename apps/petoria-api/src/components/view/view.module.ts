import { Module } from '@nestjs/common';
import { ViewService } from './view.service';
import { ViewResolver } from './view.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import ViewSchema from '../../schemas/View.model';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'View', schema: ViewSchema }]), AuthModule],
	providers: [ViewService, ViewResolver],
	exports: [ViewService],
})
export class ViewModule {}
