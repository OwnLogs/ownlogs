export interface Role {
  name: string;
  description: string;
}

export const ROLES = {
	ADMIN: "admin",
	GUEST: "guest",
  OWNER: "owner"
};

export const PERMISSIONS = {
  READ_OTHER_ACCOUNTS: "read:other_accounts",     // Read all other accounts
  CREATE_OTHER_ACCOUNTS: "create:other_accounts", // Create other accounts
  UPDATE_OTHER_ACCOUNTS: "update:other_accounts", // Update other accounts
  DELETE_OTHER_ACCOUNTS: "delete:other_accounts", // Delete other accounts


	READ_LOG: "read:log",     // Read logs
	DELETE_LOG: "delete:log", // Delete logs

  READ_SERVER: "read:server",     // Read servers
	CREATE_SERVER: "create:server", // Create servers
	UPDATE_SERVER: "update:server", // Update servers
	DELETE_SERVER: "delete:server", // Delete servers

  ALL: "*", // All permissions
  ANY: "any", // Any permission
};

const rolePermissions = {
  [ROLES.OWNER]: [
    PERMISSIONS.READ_OTHER_ACCOUNTS,
    PERMISSIONS.CREATE_OTHER_ACCOUNTS,
    PERMISSIONS.UPDATE_OTHER_ACCOUNTS,
    PERMISSIONS.DELETE_OTHER_ACCOUNTS,

    PERMISSIONS.READ_LOG,
    PERMISSIONS.DELETE_LOG,

    PERMISSIONS.READ_SERVER,
    PERMISSIONS.CREATE_SERVER,
    PERMISSIONS.UPDATE_SERVER,
    PERMISSIONS.DELETE_SERVER,
  ],
	[ROLES.ADMIN]: [
		PERMISSIONS.READ_OTHER_ACCOUNTS,
    PERMISSIONS.CREATE_OTHER_ACCOUNTS,
    PERMISSIONS.UPDATE_OTHER_ACCOUNTS,
    PERMISSIONS.DELETE_OTHER_ACCOUNTS,

    PERMISSIONS.READ_LOG,
    PERMISSIONS.DELETE_LOG,

    PERMISSIONS.READ_SERVER,
    PERMISSIONS.CREATE_SERVER,
    PERMISSIONS.UPDATE_SERVER,
    PERMISSIONS.DELETE_SERVER,
	],
	[ROLES.GUEST]: [
    PERMISSIONS.READ_SERVER,
    PERMISSIONS.READ_LOG,
  ],
};


export function hasEveryPermission(role: string | undefined, ...permissions: string[]): boolean {
  if (!role) {
    return false;
  }
  if (permissions.includes(PERMISSIONS.ANY)) {
    return true;
  }
  if (!rolePermissions[role]) {
    return false;
  }
  return permissions.every((permission) => rolePermissions[role].includes(permission));
}

export function hasAtLeastOnePermission(role: string | undefined, ...permissions: string[]): boolean {
  if (!role) {
    return false;
  }
  if (permissions.includes(PERMISSIONS.ANY)) {
    return true;
  }
  if (!rolePermissions[role]) {
    return false;
  }
  return permissions.some((permission) => rolePermissions[role].includes(permission));
}


export function hasPermission(role: string | undefined, permission: string): boolean {
  if (!role) {
    return false;
  }
  if (permission.includes(PERMISSIONS.ANY)) {
    return true;
  }
  if (!rolePermissions[role]) {
    return false;
  }
  return rolePermissions[role].includes(permission);
}
