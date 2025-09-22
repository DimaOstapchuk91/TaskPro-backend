import cloudinary from 'cloudinary';
import { env } from './env.js';
import { CLOUDINARY } from '../constans/constans.js';
import * as fs from 'fs/promises';

cloudinary.v2.config({
  secure: true,
  cloud_name: env(CLOUDINARY.CLOUD_NAME),
  api_key: env(CLOUDINARY.API_KEY),
  api_secret: env(CLOUDINARY.API_SECRET),
});

export const uploadToCloudinary = async (filePath: string): Promise<string> => {
  const response = await cloudinary.v2.uploader.upload(filePath);

  await fs.unlink(filePath);

  return response.secure_url;
};

export const getBackgrounds = async (): Promise<
  Array<{
    name: string;
    desk?: string;
    tab?: string;
    mob?: string;
    thumb?: string;
  }>
> => {
  const desk = await cloudinary.v2.api.resources({
    type: 'upload',
    prefix: 'bg-img/desk',
    max_results: 100,
  });
  const tab = await cloudinary.v2.api.resources({
    type: 'upload',
    prefix: 'bg-img/tab',
    max_results: 100,
  });
  const mob = await cloudinary.v2.api.resources({
    type: 'upload',
    prefix: 'bg-img/mob',
    max_results: 100,
  });
  const thumb = await cloudinary.v2.api.resources({
    type: 'upload',
    prefix: 'bg-img/thumb',
    max_results: 100,
  });

  const allResources = [
    ...desk.resources,
    ...tab.resources,
    ...mob.resources,
    ...thumb.resources,
  ];

  const grouped: Record<string, any> = {};

  allResources.forEach((res) => {
    const fileName = res.public_id.split('/').pop();
    const baseName = fileName?.replace(/-(desk|tab|mob|thumb)$/, '');
    if (!baseName) return;

    if (!grouped[baseName]) grouped[baseName] = {};

    if (fileName.endsWith('-desk')) grouped[baseName].desk = res.secure_url;
    if (fileName.endsWith('-tab')) grouped[baseName].tab = res.secure_url;
    if (fileName.endsWith('-mob')) grouped[baseName].mob = res.secure_url;
    if (fileName.endsWith('-thumb')) grouped[baseName].thumb = res.secure_url;
  });

  const backgroundsArray = Object.entries(grouped).map(([name, urls]) => ({
    name,
    ...urls,
  }));

  return backgroundsArray;
};
