import { CloudinaryService } from '../../infrastructure/cloudinary.service';
export declare class CoursesCoverController {
    private readonly cloudinary;
    constructor(cloudinary: CloudinaryService);
    uploadCover(file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
