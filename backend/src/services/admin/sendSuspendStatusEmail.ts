import { FastifyRequest } from 'fastify'

const sendSuspendStatusEmail = async (
    isSuspended: boolean,
    suspensionMessage: string,
    targetEmail: string,
    req: FastifyRequest,
) => {
    // Define status-specific styling and text
    const statusColor = isSuspended ? '#D0021B' : '#417505' // Red for suspended, Green for active
    const statusTitle = isSuspended ? 'Account Suspended' : 'Access Restored'

    const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
        .wrapper { width: 100%; background-color: #f9fafb; padding: 40px 0; }
        .container { max-width: 550px; background-color: #ffffff; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .header { background-color: ${statusColor}; padding: 30px; text-align: center; color: #ffffff; }
        .content { padding: 40px; color: #374151; line-height: 1.6; }
        .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; text-transform: uppercase; margin-bottom: 20px; border: 1px solid ${statusColor}; color: ${statusColor}; }
        .message-box { background-color: #f3f4f6; border-left: 4px solid ${statusColor}; padding: 20px; margin: 25px 0; font-style: italic; border-radius: 0 4px 4px 0; }
        .footer { padding: 25px; text-align: center; font-size: 13px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
        h1 { margin: 0; font-size: 22px; letter-spacing: -0.5px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>${statusTitle}</h1>
            </div>

            <div class="content">
                <p>Hello,</p>
                <p>We are writing to inform you of a change in your account status at <strong>Plan My Holiday</strong>.</p>
                
                <div class="status-badge">${isSuspended ? 'Suspended' : 'Active'}</div>

                <p><strong>Reason/Details:</strong></p>
                <div class="message-box">
                    "${suspensionMessage}"
                </div>

                <p>If you have any questions regarding this update or believe this was done in error, please contact our support team immediately.</p>
            </div>

            <div class="footer">
                &copy; ${new Date().getFullYear()} Plan My Holiday. All rights reserved.<br>
                This is an automated administrative notification.
            </div>
        </div>
    </div>
</body>
</html>`

    const accountSuspendedSubject = 'Your account has been suspended'
    const accountSuspensionRemovedSubject = 'Your account suspension has been lifted'
    const subject = isSuspended ? accountSuspendedSubject : accountSuspensionRemovedSubject

    await req.server.sendEmail({
        from: 'noreply@plan-my-holiday.com',
        to: targetEmail,
        subject,
        html,
    })
}

export default sendSuspendStatusEmail
