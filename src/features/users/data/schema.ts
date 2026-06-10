import { z } from 'zod'

export const userStatusSchema = z.union([z.literal('active'), z.literal('inactive')])
export type UserStatus = z.infer<typeof userStatusSchema>

export const userRoleSchema = z.union([
  z.literal('superadmin'),
  z.literal('admin'),
  z.literal('cashier'),
  z.literal('manager'),
])
export type UserRole = z.infer<typeof userRoleSchema>

export const userSchema = z.object({
  // IDs ocultos, pero disponibles en row.original
  id: z.number(),
  idPerson: z.number().nullable(),
  idRole: z.number().nullable(),
  idTypeDoc: z.number().nullable(),

  // Datos principales
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),

  // Documento
  typeDocName: z.string(),
  documentNumber: z.string(),

  // Foto
  photoUrl: z.string().nullable(),

  // Estado y rol
  status: userStatusSchema,
  statusLabel: z.string(),
  role: userRoleSchema,
  roleLabel: z.string(),

  // Fechas
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type User = z.infer<typeof userSchema>

// import { z } from 'zod'
//
// export const userStatusSchema = z.union([
//   z.literal('active'),
//   z.literal('inactive'),
//   z.literal('invited'),
//   z.literal('suspended'),
// ])
// export type UserStatus = z.infer<typeof userStatusSchema>
//
// export const userRoleSchema = z.union([
//   z.literal('superadmin'),
//   z.literal('admin'),
//   z.literal('cashier'),
//   z.literal('manager'),
// ])
// export type UserRole = z.infer<typeof userRoleSchema>
//
// export const userSchema = z.object({
//   id: z.string(),
//   firstName: z.string(),
//   lastName: z.string(),
//   username: z.string(),
//   email: z.string(),
//   phoneNumber: z.string(),
//   status: userStatusSchema,
//   role: userRoleSchema,
//   createdAt: z.coerce.date(),
//   updatedAt: z.coerce.date(),
// })
// export type User = z.infer<typeof userSchema>
