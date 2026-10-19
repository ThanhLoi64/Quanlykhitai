import {
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class JwtAuthGuard 
extends AuthGuard('jwt') {
	handleRequest(error: any, user: any, _info: any, context: ExecutionContext) {
		if (error || !user) throw error || new UnauthorizedException();

		const request = context.switchToHttp().getRequest();
		if (user.mustChangePassword && request.route?.path !== '/auth/change-password') {
			throw new ForbiddenException('Bạn phải đổi mật khẩu trước khi tiếp tục');
		}

		return user;
	}
}