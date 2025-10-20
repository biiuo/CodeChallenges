import {userRepository} from "../../../domain/repositories/userRepository";
import {user} from "../../../domain/entities/userEntity";

export class updateUserUseCase{
    constructor(private readonly userRepo: userRepository){}
    async execute(user: user): Promise<user>{
        const existingUser = await this.userRepo.findById(user.codigo);
        if(!existingUser) throw new Error('User not found');
        Object.assign(existingUser, user);//copia los datos del user (user data nuevo) sobre el existinguser
        await this.userRepo.update(existingUser);
        return existingUser;
    }
}
