import { Injectable, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * GqlThrottlerGuard — production-correct implementation for NestJS apps
 * that serve both HTTP controllers and GraphQL resolvers under the same
 * global APP_GUARD.
 *
 * Why two branches are required:
 *
 * HTTP context  — the base ThrottlerGuard already handles this via
 *   context.switchToHttp(). Re-using that path gives the correct Express
 *   req/res pair directly.
 *
 * GraphQL context — the base guard calls context.switchToHttp() which
 *   returns an empty shell for GraphQL requests (no real req/res). Instead,
 *   we build a GqlExecutionContext and read req/res from the Apollo context
 *   object. This only works after GraphQLModule.forRoot() is configured with
 *   context: ({ req, res }) => ({ req, res }), which tells Apollo Server v4
 *   to populate those fields on every resolver call.
 *
 * Root cause of the original breakage:
 *   @nestjs/apollo v12 passes context: options.context directly to Apollo's
 *   expressMiddleware. Without an explicit context factory in forRoot(), the
 *   value is undefined, Apollo defaults to an empty {} context, so ctx.req
 *   is undefined, and getTracker(undefined) throws TypeError on every request.
 */
@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
	getRequestResponse(context: ExecutionContext) {
		if (context.getType<string>() === 'graphql') {
			// GraphQL path: req and res come from the Apollo context object,
			// which is populated by the context factory in GraphQLModule.forRoot().
			const gqlCtx = GqlExecutionContext.create(context);
			const ctx = gqlCtx.getContext<{ req: any; res: any }>();
			return { req: ctx.req, res: ctx.res };
		}

		// HTTP path: use the base-class approach — switchToHttp() gives the
		// real Express req and res for REST controllers.
		const http = context.switchToHttp();
		return { req: http.getRequest(), res: http.getResponse() };
	}
}
