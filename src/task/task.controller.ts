import { Body, Controller, Post, Session, Get, Patch, Delete, Param, Query, Headers, UseGuards, Put } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { JwtAuthGuard } from '../user/auth/jwt-auth.guard';
import { SearchTaskDto } from './dtos/search-task.dto';

@Controller('task')
export class TaskController {
    constructor(private taskService: TaskService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    createTask(@Body() body: CreateTaskDto, @Headers('authorization') header: string) {
        return this.taskService.create(body, header);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    getTask(@Param('id') id: string, @Headers('authorization') header: string) {
        return this.taskService.findOne(parseInt(id), header);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    // Search by title
    getAllTasks(@Body() body: SearchTaskDto, @Headers('authorization') header: string) {
        return this.taskService.find(body.title, header);
    }

    @UseGuards(JwtAuthGuard)
    @Patch()
    editTask() {

    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    deleteTask() {

    }
}
