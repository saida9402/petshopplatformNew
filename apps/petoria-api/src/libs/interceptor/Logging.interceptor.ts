import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger: Logger = new Logger('API');

	public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const recordTime = Date.now();
		const requestType = context.getType<GqlContextType>();

		if (requestType === 'graphql') {
			const gqlContext = GqlExecutionContext.create(context);
			const body = gqlContext.getContext().req.body;

			// Log operation name and variable keys only — never log variable values
			// or response bodies, which may contain access tokens or PII.
			this.logger.log(
				JSON.stringify({
					op: body?.operationName,
					vars: body?.variables ? Object.keys(body.variables) : [],
				}),
				'REQUEST',
			);

			return next.handle().pipe(
				tap(() => {
					this.logger.log(
						`${context.getHandler().name} — ${Date.now() - recordTime}ms`,
						'RESPONSE',
					);
				}),
			);
		}

		// HTTP, WebSocket, RPC — must return the observable or NestJS receives
		// undefined and the handler response is silently dropped.
		return next.handle();
	}
}
