import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {


constructor(){

super({

jwtFromRequest:
ExtractJwt.fromAuthHeaderAsBearerToken(),


ignoreExpiration:false,


secretOrKey:'SECRET_KEY_CHANGE_ME',

});

}



validate(payload:any){

return {
  id: payload.userId ?? payload.sub,
  username: payload.username,
  role: payload.role,
  tenantId: payload.tenantId,
};

}


}