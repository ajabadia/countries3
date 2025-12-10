import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
    /**
     * Send password reset email
     * TODO: Integrate with real email service (SendGrid, AWS SES, etc.)
     */
    async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
        const resetUrl = `http://localhost:3000/auth/reset-password?token=${resetToken}`;

        console.log('\n📧 ========== PASSWORD RESET EMAIL ==========');
        console.log(`To: ${email}`);
        console.log(`Subject: Reset Your Password`);
        console.log(`\nReset URL: ${resetUrl}`);
        console.log(`\nToken: ${resetToken}`);
        console.log(`\nThis link will expire in 1 hour.`);
        console.log('============================================\n');

        // In production, replace with actual email service:
        // await this.emailProvider.send({
        //   to: email,
        //   subject: 'Reset Your Password',
        //   template: 'password-reset',
        //   context: { resetUrl }
        // });
    }
}
