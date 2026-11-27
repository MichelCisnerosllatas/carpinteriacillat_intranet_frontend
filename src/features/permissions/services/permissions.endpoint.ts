export const PERMISSIONS_ENDPOINTS = {
  v1: {
    tree:            '/v1/intranet/permissions/tree',
    rolePermissions: (idRole: number) => `/v1/intranet/role/${idRole}/permissions`,
  },
}
