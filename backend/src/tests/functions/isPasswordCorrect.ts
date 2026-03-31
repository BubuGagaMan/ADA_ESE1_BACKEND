import bcrypt = require('bcrypt')

const isPasswordCorrect = async (password: string, passwordHash: string) => {
    const passwordComparison: boolean = await bcrypt.compare(password, passwordHash)
    return passwordComparison
}

export default isPasswordCorrect
