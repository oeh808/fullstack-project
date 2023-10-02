import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, taskSchema } from './task.schema';
import { User, userSchema } from 'src/user/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: Task.name, schema: taskSchema}]), MongooseModule.forFeature([{name: User.name, schema: userSchema}])],
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule {}
