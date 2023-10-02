import { IsString } from "class-validator";


export class SearchTaskDto {
    @IsString()
    title: string;
}