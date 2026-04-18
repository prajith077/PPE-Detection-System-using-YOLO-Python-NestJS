import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class VideoService {

  async getVideos() {
    const res = await axios.get('http://127.0.0.1:8000/videos');
    return res.data;
  }

  async process(video: string) {
    const res = await axios.get(`http://127.0.0.1:8000/process/${video}`);
    return res.data;
  }

  async stats(video: string) {
    const res = await axios.get(`http://127.0.0.1:8000/stats/${video}`);
    return res.data;
  }

  getVideo(video: string) {
    return {
      url: `http://127.0.0.1:8000/videos/output_${video}`
    };
  }
}