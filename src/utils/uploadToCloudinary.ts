import cloudinary from 'cloudinary';
import { env } from './env.js';
import { CLOUDINARY } from '../constans/constans.js';
import * as fs from 'fs/promises';

interface CloudinaryData {
  id: string;
  filename: string;
  url: string;
}

type CloudinaryRes = {
  name: string;
  desk?: CloudinaryData;
  tab?: CloudinaryData;
  mob?: CloudinaryData;
  thumb?: CloudinaryData;
};

cloudinary.v2.config({
  secure: true,
  cloud_name: env(CLOUDINARY.CLOUD_NAME),
  api_key: env(CLOUDINARY.API_KEY),
  api_secret: env(CLOUDINARY.API_SECRET),
  settings: { folder_mode: true },
});

export const uploadToCloudinary = async (filePath: string): Promise<string> => {
  const response = await cloudinary.v2.uploader.upload(filePath);

  await fs.unlink(filePath);

  return response.secure_url;
};

export const getBackgrounds = async (): Promise<Array<CloudinaryRes>> => {
  const types = ['desk', 'tab', 'mob', 'thumb'];

  const resourcesByType = await Promise.all(
    types.map(async (type) => {
      const result = await cloudinary.v2.search
        .expression(`asset_folder=task-pro/bg-img/${type}`)
        .max_results(100)
        .execute();

      return result.resources
        .map((res: any) => {
          const baseName = res.filename.replace(
            new RegExp(`-${type}(_.*)?$`),
            '',
          );

          if (baseName === res.filename) return null;

          return {
            baseName,
            type,
            data: {
              id: res.asset_id,
              filename: res.filename,
              url: res.url,
            },
          };
        })
        .filter((item: any) => item !== null);
    }),
  );

  const allResources = resourcesByType.flat();

  const grouped: Record<string, any> = {};

  allResources.forEach((res) => {
    if (!grouped[res.baseName]) grouped[res.baseName] = {};
    grouped[res.baseName][res.type] = res.data;
  });

  const backgroundsArray = Object.entries(grouped).map(([name, urls]) => ({
    name,
    ...urls,
  }));

  return backgroundsArray;
};
