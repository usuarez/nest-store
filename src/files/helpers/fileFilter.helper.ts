export const fileFilter = (
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
  callback: (error: Error, acceptFile: boolean) => void,
) => {
  if (!file) return callback(new Error('file is required'), false);
  const fileExt = file.mimetype.split('/')[1];
  const validExt = ['jpg', 'jpeg', 'png'];
  console.log({ fileExtValid: validExt.includes(fileExt) });
  if (!validExt.includes(fileExt)) callback(null, false);

  callback(null, true);
};
