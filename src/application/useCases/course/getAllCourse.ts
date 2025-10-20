import { courseRepository } from '../../../domain/repositories/courseRepository';
import { course } from '../../../domain/entities/courseEntity';
import { user } from 'domain/entities/userEntity';
import { userRepository } from 'domain/repositories/userRepository';


export class getAllCourseCase{
    constructor(private readonly courseRepo: courseRepository){}

    async execute(): Promise<course[]>{
        return this.courseRepo.findAll()

    }

}