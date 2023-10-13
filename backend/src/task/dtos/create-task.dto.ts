import { IsEmail, IsString, IsOptional, IsNumber, IsEnum, isNumber, IsDate } from "class-validator";
import { TaskPriority, TaskStatus } from "src/constants/enums";

export class CreateTaskDto {
    @IsString()
    title : string;

    @IsEnum(TaskPriority)
    @IsOptional()
    priority: TaskPriority

    @IsString()
    @IsOptional()
    dueDate: string;
}