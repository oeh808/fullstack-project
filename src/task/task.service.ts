import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Task } from './task.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.schema';
import { CreateTaskDto } from './dtos/create-task.dto';

@Injectable()
export class TaskService {
    constructor(private jwtService: JwtService, @InjectModel(Task.name) private taskModel: Model<Task>, @InjectModel(User.name) private userModel: Model<User>) {}

    async create(dto: CreateTaskDto, header: string) {
        const userId = this.extractId(header);
        const task = await this.taskModel.create({...dto, userID: userId})

        return task;
    }

    async findOne(id: number, header: string) {
        const userId = this.extractId(header);
        const task = await this.taskModel.findOne({id: id, userID: userId});

        if(!task){
            throw new UnauthorizedException("You do not have a task with this id.");
        }

        return task;
    }

    async find (title: string, header: string) {
        const userId = this.extractId(header);
        const tasks = await this.taskModel.find({ "title" : { $regex: title, $options: 'i' }, userID: userId });

        return tasks;
    }


    extractId(token: string) {
        const temp = atob(token.split('.')[1]);
        const id = temp.split(',')[0].slice(-1);
        return id;
    }
}
