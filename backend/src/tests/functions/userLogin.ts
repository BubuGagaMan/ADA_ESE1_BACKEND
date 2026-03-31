type FastifyInstance = import('fastify').FastifyInstance
type LightMyRequestResponse = import('fastify').LightMyRequestResponse

const userLogin = async (
    app: FastifyInstance,
    username: string,
    password: string,
): Promise<{
    loginResponse: LightMyRequestResponse
    loginResponseJSON: {
        message: string
        data: {
            accessToken: string
        }
    }
}> => {
    const loginResponse = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
            username,
            password,
        },
    })

    const loginResponseJSON = await loginResponse.json()

    return {
        loginResponse,
        loginResponseJSON,
    }
}

export default userLogin
