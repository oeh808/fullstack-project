import { Body, Controller, Post, Session, Get, Patch, Delete, Param, Query, Headers, UseGuards, Put, BadRequestException } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { JwtAuthGuard } from '../user/auth/jwt-auth.guard';
import { SearchTaskDto } from './dtos/search-task.dto';
import { EditTaskDto } from './dtos/edit-task.dto';
import { ClockInTaskDto } from './dtos/clockin-task.dto';

@Controller('task')
export class TaskController {
    constructor(private taskService: TaskService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createTask(@Body() body: CreateTaskDto, @Headers('authorization') header: string) {
        try {
            return await this.taskService.create(body, header);
        }catch(error){
            return new BadRequestException(error.message);
        }
        
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getTask(@Param('id') id: string, @Headers('authorization') header: string) {
        try {
            return await this.taskService.findOne(parseInt(id), header);
        }catch(error){
            return new BadRequestException(error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/search')
    // Search by title
    async getAllTasks(@Body() body: SearchTaskDto, @Headers('authorization') header: string) {
        try {
            return await this.taskService.find(body, header);
        }catch(error){
            return new BadRequestException(error.message);
        }
        
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/:id')
    async editTask(@Param('id') id: string, @Body() body: EditTaskDto, @Headers('authorization') header: string) {
        try {
            return await this.taskService.update(parseInt(id), body, header);
        }catch(error){
            return new BadRequestException(error.message);
        }
        
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async deleteTask(@Param('id') id: string, @Headers('authorization') header: string) {
        try {
            return await this.taskService.delete(parseInt(id), header)
        }catch(error){
            return new BadRequestException(error.message);
        }
        
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/clockin/:id')
    async clockIn(@Param('id') id: string, @Headers('authorization') header: string) {
        try {
            return await this.taskService.clockIn(parseInt(id),header);
        }catch(error){
            return new BadRequestException(error.message);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/clockout/:id')
    async clockOut(@Param('id') id: string, @Body() body: ClockInTaskDto, @Headers('authorization') header: string) {
        try {
            return await this.taskService.clockOut(parseInt(id),parseInt(body.time),header);
        }catch(error){
            return new BadRequestException(error.message);
        }
        
    }
}
