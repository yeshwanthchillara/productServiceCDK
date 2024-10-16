import { v4 as uuidv4 } from 'uuid';
import { uploadImageToS3 } from '../services/s3Utility';

export const imageUploader = async (images: any[]) => {
    // Handle image uploads to S3
    const imageKeys = await Promise.all(
        images.map(async (image: any) => {
            const { createReadStream, mimetype } = await image;
            const filename = uuidv4();
            const imageExtension = mimetype.split('/')[1];
            const key = `Product-Images/${filename}.${imageExtension}`;
            const stream = createReadStream();

            const buffer: any = await new Promise((resolve, reject) => {
                const chunks: Buffer[] = [];
                stream.on('data', (chunk: Buffer) => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            });

            return uploadImageToS3(buffer, key);
        })
    );

    return imageKeys
}