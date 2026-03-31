import { FastifyInstance } from 'fastify'
import UserController from '@controllers/user/User.controller.js'
import { EditProfileImageBody } from '@controllers/user/types.js'
import { UpdateUserBody } from '@controllers/user/types.js'
import { editProfileImageSchema, updateUserSchema } from './user.schemas.js'

export default async function userR(app: FastifyInstance) {
    const userController = new UserController()

    app.get(
        '/user',
        {
            onRequest: [app.authenticate],
        },
        userController.getProfile,
    )

    app.put<{ Body: UpdateUserBody }>(
        '/user',
        {
            schema: updateUserSchema,
            onRequest: [app.authenticate],
        },
        userController.updateById,
    )

    app.delete(
        '/user',
        {
            onRequest: [app.authenticate],
        },
        userController.deleteById,
    )

    app.put(
        '/user-password-reset',

        userController.resetPassword,
    )

    app.put<{ Body: EditProfileImageBody }>(
        '/user/profile-image',
        {
            schema: editProfileImageSchema,
            onRequest: [app.authenticate],
        },
        userController.editProfileImage,
    )
}
