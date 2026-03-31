type FastifyInstance = import("fastify").FastifyInstance;

type UserTokenPayload = {
  id: string;
  username: string;
  iat: number;
  exp: number;
} | null;

const getTokenPayload = async (
  app: FastifyInstance,
  token: string
): Promise<UserTokenPayload>  => {
  const tokenPayload: UserTokenPayload = await app.jwt.decode(token)

  return tokenPayload
};

export default getTokenPayload
