// // src/features/users/ui/users-columns.tsx
import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { LongText } from '@/shared/ui/long-text'
import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
import { callTypes, roles } from '../data/data'
import type { User } from '../data/schema'
import { UsersRowActions } from './users-row-actions'
import { UserRound } from 'lucide-react'

export const usersColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: cn(
        'inset-s-0 z-20 w-[48px] bg-background max-md:sticky'
      ),
    },
    // meta: { className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky') },
  },

  {
    id: 'photo',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Foto" />,
    cell: ({ row }) => {
      const photoUrl = row.original.photoUrl

      return (
        <div className="flex items-center justify-center">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={row.original.username}
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UserRound size={18} />
            </div>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
    meta: { className: 'w-[60px] min-w-[60px]' },
  },

  {
    id: 'data',
    accessorFn: (row) => `${row.firstName} ${row.lastName} ${row.email} ${row.typeDocName} ${row.documentNumber}`,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Datos" />,
    cell: ({ row }) => {
      const user = row.original
      const fullName = `${user.firstName} ${user.lastName}`.trim() || '-'

      return (
        <div className="flex min-w-[360px] max-w-[520px] flex-col gap-1 py-2 text-xs leading-5">
          <LongText className="max-w-[480px] font-semibold text-foreground">
            {fullName}
          </LongText>

          <div className="text-muted-foreground">
            Correo:{' '}
            <span className="font-medium text-foreground">
            {user.email}
          </span>
          </div>

          <div className="text-muted-foreground">
            Documento:{' '}
            <span className="font-medium text-foreground">
              {user.typeDocName} - {user.documentNumber}
            </span>
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    meta: {
      className: 'min-w-[360px]',
    },
  },

  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Estado" />,
    cell: ({ row }) => {
      const status = row.original.status
      const badgeColor = callTypes.get(status)

      return (
        <Badge variant="outline" className={cn('capitalize', badgeColor)}>
          {row.original.statusLabel}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: true,
    enableHiding: true,
  },

  {
    accessorKey: 'role',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Rol" />,
    cell: ({ row }) => {
      const userType = roles.find(({ value }) => value === row.original.role)

      return (
        <div className="flex items-center gap-x-2">
          {userType?.icon && <userType.icon size={16} className="text-muted-foreground" />}
          <span className="text-sm capitalize">{row.original.roleLabel}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'dates',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fechas" />,
    cell: ({ row }) => {
      const user = row.original

      return (
        <div className="flex w-[160px] flex-col gap-1 text-xs leading-5">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Creado</span>
            <span className="font-medium text-foreground">{user.createdAt}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-muted-foreground">Modificado</span>
            <span className="font-medium text-foreground">{user.updatedAt}</span>
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    meta: { className: 'w-[170px] min-w-[170px]' },
  },

  {
    id: 'actions',
    cell: UsersRowActions,
  },
]




// 'use client'
//
// import { type ColumnDef } from '@tanstack/react-table'
// import { cn } from '@/shared/lib/utils'
// import { Badge } from '@/shared/ui/badge'
// import { Checkbox } from '@/shared/ui/checkbox'
// import { LongText } from '@/shared/ui/long-text'
// import { DataTableColumnHeader } from '@/shared/ui/data-table/column-header'
// import { callTypes, roles } from '../data/data'
// import type { User } from '../data/schema'
// import { UsersRowActions } from './users-row-actions'
//
// export const usersColumns: ColumnDef<User>[] = [
//   {
//     id: 'select',
//     header: ({ table }) => (
//       <Checkbox
//         checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
//         onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
//         aria-label="Select all"
//         className="translate-y-0.5"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         checked={row.getIsSelected()}
//         onCheckedChange={(v) => row.toggleSelected(!!v)}
//         aria-label="Select row"
//         className="translate-y-0.5"
//       />
//     ),
//     enableSorting: false,
//     enableHiding: false,
//     meta: { className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky') },
//   },
//   {
//     accessorKey: 'username',
//     header: ({ column }) => <DataTableColumnHeader column={column} title="Username" />,
//     cell: ({ row }) => <LongText className="max-w-36 ps-3">{row.getValue('username')}</LongText>,
//     meta: {
//       className: cn(
//         'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
//         'inset-s-6 ps-0.5 max-md:sticky @4xl/content:table-cell @4xl/content:drop-shadow-none'
//       ),
//     },
//     enableHiding: false,
//   },
//   {
//     id: 'fullName',
//     header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
//     cell: ({ row }) => {
//       const { firstName, lastName } = row.original
//       return <LongText className="max-w-36">{`${firstName} ${lastName}`}</LongText>
//     },
//     meta: { className: 'w-36' },
//   },
//   {
//     accessorKey: 'email',
//     header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
//     cell: ({ row }) => <div className="w-fit ps-2 text-nowrap">{row.getValue('email')}</div>,
//   },
//   {
//     accessorKey: 'phoneNumber',
//     header: ({ column }) => <DataTableColumnHeader column={column} title="Phone Number" />,
//     cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
//     enableSorting: false,
//   },
//   {
//     accessorKey: 'status',
//     header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
//     cell: ({ row }) => {
//       const status = row.original.status
//       const badgeColor = callTypes.get(status)
//       return (
//         <Badge variant="outline" className={cn('capitalize', badgeColor)}>
//           {status}
//         </Badge>
//       )
//     },
//     filterFn: (row, id, value) => value.includes(row.getValue(id)),
//     enableHiding: false,
//     enableSorting: false,
//   },
//   {
//     accessorKey: 'role',
//     header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
//     cell: ({ row }) => {
//       const userType = roles.find(({ value }) => value === row.original.role)
//       if (!userType) return null
//       return (
//         <div className="flex items-center gap-x-2">
//           <userType.icon size={16} className="text-muted-foreground" />
//           <span className="text-sm capitalize">{row.getValue('role')}</span>
//         </div>
//       )
//     },
//     filterFn: (row, id, value) => value.includes(row.getValue(id)),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     id: 'actions',
//     cell: UsersRowActions,
//   },
// ]
