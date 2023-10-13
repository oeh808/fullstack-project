import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { TaskPriority, TaskStatus } from "../../constants/enums";


export class EditTaskDto {
    @IsString()
    @IsOptional()
    title : string;

    @IsEnum(TaskStatus)
    @IsOptional()
    status: TaskStatus;

    @IsNumber()
    @IsOptional()
    timeSpent: number;

    @IsEnum(TaskPriority)
    @IsOptional()
    priority: TaskPriority

    @IsString()
    @IsOptional()
    dueDate: string;
}