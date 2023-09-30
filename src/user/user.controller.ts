import { Body, Controller, Post, Session, Get, Patch, Delete, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.schema';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Post('/signup')
    async signUp(@Body() body: CreateUserDto) {
        const user = await this.userService.signUp(body.userID, body.email, body.password);

        return user;
    }

    @Post('/signin')
    async signIn(@Body() body: Partial<User>) {
        const user = await this.userService.signIn(body.email, body.password);

        return user;
    }
}
