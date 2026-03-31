import bcrypt from 'bcrypt'

const bcryptHash = async (string: string, saltRounds: number = 10) => {
    const stringHash = await bcrypt.hash(string, saltRounds)

    return stringHash
}

export default bcryptHash
