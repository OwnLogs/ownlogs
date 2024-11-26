import db from './';
import { type ResultSetHeader, type RowDataPacket } from 'mysql2';
import { type Server } from '@shared/types';

const isServerOnline = async (server: Server): Promise<boolean> => {
  if (!server.publicUrl) {
    return false;
  }
  try {
    const res = await fetch(server.publicUrl);
    return res.status === 200;
  } catch {
    return false;
  }
};

export async function getAllServers(): Promise<Server[]> {
  const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM server');

  const servers = rows as Server[];
  for (const server of servers) {
    server.isOnline = await isServerOnline(server);
  }
  return servers;
}

export async function getServerById(
  userId: number,
  id: number
): Promise<{ server: Server; mailingEnabled: boolean } | null> {
  const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM server WHERE id = ?', [id]);
  const [mailingEnabled] = await db.query<RowDataPacket[]>(
    'SELECT enabled FROM emailing WHERE userId = ? AND serverId = ?',
    [userId, id]
  );

  if (rows.length === 0) return null;
  const server = rows[0] as Server;
  server.isOnline = await isServerOnline(server);
  return { server, mailingEnabled: mailingEnabled[0].enabled === 1 };
}

export async function createServer(userId: number, server: Server): Promise<ResultSetHeader> {
  const [result] = await db.query('INSERT INTO server SET ?', server);
  await db.query('INSERT INTO emailing(`userId`, `serverId`) VALUES (?, ?)', [
    userId,
    (result as ResultSetHeader).insertId
  ]);
  return result as ResultSetHeader;
}

export async function deleteServer(id: number): Promise<boolean> {
  try {
    const [emailingResult] = await db.query('DELETE FROM emailing WHERE serverId = ?', [id]);

    if ((emailingResult as ResultSetHeader).affectedRows < 1) {
      return false;
    }
    
    const [result] = await db.query('DELETE FROM server WHERE id = ?', [id]);

    return (result as ResultSetHeader).affectedRows >= 1;
  } catch {
    return false;
  }
}

export async function updateServer(id: number, server: Server): Promise<boolean> {
  try {
    const [result] = await db.query('UPDATE server SET ? WHERE id = ?', [server, id]);

    return (result as ResultSetHeader).affectedRows >= 1;
  } catch {
    return false;
  }
}
