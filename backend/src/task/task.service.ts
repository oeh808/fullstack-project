import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Task } from './task.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.schema';
import { CreateTaskDto } from './dtos/create-task.dto';
import { EditTaskDto } from './dtos/edit-task.dto';

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

        const {clockedIn} = task;
        if(clockedIn){
            throw new BadRequestException("You have already clocked in for this task");
        }

        await this.taskModel.updateOne({id: id}, {clockedIn: true}, {returnDocument: "after"});

        return "Timer started...";
    }

    async clockOut(id: number, header: string){
        const userId = this.extractId(header);
        const task = await this.taskModel.findOne({id: id, userID: userId}).select(["id","time", "timeSpent", "clockedIn"]);
        if(!task){
            throw new UnauthorizedException("You do not have a task with this id.");
        }

        const { time, timeSpent, clockedIn } = task;

        console.log(clockedIn);
        if(!clockedIn){
            throw new BadRequestException("You have already clocked out for this task");
        }

        const diff = Date.now() - time;
        await this.taskModel.updateOne({id: id}, {time: Date.now(), timeSpent: (timeSpent + diff), clockedIn: false}, {returnDocument: "after"});

        return this.calculateTime(timeSpent + diff);
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
}
