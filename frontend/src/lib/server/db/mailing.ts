import db from '.';

export async function setMailing(userId: number, serverId: number, enabled: boolean): Promise<boolean> {
  try {
    await db.query('UPDATE emailing SET enabled = ? WHERE userId = ? AND serverId = ?', [
      enabled, userId,
      serverId,
      enabled
    ]);
    return true;
  } catch {
    return false;
  }
}
