import { Controller, Get } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class VideoController {
  @Get('/videos')
  getVideos() {
    const videoPath = path.join(__dirname, '../../videos');
    const files = fs.readdirSync(videoPath);

    return { videos: files };
  }
}