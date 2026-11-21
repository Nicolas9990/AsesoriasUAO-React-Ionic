import { useCallback } from 'react';
import { Camera, CameraResultType } from '@capacitor/camera';

export function useCamera() {
  const takePhoto = useCallback(async () => {
    try {
      const photo = await Camera.getPhoto({ quality: 40, width: 800, resultType: CameraResultType.DataUrl });
      return photo.dataUrl ?? null;
    } catch {
      return null;
    }
  }, []);
  return { takePhoto };
}
