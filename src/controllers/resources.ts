import { Request, Response } from 'express';
import { getBackgrounds } from '../utils/uploadToCloudinary ';

export const getBackgroundsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const icons = await getBackgrounds();

  console.log('icons data', icons);

  res.status(200).json({
    status: 200,
    message: 'Successfully icons fetched',
    data: icons,
  });
};
