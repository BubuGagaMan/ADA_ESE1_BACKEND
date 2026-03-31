import crypto from 'node:crypto'

export function generateRandom6CharCode() {
    // removed 0, O, 1, I, and l to prevent user reading errors
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''

    for (let i = 0; i < 6; i++) {
        const randomIndex = crypto.randomInt(0, alphabet.length)
        code += alphabet[randomIndex]
    }

    return code
}
