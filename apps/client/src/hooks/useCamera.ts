import { useCallback } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { shrinkImage } from '../helpers/image';

type PhotoOptions = { source?: CameraSource; maxSize?: number };

export function useCamera() {
  const takePhoto = useCallback(async ({ source = CameraSource.Prompt, maxSize = 800 }: PhotoOptions = {}) => {
    try {
      const photo = await Camera.getPhoto({ quality: 70, source, resultType: CameraResultType.DataUrl });
      return photo.dataUrl ? await shrinkImage(photo.dataUrl, maxSize, 0.6) : null;
    } catch {
      return null;
    }
  }, []);
  return { takePhoto };
}
