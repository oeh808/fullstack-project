import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { TaskStatus } from '../constants/enums';

@Schema()
export class Task {
    @Prop({ required: [true, "Task must have an id"], unique: true, trim: true })
    id : number;

    @Prop({ required: [true, "Task must have a title"], trim: true })
    title : string;

    @Prop({ type: String, enum: TaskStatus, default: TaskStatus.OPEN })
    status : TaskStatus;

    @Prop({default: 0})
    timeSpent: number;

    @Prop({ required: [true, "Task must have associated User"], trim: true })
    userID : number;
}

export type taskDocument = HydratedDocument<Task>;

export const taskSchema = SchemaFactory.createForClass(Task);