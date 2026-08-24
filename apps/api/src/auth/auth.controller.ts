import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { Public } from '../common/rbac/public.decorator.js';
import { CurrentUser, type AuthUser } from '../common/rbac/current-user.decorator.js';
import { AuthService } from './auth.service.js';
import { LoginDto, RefreshDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  /** Profilo dell'utente autenticato (route protetta dal JwtAuthGuard globale). */
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}
