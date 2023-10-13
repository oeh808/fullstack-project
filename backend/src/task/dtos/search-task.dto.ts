import { IsArray, IsOptional, IsString } from "class-validator";
import { TaskPriority, TaskStatus } from "src/constants/enums";


export class SearchTaskDto {
    @IsString()
    @IsOptional()
    title: string;

    @IsArray()
    @IsOptional()
    statuses: TaskStatus[];

    @IsArray()
    @IsOptional()
    priorities: TaskPriority[];

    @IsString()
    @IsOptional()
    dueDate: string;
}