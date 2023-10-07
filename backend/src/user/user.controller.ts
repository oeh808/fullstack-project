import { Body, Controller, Post, Session, Get, Patch, Delete, Param, Query, Headers, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.schema';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
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

    @UseGuards(JwtAuthGuard)
    @Get('WhoAmI')
    whoAmI (@Headers('authorization') header: string) {
        return this.userService.whoAmI(header.split(' ')[1]);
    }
}
