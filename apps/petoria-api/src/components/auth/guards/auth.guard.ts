import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
	Logger,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from '../auth.service';
import { Member } from 'apps/petoria-api/src/libs/dto/member/member';
import { MemberStatus } from 'apps/petoria-api/src/libs/enums/member.enum';
import { Message } from 'apps/petoria-api/src/libs/enums/common.enum';

@Injectable()
export class AuthGuard implements CanActivate {
	private readonly logger = new Logger(AuthGuard.name);

	constructor(
		private authService: AuthService,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	async canActivate(context: ExecutionContext | any): Promise<boolean> {
		if (context.contextType === 'graphql') {
			const request = context.getArgByIndex(2).req;

			// HttpOnly cookie is the primary auth channel; Authorization header is a fallback.
			let token: string | undefined = request.cookies?.accessToken;
			if (!token) {
				const bearerToken = request.headers.authorization;
				if (bearerToken) token = bearerToken.split(' ')[1];
			}
			if (!token) throw new BadRequestException(Message.TOKEN_NOT_EXIST);
			const authMember = await this.authService.verifyToken(token);
			if (!authMember) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);

			// Re-check current status from DB — a blocked/deleted member whose
			// JWT is still cryptographically valid must not be allowed through.
			const currentMember = await this.memberModel
				.findOne({ _id: authMember._id, memberStatus: MemberStatus.ACTIVE })
				.select('_id memberType memberStatus memberNick')
				.lean()
				.exec();

			if (!currentMember) throw new UnauthorizedException(Message.NOT_AUTHENTICATED);

			this.logger.debug(`Authenticated: ${currentMember.memberNick}`);
			// Merge fresh DB fields over stale JWT fields (role/status are now always current)
			request.body.authMember = { ...authMember, ...currentMember };
			return true;
		}

		return false;
	}
}
