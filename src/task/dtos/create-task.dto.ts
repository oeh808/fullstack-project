import { IsEmail, IsString, IsOptional, IsNumber, IsEnum, isNumber, IsDate } from "class-validator";
import { TaskStatus } from "src/constants/enums";

export class CreateTaskDto {
    @IsNumber()
    id: number

    @IsString()
    title : string;
}