import { API_URL } from '$lib/constants';
import { getServerById, deleteServer, updateServer } from '$lib/server/db/server';
import type { PageServerLoad, Actions } from './$types';
import { error, redirect, fail } from '@sveltejs/kit';
import { findServerMonitoringByServerId } from '$lib/server/db/monitoring';
import { setMailing } from '$lib/server/db/mailing';
import { hasPermission, PERMISSIONS } from '@shared/roles';

export const load = (async ({ params, locals: { user } }) => {
  const { id } = params;

  if (!user) {
    throw error(401, 'Unauthorized');
  }

  try {
    const server = await getServerById(user?.id, parseInt(id));
    if (!server) {
      throw error(404, 'Server not found');
    }
    const monitoring = await findServerMonitoringByServerId(parseInt(id));
    return { server: server.server, mailingEnabled: server.mailingEnabled, monitoring };
  } catch (err: unknown) {
    console.log(err);
    throw error(500, err as string);
  }
}) satisfies PageServerLoad;

export const actions: Actions = {
  deleteServer: async ({ params: { id }, locals: { user } }) => {
    if (!hasPermission(user?.role, PERMISSIONS.DELETE_SERVER)) {
      return fail(403, { error: true, message: 'Forbidden' });
    }

    try {
      const success = await deleteServer(parseInt(id));

      if (!success) {
        return fail(500, { error: true, message: 'Failed to delete server' });
      }
    } catch (err: unknown) {
      fail(500, { error: true, message: err as string });
    }

    // Notify the backend that a new server was deleted to update the cache
    try {
      const res = await fetch(API_URL + '/deletedServer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: id })
      });

      if (!res.ok) {
        return fail(500, { error: true, message: 'Failed to delete server' });
      }
    } catch (err: unknown) {
      return fail(500, { error: true, message: err as string });
    }

    throw redirect(303, '/app/servers');
  },
  editServer: async ({ params: { id }, request, locals: { user } }) => {
    if (!user) {
      return fail(401, { error: true, message: 'Unauthorized' });
    }
    if (!hasPermission(user.role, PERMISSIONS.UPDATE_SERVER)) {
      return fail(403, { error: true, message: 'Forbidden' });
    }
    const formData = Object.fromEntries(await request.formData());
    const {
      deleteServerNameInput: name,
      deleteServerDescriptionInput: description,
      deleteServerPublicUrlInput: publicUrl,
      emailAlerts,
      monitored
    } = formData as {
      deleteServerNameInput: string;
      deleteServerDescriptionInput: string;
      deleteServerPublicUrlInput: string;
      emailAlerts: string;
      monitored: string;
    };

    const isMonitored = monitored === 'on';

    try {
      const status = await updateServer(parseInt(id), {
        name,
        description,
        publicUrl,
        monitored: isMonitored
      });

      if (!status) {
        return fail(500, { error: true, message: 'Failed to update server' });
      }

      const emailingStatus = await setMailing(user.id, parseInt(id), emailAlerts === 'true');

      if (!emailingStatus) {
        return fail(500, { error: true, message: 'Failed to update server' });
      }

      return { success: true, message: 'Server updated' };
    } catch (error) {
      return fail(500, { error: true, message: error as string });
    }
  }
};
