import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
const scrypt = promisify(_scrypt);
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserService {

    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async signUp(userID: number, email: string, password: string) {
        // User is created in the data base
        const user = await this.userModel.create({userID, email, password});

        // Password is hashed using a randomly generated salt
        const salt = randomBytes(8).toString('hex');
        const hash = (await scrypt(password, salt, 32)) as Buffer;

        // Password is stored in its hashed state with the salt user to hash it
        password = salt + '.' + hash.toString('hex');
        user.password = password;

        return user.save();
    }

    async signIn(email: string, password: string) {
        const user = await this.userModel.findOne({email: email});
        if (!user) {
            return new NotFoundException("User not found.");
        }
        
        // Password is split to seperate the hash and the salt
        const [salt, storedHash] = user.password.split('.');

        // Inserted password is hashed using the same salt as the stored password to compare the inserted password with the stored one
        const hash = (await scrypt(password, salt, 32)) as Buffer;

        if (hash.toString('hex') !== storedHash){
            throw new BadRequestException("Incorrect Password")
        }
        return user;
    }
}
