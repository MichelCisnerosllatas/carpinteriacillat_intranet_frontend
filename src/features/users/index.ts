// Public API — features/users
// External layers (app/, widgets/) must import from here, not from internal paths.

export { useUserListStore } from './stores/useUserListStore'
export { useUserFormStore } from './stores/useUserFormStore'
export { userService } from './services/user.service'
export { personService } from './services/person.service'

export type { User, UserRole, UserStatus } from './data/schema'
export type { UserGetRequestDto, UserGetResponseDto } from './model/userget.dto'
export type { UserPostRequestDto, UserPostResponseDto } from './model/userpost.dto'
export type { UserPatchRequestDto, UserPatchResponseDto } from './model/userpatch.dto'
export type { UserJoinType } from './model/userjoin.type'

export { UsersTable } from './ui/users-table'
export { UsersPrimaryButtons } from './ui/users-primary-buttons'
export { UsersError } from './ui/users-error'
export { UsersBreadcrumb } from './ui/users-breadcrumb'
export { UserForm } from './ui/user-form'
