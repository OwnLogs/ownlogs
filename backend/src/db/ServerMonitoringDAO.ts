import { Server, ServerMonitoring } from '../../../shared/types';
import DB from '.';

class ServerMonitoringDAO {
  async findServerMonitoringByServerId(
    serverId: number,
    start: Date,
    end: Date
  ): Promise<ServerMonitoring | null> {
    if (!serverId) {
      return null;
    }
    try {
      const sql = `
        SELECT *
        FROM serverMonitoring
        WHERE serverId = ?
        ${start ? 'AND timestamp >= ?' : ''}
        ${end ? 'AND timestamp <= ?' : ''}
      `;
      const rows = await DB.query(sql, [serverId, start, end]);
      if (rows.length === 0) {
        return null;
      }
      return rows[0] as ServerMonitoring;
    } catch (error) {
      console.error('Error getting server surveillance by serverId:', error);
      return null;
    }
  }

  async createServerMonitoring(serverId: number, isOnline: boolean): Promise<ServerMonitoring> {
    const sql = `
      INSERT INTO serverMonitoring (serverId, isOnline)
      VALUES (?, ?)
    `;
    const params = [serverId, isOnline];
    const insertId = await DB.execute(sql, params);
    const serverSurveillance: ServerMonitoring = {
      serverId,
      isOnline,
      id: insertId,
      timestamp: new Date()
    };
    return serverSurveillance;
  }

  async getAllMonitoredServers(): Promise<Server[]> {
    try {
      const sql = `
        SELECT
          *
        FROM server
        WHERE monitored = 1;
      `;
      const rows = await DB.query(sql);
      return rows as Server[];
    } catch (error) {
      console.error('Error getting all monitored servers:', error);
      return [];
    }
  }
}

export default new ServerMonitoringDAO();
