import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, taskSchema } from './task.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: Task.name, schema: taskSchema}])],
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule {}
