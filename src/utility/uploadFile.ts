import { v2 as cloudinary } from "cloudinary";
import { generateRandomString, generateRandomStringWithoutCharacter } from "./stringUtility";
import dotenv from "dotenv";
import { loggerErrorData } from "./errorLogger";

dotenv.config(); //{ path: __dirname + '../../.env' }

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadingAvatar = async (imageBase64: string) => {
  let filename = generateRandomStringWithoutCharacter(20);
  // return cloudinary.uploader.upload(imageBase64,
  //   { public_id: `${filename}`, resource_type: 'image'})
  //   .then((result) => {
  //       return result
  //   }).catch((error: any) => {
  //       throw new Error('Image Uploading Failed')
  //   });
  return new Promise((resovle, reject) => {
    cloudinary.uploader
      .upload(imageBase64, { public_id: `${filename}`, resource_type: "image" })
      .then((result) => {
        resovle(result.url);
      })
      .catch((error: any) => {
        loggerErrorData(error);
        reject("Image Uploading Failed");
      });
  });
};
