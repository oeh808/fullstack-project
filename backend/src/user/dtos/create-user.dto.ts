import { IsEmail, IsString, IsOptional, IsNumber } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}