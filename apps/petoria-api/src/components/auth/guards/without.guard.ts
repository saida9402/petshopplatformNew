import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class WithoutGuard implements CanActivate {
	private readonly logger = new Logger(WithoutGuard.name);

	constructor(private authService: AuthService) {}

	async canActivate(context: ExecutionContext | any): Promise<boolean> {
		if (context.contextType === 'graphql') {
			const request = context.getArgByIndex(2).req;

			// Cookie first, then Authorization header (same order as AuthGuard)
			let token: string | undefined = request.cookies?.accessToken;
			if (!token) {
				const bearerToken = request.headers.authorization;
				if (bearerToken) token = bearerToken.split(' ')[1];
			}

			if (token) {
				try {
					request.body.authMember = await this.authService.verifyToken(token);
				} catch (err) {
					request.body.authMember = null;
				}
			} else request.body.authMember = null;

			this.logger.debug(`WithoutGuard: ${request.body.authMember?.memberNick ?? 'guest'}`);
			return true;
		}

		// description => http, rpc, gprs and etc are ignored
	}
}
