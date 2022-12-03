import { v4 as uuid } from 'uuid';

export const fileNamer = (
  req: any,
  file: {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  },
  callback: (error: Error, fileName: string) => void,
) => {
  if (!file) return callback(new Error('file is required'), 'false');

  const fileExt = file.mimetype.split('/')[1];

  const filename = `${uuid()}.${fileExt}`;

  callback(null, filename);
};
