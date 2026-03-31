import createError from '@fastify/error'

const testErrorCode = createError('TEST_ERROR_CODE', 'Test error message', 501)
const idkError2 = createError('IDK_ERROR2', 'Test error message 2', 501)

export { testErrorCode, idkError2 }
