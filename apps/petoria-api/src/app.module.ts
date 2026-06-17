import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppResolver } from './app.resolver';

import { DatabaseModule } from './database/database.module';
import { ComponentsModule } from './components/components.module';
import { T } from './libs/types/common';
import { SocketModule } from './socket/socket.module';
import { GqlThrottlerGuard } from './libs/guards/gql-throttler.guard';

const gqlLogger = new Logger('GraphQL');

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: '.env',
			isGlobal: true,
		}),
		// Global baseline: 60 requests per 60 seconds per IP.
		// Individual resolvers (login, signup) override this with stricter limits
		// via @Throttle({ default: { limit: 5, ttl: 60000 } }).
		ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			playground: process.env.NODE_ENV !== 'production',
			uploads: false,
			autoSchemaFile: true,

			// Required for GqlThrottlerGuard (and AuthGuard / RolesGuard) to read
			// req and res from the GraphQL execution context.
			//
			// @nestjs/apollo v12 passes this function directly to Apollo Server v4's
			// expressMiddleware. Without it, the value is undefined and Apollo falls
			// back to an empty {} context — making ctx.req and ctx.res undefined in
			// every guard that calls GqlExecutionContext.getContext().
			context: ({ req, res }: { req: any; res: any }) => ({ req, res }),

			formatError: (error: T) => {
				const graphQLFormattedError = {
					code: error?.extensions.code,
					message:
						error?.extensions?.exception?.response?.message || error?.extensions?.response?.message || error?.message,
				};
				gqlLogger.error(`GraphQL error: ${graphQLFormattedError.message}`, graphQLFormattedError.code);
				return graphQLFormattedError;
			},
		}),
		ComponentsModule,
		DatabaseModule,
		SocketModule,
	],

	providers: [
		AppResolver,
		{ provide: APP_GUARD, useClass: GqlThrottlerGuard },
	],
})
export class AppModule {}
