import {initConfig} from "../env/config.ts";

initConfig();

import {createTransport} from "nodemailer";
import {getTemplate} from "./FileHandler.ts";
import {ServerUtil} from "./ServerUtil.ts";
import {MailConfig} from "../models/util/MailConfig.ts";

export class MailHandler {

    static mailer = MailHandler.initTransport();

    static initTransport() {
        const mailConfig = MailConfig.init();
        return createTransport({
            //@ts-ignore
            host: mailConfig.host,
            port: mailConfig.port,
            auth: {
                user: mailConfig.user,
                pass: mailConfig.password
            }
        });
    }

    static sendMail(to: string, subject: string, body: string) {
        const header = {
            from: process.env.MAIL_USER,
            to: to
        };

        return MailHandler.mailer.sendMail({...header, subject: subject, html: body});
    }

    static async sendRegistrationMail(to: string, userId: string, username: string) {
        const registrationBody = await getTemplate("registration.html", {
            username: username,
            verificationLink: ServerUtil.getUrl("/confirm/registration", [{key: "userId", value: userId}])
        })

        return this.sendMail(to, "Confirmation Mail", registrationBody);
    }

    static async sendEmailModificationMail(to: string, token: string, username: string) {
        const registrationBody = await getTemplate("email_modified.html", {
            username: username,
            confirmLink: ServerUtil.getUrl("/modification/email", [{key: "token", value: token}])
        })

        return this.sendMail(to, "Email Address Change Confirmation", registrationBody);
    }

    static async sendPasswordModificationMail(to: string, token: string, username: string) {
        const registrationBody = await getTemplate("password_modified.html", {
            username: username,
            confirmLink: ServerUtil.getUrl("/modification/password", [{key: "token", value: token}])
        })

        return this.sendMail(to, "Password Change Confirmation", registrationBody);
    }

    static async sendResetPasswordMail(to: string, username: string, jwt: string) {
        const registrationBody = await getTemplate("password_reset.html", {
            username: username,
            changePasswordLink: ServerUtil.getUrl("/confirm/password/reset", [{key: "token", value: jwt}])
        })

        return this.sendMail(to, "Reset Password Confirmation", registrationBody);
    }

    static async sendUserInvitationMail(to: string, username: string, invitationToken: string) {
        const body = await getTemplate("user_invitation.html", {
            username: username,
            inviteLink: ServerUtil.getFrontendUrl("/invited", [{key: "token", value: invitationToken}] )
        })

        return this.sendMail(to, "New invitation", body);
    }

    static async send2FactorAuthMail(to: string, username: string, code: string) {
        const body = await getTemplate("two_factor.html", {
            username: username,
            authCode: code
        })

            return this.sendMail(to, "Your Two-Factor Authentication Code", body);
    }


}