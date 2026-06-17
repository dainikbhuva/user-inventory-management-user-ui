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

const expandPermissionBases = (moduleCode: string, itemCode?: string): string[] => {
  const bases = new Set<string>([moduleCode]);
  if (itemCode) {
    bases.add(`${moduleCode}/${itemCode}`);
    if (itemCode.endsWith('s')) {
      bases.add(`${moduleCode}/${itemCode.slice(0, -1)}`);
    } else {
      bases.add(`${moduleCode}/${itemCode}s`);
    }
  }
  return Array.from(bases);
};

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

  for (const base of expandPermissionBases(moduleCode, itemCode)) {
    for (const act of actionsToCheck) {
      if (isActionEnabled(matrix, base, act)) return true;
    }
    if (action === 'view' && matrix[base]?.view) return true;
  }
  return false;
};
