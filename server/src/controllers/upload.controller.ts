import type { Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";
import type { AuthedRequest } from "../middleware/auth.js";
import { config } from "../config.js";
import { ApiError } from "../middleware/error.js";

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadImage = async (req: AuthedRequest, res: Response) => {
  if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
    throw new ApiError(500, "Cloudinary is not configured on the server");
  }
  if (!req.file) throw new ApiError(400, "No file uploaded");

  const result: UploadApiResponse = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "flowdesk",
        resource_type: "auto",
      },
      (err, result) => (err ? reject(err) : resolve(result as UploadApiResponse))
    );
    stream.end(req.file!.buffer);
  });

  res.status(201).json({
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  });
};
