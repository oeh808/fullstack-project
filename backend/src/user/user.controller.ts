import { Body, Controller, Post, Session, Get, Patch, Delete, Param, Query, Headers, UseGuards, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { User } from './user.schema';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class UserController {
    constructor(private userService: UserService) {}

    @Post('/signup')
    async signUp(@Body() body: CreateUserDto) {
        try{
            const user = await this.userService.signUp(body.userID, body.email, body.password);
        return user;
        }catch(error){
            return new BadRequestException(error.message);
        }
    }

    @Post('/signin')
    async signIn(@Body() body: Partial<User>) {
        try{
            const user = await this.userService.signIn(body.email, body.password);
            return user;
        }catch(error){
            return new UnauthorizedException(error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('WhoAmI')
    async whoAmI (@Headers('authorization') header: string) {
        try{
            return await this.userService.whoAmI(header.split(' ')[1]);
        }catch(error){
            return new BadRequestException(error.message);
        }
        
    }
}
