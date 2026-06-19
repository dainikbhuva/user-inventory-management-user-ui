export const PERMISSION_ACTIONS = [
  'view',
  'create',
  'edit',
  'update',
  'delete',
  'import',
  'export',
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_ACTION_LABELS: Record<PermissionAction, string> = {
  view: 'View',
  create: 'Create',
  edit: 'Edit',
  update: 'Update',
  delete: 'Delete',
  import: 'Import',
  export: 'Export',
};

export const parsePermissionKey = (
  key: string
): { base: string; action?: PermissionAction } => {
  const colonIdx = key.lastIndexOf(':');
  if (colonIdx === -1) return { base: key };
  const action = key.slice(colonIdx + 1) as PermissionAction;
  if (PERMISSION_ACTIONS.includes(action)) {
    return { base: key.slice(0, colonIdx), action };
  }
  return { base: key };
};

export type PermissionMatrix = Record<string, Partial<Record<PermissionAction, boolean>>>;

export const keysToMatrix = (keys: string[]): PermissionMatrix => {
  const matrix: PermissionMatrix = {};
  for (const key of keys) {
    const { base, action } = parsePermissionKey(key);
    if (!matrix[base]) matrix[base] = {};
    if (action) {
      matrix[base][action] = true;
    } else {
      matrix[base].view = true;
    }
  }
  return matrix;
};

export const matrixToKeys = (matrix: PermissionMatrix): string[] => {
  const keys: string[] = [];
  for (const [base, actions] of Object.entries(matrix)) {
    if (!actions?.view) continue;
    keys.push(`${base}:view`);
    for (const action of PERMISSION_ACTIONS) {
      if (action !== 'view' && actions[action]) {
        keys.push(`${base}:${action}`);
      }
    }
  }
  return keys;
};

export const setMatrixAction = (
  matrix: PermissionMatrix,
  base: string,
  action: PermissionAction,
  enabled: boolean
): PermissionMatrix => {
  const row = { ...(matrix[base] ?? {}) };

  if (action === 'view') {
    if (!enabled) {
      return { ...matrix, [base]: { view: false } };
    }
    return { ...matrix, [base]: { ...row, view: true } };
  }

  if (!row.view) {
    return matrix;
  }

  return {
    ...matrix,
    [base]: { ...row, [action]: enabled },
  };
};

export const isActionEnabled = (
  matrix: PermissionMatrix,
  base: string,
  action: PermissionAction
): boolean => Boolean(matrix[base]?.[action]);

/** Menu dropdown keys mapped to API module keys (bidirectional). */
const PERMISSION_CANONICAL_ALIASES: Record<string, string[]> = {
  'leave/leave': ['usermanagement/leave', 'user/leave'],
  'attendance/attendance': ['usermanagement/attendance', 'user/attendance'],
  'users/users': ['usermanagement/users', 'user/users', 'user/user'],
  'roles/roles': ['usermanagement/roles', 'user/roles', 'user/role'],
  'permissions/permissions': [
    'usermanagement/role-permissions',
    'user/role-permissions',
    'user/role-permission',
  ],
};

const addAliasBases = (bases: Set<string>): void => {
  const snapshot = Array.from(bases);
  for (const base of snapshot) {
    for (const alias of PERMISSION_CANONICAL_ALIASES[base] ?? []) {
      bases.add(alias);
    }
    for (const [canonical, aliases] of Object.entries(PERMISSION_CANONICAL_ALIASES)) {
      if (aliases.includes(base)) {
        bases.add(canonical);
      }
    }
  }
};

export const expandPermissionBases = (moduleCode: string, itemCode?: string): string[] => {
  const bases = new Set<string>([moduleCode]);
  if (itemCode) {
    bases.add(`${moduleCode}/${itemCode}`);
    if (itemCode.endsWith('s')) {
      bases.add(`${moduleCode}/${itemCode.slice(0, -1)}`);
    } else {
      bases.add(`${moduleCode}/${itemCode}s`);
    }
  }
  addAliasBases(bases);
  return Array.from(bases);
};

/** All permission base keys equivalent to the given menu/API base. */
export const getPermissionAliasBases = (base: string): string[] => {
  const slash = base.indexOf('/');
  if (slash === -1) {
    const bases = new Set<string>([base]);
    addAliasBases(bases);
    return Array.from(bases);
  }
  return expandPermissionBases(base.slice(0, slash), base.slice(slash + 1));
};

export const isActionEnabledForBase = (
  matrix: PermissionMatrix,
  base: string,
  action: PermissionAction
): boolean => getPermissionAliasBases(base).some((alias) => isActionEnabled(matrix, alias, action));

export const setMatrixActionForBase = (
  matrix: PermissionMatrix,
  base: string,
  action: PermissionAction,
  enabled: boolean
): PermissionMatrix =>
  getPermissionAliasBases(base).reduce(
    (next, alias) => setMatrixAction(next, alias, action, enabled),
    matrix
  );

/** Collapse alias keys onto the sidebar permission keys shown in the UI. */
export const normalizeMatrixToBases = (
  matrix: PermissionMatrix,
  primaryBases: string[]
): PermissionMatrix => {
  const normalized: PermissionMatrix = {};

  for (const primary of primaryBases) {
    const merged: Partial<Record<PermissionAction, boolean>> = {};
    for (const action of PERMISSION_ACTIONS) {
      if (getPermissionAliasBases(primary).some((alias) => matrix[alias]?.[action])) {
        merged[action] = true;
      }
    }
    if (Object.keys(merged).length > 0) {
      normalized[primary] = merged;
    }
  }

  return normalized;
};

const expandPermissionBasesForCheck = expandPermissionBases;

export const canPerformAction = (
  permissionKeys: string[],
  isSuperAdmin: boolean,
  moduleCode: string,
  itemCode: string | undefined,
  action: PermissionAction
): boolean => {
  if (isSuperAdmin || permissionKeys.includes('*')) return true;
  const matrix = keysToMatrix(permissionKeys);
  const actionsToCheck: PermissionAction[] =
    action === 'edit' || action === 'update' ? ['edit', 'update'] : [action];

  for (const base of expandPermissionBasesForCheck(moduleCode, itemCode)) {
    for (const act of actionsToCheck) {
      if (isActionEnabled(matrix, base, act)) return true;
    }
    if (action === 'view' && matrix[base]?.view) return true;
  }
  return false;
};
