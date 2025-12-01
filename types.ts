export enum AspectRatio {
  SQUARE = '1:1',
  PORTRAIT = '3:4',
  LANDSCAPE = '4:3',
  WIDE = '16:9',
  TALL = '9:16',
}

export enum ImageStyle {
  NONE = 'None',
  CINEMATIC = 'Cinematic',
  PHOTOGRAPHY = 'Photography',
  ANIME = 'Anime',
  FANTASY = 'Fantasy Art',
  ILLUSTRATION = 'Illustration',
  THREE_D = '3D Render',
}

export type Theme = 'light' | 'dark';

export type Page = 'ai-engine' | 'generator' | 'profile';

export enum AiModel {
  P3 = 'Dorak P3',
  P100k = 'Dorak 100k',
  Infinity = 'Dorak Infinity',
  Research = 'Research',
  CreateImage = 'Create Image',
}

export type ChatMessagePart = {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string;
    };
};

export type Source = {
    uri: string;
    title: string;
};

export interface ChatMessage {
    role: 'user' | 'model';
    parts: ChatMessagePart[];
    sources?: Source[];
}