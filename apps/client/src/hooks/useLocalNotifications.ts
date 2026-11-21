import { useCallback } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';

export function useLocalNotifications() {
  const requestPermission = useCallback(async () => {
    try { await LocalNotifications.requestPermissions(); } catch { return; }
  }, []);

  const notify = useCallback(async ({ id, title, body }: { id: number; title: string; body: string }) => {
    try { await LocalNotifications.schedule({ notifications: [{ id, title, body }] }); } catch { return; }
  }, []);

  const schedule = useCallback(async ({ id, title, body, at }: { id: number; title: string; body: string; at: Date }) => {
    try { await LocalNotifications.schedule({ notifications: [{ id, title, body, schedule: { at } }] }); } catch { return; }
  }, []);

  const cancel = useCallback(async (id: number) => {
    try { await LocalNotifications.cancel({ notifications: [{ id }] }); } catch { return; }
  }, []);

  return { requestPermission, notify, schedule, cancel };
}
