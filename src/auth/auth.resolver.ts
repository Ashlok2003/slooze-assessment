import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse } from './dto/login-response';
import { LoginInput } from './dto/login.input';
import { CreateUserInput } from '../users/dto/create-user.input';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(@Args('loginInput') loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }

  @Mutation(() => LoginResponse)
  async signup(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.authService.signup(createUserInput);
  }
}
