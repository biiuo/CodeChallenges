import { Controller, Post, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CloudinaryService } from '../../infrastructure/cloudinary.service';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

@Controller('courses/cover')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class CoursesCoverController {
  constructor(private readonly cloudinary: CloudinaryService) {}

  @Post('upload')
  @Roles('ADMIN', 'PROFESSOR')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: '/tmp',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `cover-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    })
  )
  async uploadCover(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No file uploaded');
    const url = await this.cloudinary.uploadImage(file.path);
    
    // Eliminar archivo temporal
    const fs = require('fs');
    fs.unlinkSync(file.path);
    
    return { url };
  }
}
