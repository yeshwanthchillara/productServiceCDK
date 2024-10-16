import * as AWS from 'aws-sdk';
import { ManagedUpload, ObjectKey } from 'aws-sdk/clients/s3';

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export const uploadImageToS3 = async (image: Body, key: ObjectKey) => {
    return new Promise((resolve, reject) => {
        const params = { Bucket: BUCKET_NAME, Key: key, Body: image };
        s3.upload(params, function (error: Error, data: ManagedUpload.SendData) {
            if (error) {
                console.log('Unable to Upload Image ' + error)
                reject('Unable to Upload Image ' + error)
            } else {
                resolve(data)
            }
        });
    })
}