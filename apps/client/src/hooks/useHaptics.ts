import { useCallback } from 'react';
import { Haptics } from '@capacitor/haptics';

export function useHaptics() {
  const vibrate = useCallback(async (duration = 500) => {
    try { await Haptics.vibrate({ duration }); } catch { return; }
  }, []);
  return { vibrate };
}
