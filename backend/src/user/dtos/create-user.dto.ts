import { IsEmail, IsString, IsOptional, IsNumber } from "class-validator";

export class CreateUserDto {
    @IsNumber()
    userID: number;

    @IsEmail()
    email: string;

    @IsString()
    password: string;
}