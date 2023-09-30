import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
const scrypt = promisify(_scrypt);

@Schema()
export class User {
    @Prop({ required: [true, "User ID required."], unique: true, trim: true  })
    userID: number;
    
    @Prop({ required: [true, "Email required."], unique: true, trim: true  })
    email: string;

    @Prop({ required: [true, "Password required."], trim: true, select: false })
    // Password will not be returned in api requests              ^^^    ^^^
    password: string;
}

export type userDocument = HydratedDocument<User>;

export const userSchema = SchemaFactory.createForClass(User);

// Middleware to be called whenever a user signs up to hash their password
userSchema.pre('save', async function() {
    if (!this.isModified('password')){
        return;
    }
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(this.password, salt, 32)) as Buffer;
    this.password = salt + '.' + hash.toString('hex');
    console.log(this.password); 
})