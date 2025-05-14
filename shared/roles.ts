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

  CREATE_DASHBOARD: "create:dashboard", // Create dashboards
  READ_DASHBOARD: "read:dashboard",     // Read dashboards
  UPDATE_DASHBOARD: "update:dashboard", // Update dashboards
  DELETE_DASHBOARD: "delete:dashboard", // Delete dashboards

  CREATE_AI_CONVERSATION: "create:ai_conversation", // Create AI conversations
  READ_AI_CONVERSATION: "read:ai_conversation",     // List and read AI conversations
  UPDATE_AI_CONVERSATION: "update:ai_conversation", // Update AI conversations
  DELETE_AI_CONVERSATION: "delete:ai_conversation", // Delete AI conversations

  ALL: "*", // All permissions
  ANY: 'any'
};

const rolePermissions = {
  [ROLES.OWNER]: [
    PERMISSIONS.ALL
  ],
	[ROLES.ADMIN]: [
		PERMISSIONS.ALL
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
  if(rolePermissions[role].includes(PERMISSIONS.ALL) || rolePermissions[role].includes(PERMISSIONS.ANY)) {
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

  if(rolePermissions[role].includes(PERMISSIONS.ALL) || permissions.includes(PERMISSIONS.ANY)) {
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
  if(rolePermissions[role].includes(PERMISSIONS.ALL) || rolePermissions[role].includes(PERMISSIONS.ANY)) {
    return true;
  }
  if (!rolePermissions[role]) {
    return false;
  }
  return rolePermissions[role].includes(permission);
}
