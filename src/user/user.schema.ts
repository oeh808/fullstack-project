import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class User {
    @Prop({ required: [true, "User ID required."], unique: true, trim: true  })
    userID: number;
    
    @Prop({ required: [true, "Email required."], unique: true, trim: true  })
    email: string;

    @Prop({ required: [true, "Password required."], trim: true})
    password: string;
}

export type userDocument = HydratedDocument<User>;

export const userSchema = SchemaFactory.createForClass(User);