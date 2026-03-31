import crypto from 'node:crypto'

function generateSecret(length = 64) {
    // 64 bytes results in a 128-character hex string
    return crypto.randomBytes(length).toString('hex')
}

export default generateSecret
