import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';

@Module({
	imports: [
		MemberModule,
		AuthModule,
		BoardArticleModule,

		CommentModule,
		LikeModule,
		ViewModule,
		FollowModule,
		ProductModule,
		CartModule,
		OrderModule,
	],
})
export class ComponentsModule {}
