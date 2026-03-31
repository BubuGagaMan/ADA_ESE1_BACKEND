import { FastifyRequest } from 'fastify'
import { EmailConfirmationEnum } from './emailConfirmationTypes.js'

const sendConfirmationCodeEmail = async (
    confirmationType: EmailConfirmationEnum,
    confirmationCode: string,
    targetEmail: string,
    req: FastifyRequest,
) => {
    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f7; padding-bottom: 40px; }
        .container { max-width: 600px; background-color: #ffffff; margin: 20px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background-color: #4A90E2; padding: 30px; text-align: center; color: #ffffff; }
        .content { padding: 40px; text-align: center; color: #333333; }
        .code-container { background-color: #f9f9f9; border: 2px dashed #4A90E2; border-radius: 6px; display: inline-block; margin: 20px 0; padding: 15px 30px; }
        .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4A90E2; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #999999; line-height: 1.5; }
        .warning { font-size: 13px; color: #666666; margin-top: 25px; border-top: 1px solid #eeeeee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1 style="margin:0; font-size: 24px;">Email Confirmation Code: ${confirmationType.toUpperCase()}</h1>
            </div>

            <div class="content">
                <p style="font-size: 16px; line-height: 1.6;">
                    Please use the following verification code to complete the process:
                </p>
                
                <div class="code-container">
                    <span class="code">${confirmationCode}</span>
                </div>

                <p style="font-size: 14px; color: #555;">This code will expire in 15 minutes.</p>

                <div class="warning">
                    If you did not request this, you can safely ignore this email. No changes will be made to your account until the code is entered.
                </div>
            </div>
        </div>
    </div>
</body>
</html>`

    await req.server.sendEmail({
        from: 'noreply@plan-my-holiday.com',
        to: targetEmail,
        subject: `${confirmationType} confirmation code`,
        html,
    })
}

export default sendConfirmationCodeEmail
