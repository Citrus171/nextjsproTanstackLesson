import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => {
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        return {
          transport: {
            host: process.env.SMTP_HOST ?? 'localhost',
            port: parseInt(process.env.SMTP_PORT ?? '1025', 10),
            secure: (process.env.SMTP_SECURE ?? 'false').toLowerCase() === 'true',
            ...(smtpUser && smtpPass
              ? { auth: { user: smtpUser, pass: smtpPass } }
              : {}),
          },
          defaults: {
            from: process.env.MAIL_FROM ?? 'EC Shop <no-reply@example.com>',
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
