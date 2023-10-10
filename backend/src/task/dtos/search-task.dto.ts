import { IsOptional, IsString } from "class-validator";


export class SearchTaskDto {
    @IsString()
    @IsOptional()
    title: string;
}