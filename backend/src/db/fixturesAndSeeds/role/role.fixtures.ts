export type PermissionData = {
    id: string
    name: string
}

export type RoleData = {
    id: string
    name: string
    permissionIds: string[]
}

export const permissionsArr: PermissionData[] = [
    { id: '11111111-1111-4111-a111-111111111111', name: 'CREATE_DIET' },
    { id: '22222222-2222-4222-a222-222222222222', name: 'EDIT_OWN_GOAL' },
    { id: '33333333-3333-4333-a333-333333333333', name: 'DELETE_DIET' },
]

export const rolesArr: RoleData[] = [
    {
        id: '44444444-4444-4444-a444-444444444444',
        name: 'ADMIN',
        permissionIds: permissionsArr.map((p) => p.id),
    },
    {
        id: '55555555-5555-4555-a555-555555555555',
        name: process.env.DB_BASE_USER_ROLE || 'BASE_ROLE',
        permissionIds: ['11111111-1111-4111-a111-111111111111', '22222222-2222-4222-a222-222222222222'],
    },
]
