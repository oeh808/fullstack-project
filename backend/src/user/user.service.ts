import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
const scrypt = promisify(_scrypt);
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {

    constructor(private jwtService: JwtService, @InjectModel(User.name) private userModel: Model<User>) {}

    async signUp( email: string, password: string) {
        // UserID is randomly generated
        const userID = await this.generateID();
        // User is created in the data base
        const user = await this.userModel.create({userID, email, password});

        // Password is hashed using a randomly generated salt
        const salt = randomBytes(8).toString('hex');
        const hash = (await scrypt(password, salt, 32)) as Buffer;

        // Password is stored in its hashed state with the salt user to hash it
        password = salt + '.' + hash.toString('hex');
        user.password = password;

        const token = await this.jwtService.signAsync({id: user.userID});

        user.save();
        return token;
    }

    async signIn(email: string, password: string) {
        const user = await this.userModel.findOne({email: email}).select(['userID', 'password']);
        if (!user) {
            return new NotFoundException("Incorrect email or password.");
        }
        
        // Password is split to seperate the hash and the salt
        const [salt, storedHash] = user.password.split('.');

        // Inserted password is hashed using the same salt as the stored password to compare the inserted password with the stored one
        const hash = (await scrypt(password, salt, 32)) as Buffer;

        if (hash.toString('hex') !== storedHash){
            return new NotFoundException("Incorrect email or password.")
        }

        const token = await this.jwtService.signAsync({id: user.userID});
        return token;
    }

    async whoAmI(token: string) {
        const id = this.extractId(token);
        const user = await this.userModel.findOne({userID: id});
        return user;
    }

    // { id: 3, iat: 1696189242, exp: 1696275642 }
    extractId(token: string) {
        const temp = atob(token.split('.')[1]);
        const id = temp.split(',')[0].slice(-1);
        return id;
    }

    async generateID() {
        var randId = Math.floor(Math.random() * 9999);
        while(await this.userModel.exists({id: randId})){
            randId = Math.floor(Math.random() * 9999);
        }

        return randId;
    }
}
