import { userRepository } from "domain/repositories/userRepository";
import {user} from '../../../domain/entities/userEntity'
export class getUserUseCase{
    constructor (private readonly userRepo: userRepository){}

    async execute(codigo:string): Promise<user>{
        const user = await this.userRepo.findById(codigo);
        if(!user) throw new Error('User not found');
        return user;
    }
}

