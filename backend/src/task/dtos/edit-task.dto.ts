import { IsDate, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { TaskStatus } from "src/constants/enums";


export class EditTaskDto {
    @IsString()
    @IsOptional()
    title : string;

    @IsEnum(TaskStatus)
    @IsOptional()
    status: TaskStatus;

    @IsNumber()
    @IsOptional()
    time: number;

    @IsNumber()
    @IsOptional()
    userID: number;
}