import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Task } from './task.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.schema';
import { CreateTaskDto } from './dtos/create-task.dto';
import { EditTaskDto } from './dtos/edit-task.dto';
import { TaskStatus } from 'src/constants/enums';

@Injectable()
export class TaskService {
    constructor(private jwtService: JwtService, @InjectModel(Task.name) private taskModel: Model<Task>, @InjectModel(User.name) private userModel: Model<User>) {}

    async create(dto: CreateTaskDto, header: string) {
        const userId = this.extractId(header);
        const taskId = await this.generateID();
        const task = await this.taskModel.create({id: taskId, title: dto.title, userID: userId})

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
        if (!title){
            title = "";
        }
        const tasks = await this.taskModel.find({ "title" : { $regex: title, $options: 'i' }, userID: userId }).sort({id: 'ascending'});

        return tasks;
    }

    async update(id: number, dto: EditTaskDto, header: string) {
        const userId = this.extractId(header);
        const task = await this.taskModel.findOne({id: id, userID: userId});

        if(!task){
            throw new UnauthorizedException("You do not have a task with this id.");
        }

        Object.assign(task,dto);

        await this.taskModel.updateOne({id: id}, task, {new: true});

        return task;
    }

    async delete(id: number, header: string) {
        const userId = this.extractId(header);
        const task = await this.taskModel.findOne({id: id, userID: userId});

        if(!task){
            throw new UnauthorizedException("You do not have a task with this id.");
        }

        await this.taskModel.deleteOne({id: id});

        return task;
    }

    async clockIn(id: number, header: string){
        const userId = this.extractId(header);
        const task = await this.taskModel.findOne({id: id, userID: userId});

        if(!task){
            throw new UnauthorizedException("You do not have a task with this id.");
        }

        switch(task.status) {
            case TaskStatus.IN_PROGRESS:
                throw new BadRequestException("You have already clocked in for this task");
            case TaskStatus.DONE:
                throw new BadRequestException("You have already finished this task.")
            default: // Status must be open, therefore the task is not clocked in
                // Continue as normal
        }

        await this.taskModel.updateOne({id: id}, {status: TaskStatus.IN_PROGRESS}, {returnDocument: "after"});
        

        return "Timer started...";
    }

    async clockOut(id: number, time: number, header: string){
        const userId = this.extractId(header);
        const task = await this.taskModel.findOne({id: id, userID: userId});
        if(!task){
            throw new UnauthorizedException("You do not have a task with this id.");
        }

        switch(task.status) {
            case TaskStatus.OPEN:
                throw new BadRequestException("You have not clocked in for this task");
            case TaskStatus.DONE:
                throw new BadRequestException("You have already finished this task.")
            default: // Status must be in progress, therefore the task is clocked in
                // Continue as normal
        }


        await this.taskModel.updateOne({id: id}, {timeSpent: (task.timeSpent + time), status: TaskStatus.OPEN}, {returnDocument: "after"});
        return this.calculateTime(task.timeSpent);
    }

    extractId(token: string) {
        const temp = atob(token.split('.')[1]);
        const id = temp.split(',')[0].slice(-1);
        return id;
    }

    // Miliseconds to time conversion as seen at https://bobbyhadz.com/blog/javascript-convert-milliseconds-to-hours-minutes-seconds
    padTo2Digits(num: number) {
        return num.toString().padStart(2, '0');
    }

    calculateTime(milliseconds: number) {
        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        let hours = Math.floor(minutes / 60);

        seconds = seconds % 60;
        minutes = minutes % 60;

        return {
            hours: this.padTo2Digits(hours),
            minutes: this.padTo2Digits(minutes),
            seconds: this.padTo2Digits(seconds)
        }
        //return `${this.padTo2Digits(hours)}:${this.padTo2Digits(minutes)}:${this.padTo2Digits(seconds,)}`;
    }

    // Function to randomly generate a unique id
    async generateID() {
        var randId = Math.floor(Math.random() * 9999);
        while(await this.taskModel.exists({id: randId})){
            randId = Math.floor(Math.random() * 9999);
        }

        return randId;
    }
}
