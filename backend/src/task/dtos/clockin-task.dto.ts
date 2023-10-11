import { IsString } from "class-validator";

export class ClockInTaskDto {
    @IsString()
    time: string;
}