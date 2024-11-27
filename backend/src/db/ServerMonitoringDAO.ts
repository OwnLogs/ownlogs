import { Server, ServerMonitoring } from '../../../shared/types';
import DB from '.';
import Logger from '../logger';

class ServerMonitoringDAO {
  async createServerMonitoring(
    serverId: number,
    {
      timestamp,
      duration,
      error
    }: { timestamp: Date; duration: number; hasTimedOut: boolean; error: string | null }
  ) {
    try {
      const sql = `
        INSERT INTO serverMonitoring (serverId, duration, error, timestamp)
        VALUES (?, ?, ?, ?)
      `;
      const params = [serverId, duration, error, timestamp];
      await DB.execute(sql, params);
    } catch {
      Logger.error('Error creating server monitoring');
    }
  }

  async getAllMonitoredServers(): Promise<Server[]> {
    try {
      const sql = `
        SELECT
          *
        FROM server
        WHERE monitored = 1
        AND publicUrl IS NOT NULL
        AND publicUrl <> ''
        ORDER BY id ASC;
      `;
      const rows = await DB.query(sql);
      return rows as Server[];
    } catch (error) {
      console.error('Error getting all monitored servers:', error);
      return [];
    }
  }

  async getServersStatuses(): Promise<{ server: Server; online: boolean }[]> {
    const servers = await this.getAllMonitoredServers();
    const serverStatuses = (await Promise.all(
      servers.map(async (server) => {
        if (!server.publicUrl || server.id === undefined) return;
        try {
          const sql = `
            SELECT *
            FROM serverMonitoring
            WHERE serverId = ?
            LIMIT 1
          `;
          const rows = await DB.query(sql, [server.id]);
          if (rows.length === 0) {
            return null;
          }
          return { server, online: rows[0].error === null };
        } catch (error) {
          console.error('Error getting server surveillance by serverId:', error);
          return null;
        }
      })
    )) as { server: Server; online: boolean }[];
    return serverStatuses;
  }
}

export default new ServerMonitoringDAO();
