export const USER_DEVICES_ENDPOINTS = {
  v1: {
    // Admin endpoints
    listJoin:   '/v1/intranet/user-devices-join',
    getJoin:    (id: number) => `/v1/intranet/user-devices-join/${id}`,
    revoke:     (id: number) => `/v1/intranet/user-devices/${id}`,

    // My devices (cualquier rol)
    myDevices:       '/v1/intranet/auth/my-devices',
    revokeMyDevice:  (id: number) => `/v1/intranet/auth/my-devices/${id}`,
  },
}
