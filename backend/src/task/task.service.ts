import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Task } from './task.schema';
import { Model, PipelineStage } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.schema';
import { CreateTaskDto } from './dtos/create-task.dto';
import { EditTaskDto } from './dtos/edit-task.dto';
import { TaskStatus } from 'src/constants/enums';
import { SearchTaskDto } from './dtos/search-task.dto';

@Injectable()
export class TaskService {
    constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

    async create(dto: CreateTaskDto, header: string) {
        const userId = this.extractId(header);
        const taskId = await this.generateID();

        if(!dto.dueDate){
            return await this.taskModel.create({id: taskId, title: dto.title, priority : dto.priority, userID: userId})
        }else{
            return await this.taskModel.create({ id: taskId, title: dto.title, priority: dto.priority, dueDate: new Date(dto.dueDate), userID: userId })
        }
    }

    async findOne(id: number, header: string) {
        const userId = this.extractId(header);
        const task = await this.taskModel.findOne({id: id, userID: userId});

        if(!task){
            return new UnauthorizedException("You do not have a task with this id.");
        }

        return task;
    }

    async find (dto: SearchTaskDto, header: string) {
        const userId = parseInt(this.extractId(header));
        if(!dto.title){
            dto.title = "";
        }
        
        const stages: PipelineStage[] = [
            {
                $match: {
                    title: { 
                        $regex: dto.title, $options: 'i' 
                    },
                    userID: {
                        $eq: userId
                    }
                }
            }
        ]

        // If there are statuses in the dto, filter by statuses
        if(dto.statuses){
            stages.push(
                {
                    $match: { 
                        status : {
                            $in: dto.statuses
                        }
                    }
                }
            )
        }

        // If there are prioties in the dto, filter by priotrities
        if(dto.priorities){
            stages.push(
                {
                    $match: {
                        priority: {
                            $in: dto.priorities
                        }
                    }
                }
            )
        }

        // If there is a set due date in the dto, filter by the due date
        if(dto.dueDate){
            stages.push(
                {
                    $match: {
                        dueDate: {
                            $eq: new Date(dto.dueDate)
                        }
                    }
                }
            )
        }

        const res = await this.taskModel.aggregate(stages);

        return res;
    }

    async update(id: number, dto: EditTaskDto, header: string) {
        const userId = this.extractId(header);
        const task = await this.taskModel.findOne({id: id, userID: userId});

        if(!task){
            return new UnauthorizedException("You do not have a task with this id.");
        }

        Object.assign(task,dto);
        if(dto.dueDate){
            task.dueDate = new Date(dto.dueDate);
        }

        await this.taskModel.updateOne({id: id}, task, {new: true});

        return task;
    }

    async delete(id: number, header: string) {
        const userId = this.extractId(header);
        const task = await this.taskModel.findOne({id: id, userID: userId});

        if(!task){
            return new UnauthorizedException("You do not have a task with this id.");
        }

        await this.taskModel.deleteOne({id: id});

        return task;
    }

    async clockIn(id: number, header: string){
        const userId = this.extractId(header);
        const task = await this.taskModel.findOne({id: id, userID: userId});

        if(!task){
            return new UnauthorizedException("You do not have a task with this id.");
        }

        switch(task.status) {
            case TaskStatus.IN_PROGRESS:
                return new BadRequestException("You are already clocked in to this task.");
            case TaskStatus.DONE:
                return new BadRequestException("You have already finished this task.")
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
            return new UnauthorizedException("You do not have a task with this id.");
        }

        switch(task.status) {
            case TaskStatus.OPEN:
                return new BadRequestException("You can only clock in to one task at a time.");
            case TaskStatus.DONE:
                return new BadRequestException("You have already finished this task.")
            default: // Status must be in progress, therefore the task is clocked in
                // Continue as normal
        }


        await this.taskModel.updateOne({id: id}, {timeSpent: (task.timeSpent + time), status: TaskStatus.OPEN}, {returnDocument: "after"});
        return this.calculateTime(task.timeSpent);
    }

    extractId(token: string) {
        const temp = atob(token.split('.')[1]);
        const id = temp.split(',')[0].split(':')[1];
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
