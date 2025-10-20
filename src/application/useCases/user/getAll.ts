import { userRepository } from "domain/repositories/userRepository";
import {user} from '../../../domain/entities/userEntity'
export class getAllUserCase{
    constructor(private readonly userRepo: userRepository){}

    async execute(): Promise<user[]>{
        return this.userRepo.findAll()

    }

}