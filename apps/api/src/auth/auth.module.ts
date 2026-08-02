import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';


@Module({

imports:[
 JwtModule.register({
   global:true,
   secret:'SECRET_KEY_CHANGE_ME',
   signOptions:{
     expiresIn:'1d'
   }
 })
],


controllers:[
 AuthController
],


providers:[
 AuthService,
 JwtStrategy
]


})
export class AuthModule {}