import UserRole from '../types/UserRole.js'

const hasUserRoles = (userRoles: UserRole[], necessaryRoles: UserRole[]): boolean => {
    let hasRoles = false
    for (const necessaryRole of necessaryRoles) {
        hasRoles = false
        for (const userRole of userRoles) {
            if (necessaryRole === userRole) {
                hasRoles = true
                break
            }
        }
        if (!hasRoles) {
            return false
        }
    }

    return true
}

export default hasUserRoles
