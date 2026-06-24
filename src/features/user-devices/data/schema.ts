import { z } from 'zod'

export const deviceTypeSchema = z.union([
  z.literal('mobile'),
  z.literal('tablet'),
  z.literal('desktop'),
  z.literal('api'),
  z.literal('unknown'),
])
export type DeviceType = z.infer<typeof deviceTypeSchema>

export const devicePlatformSchema = z.union([
  z.literal('ios'),
  z.literal('android'),
  z.literal('web'),
  z.literal('desktop'),
  z.literal('unknown'),
])
export type DevicePlatform = z.infer<typeof devicePlatformSchema>

export const userDeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  accessTokenId: z.string().nullable(),
  deviceUuid: z.string().nullable(),
  deviceName: z.string().nullable(),
  deviceType: deviceTypeSchema,
  platform: devicePlatformSchema,
  os: z.string().nullable(),
  osVersion: z.string().nullable(),
  deviceBrand: z.string().nullable(),
  deviceModel: z.string().nullable(),
  appName: z.string().nullable(),
  appVersion: z.string().nullable(),
  browser: z.string().nullable(),
  browserVersion: z.string().nullable(),
  ipAddress: z.string().nullable(),
  isActive: z.boolean(),
  loginAt: z.string(),
  lastSeenAt: z.string().nullable(),
  logoutAt: z.string().nullable(),
  // Solo presente en la vista admin (user-devices-join)
  user: z
    .object({
      id: z.number(),
      email: z.string(),
      userState: z.number(),
      personName: z.string(),
      personLastname: z.string(),
      personNumdoc: z.string().nullable(),
      roleName: z.string(),
    })
    .optional(),
})

export type UserDevice = z.infer<typeof userDeviceSchema>
