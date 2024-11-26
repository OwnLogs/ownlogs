import ServerMonitoringDAO from './db/ServerMonitoringDAO';

export async function monitorServers() {
  const servers = await ServerMonitoringDAO.getAllMonitoredServers();

  for (const server of servers) {
    if (!server.publicUrl || !server.id)return;
    const isOnline = await checkServerStatus(server.publicUrl);
    // Insert data into the database
    await ServerMonitoringDAO.createServerMonitoring(server.id, isOnline);
  }
}

const checkServerStatus = async(url: string) => {
  try {
    const res = await fetch(url);
    return res.status === 200;
  } catch {
    return false;
  }
}
