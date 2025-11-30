import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class CloudinaryService {
  async uploadImage(filePath: string): Promise<string> {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'course_covers',
      resource_type: 'image',
    });
    return result.secure_url;
  }
}
