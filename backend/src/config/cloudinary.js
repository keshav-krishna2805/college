import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { config } from './env.config.js';

cloudinary.config({ 
  cloud_name: config.cloudinaryCloudName, 
  api_key: config.cloudinaryApiKey, 
  api_secret: config.cloudinaryApiSecret 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export { uploadOnCloudinary };
