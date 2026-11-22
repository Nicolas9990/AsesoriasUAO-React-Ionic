import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { shrinkImage } from '../helpers/image';

type PhotoOptions = { source?: CameraSource; maxSize?: number };

export function useCamera() {
  const takePhoto = useCallback(async ({ source = CameraSource.Prompt, maxSize = 800 }: PhotoOptions = {}) => {
    try {
      const photoSource = Capacitor.isNativePlatform() ? source : CameraSource.Photos;
      const photo = await Camera.getPhoto({ quality: 70, source: photoSource, resultType: CameraResultType.DataUrl });
      return photo.dataUrl ? await shrinkImage(photo.dataUrl, maxSize, 0.6) : null;
    } catch {
      return null;
    }
  }, []);
  return { takePhoto };
}
