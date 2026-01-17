import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from '../users/dto/create-user.input';
import { LoginInput } from './dto/login.input';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async login(loginInput: LoginInput) {
    const user = await this.validateUser(loginInput.email, loginInput.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      country: user.country,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async signup(createUserInput: CreateUserInput) {
    const user = await this.usersService.create(createUserInput);
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      country: user.country,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
