import { register } from '../controller/AuthController';
import fs from 'fs';
import Handlebars from 'handlebars';
import path from 'path';
import nodemailer from 'nodemailer'
import { loggerErrorData } from '../utility/errorLogger';

class EmailClass {
    
    constructor() {
        
    }

    emailTransporter() {
        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USERNAME, 
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    readHTMLFile(path: string) {
        return new Promise(function(resolve, reject) {
            fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
            if (err) {
              reject(null);
              //  throw err;
            }
            else {
              resolve(html);
            }
        });
       });
    }
    async newRegisterAccount(datas: {email: string, name: string, subject: string, code: string}) {
        try {
            let html_email_template = await  this.readHTMLFile(path.join(__dirname, '..', '/config/email/RegisterNotification.html'));
            let template = Handlebars.compile(html_email_template);
            let replacements = {
                name: datas.name,
                link: process.env.FRONT_URL + "/activate-account/"+datas.email+"/"+ datas.code
                // people: [
                //     {
                //         name: 'Ericson'
                //     },
                //     {
                //         name: 'Janna'
                //     },
                //     {
                //         name: 'Alice'
                //     }
                // ]
            };
            let htmlToSend = template(replacements);
            let attachments = [
                {
                    filename: 'Cafe_Shop_Logo.png',
                    path: path.join(__dirname, '..', '/public/image/Cafe_Shop_Logo.png'),
                    cid: 'Cafe_Shop_Logo.png'
                },
                {
                    filename: 'rounder-up.png',
                    path: path.join(__dirname, '..', '/public/image/register_email_images/rounder-up.png'),
                    cid: 'rounder-up.png'
                },
                {
                    filename: 'divider.png',
                    path: path.join(__dirname, '..', '/public/image/register_email_images/divider.png'),
                    cid: 'divider.png'
                },
            ];
            let emailHandler = this.emailTransporter();
            let emailResponse = await emailHandler.sendMail({
                from: `Cafe Shop`, // sender address
                to: datas.email, // list of receivers
                subject: datas.subject, // Subject line
                attachments:attachments,
                html: htmlToSend, // html body
            });
            if(emailResponse && emailResponse?.messageId) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            loggerErrorData(error);
            return false;
        }
    }

    async successRegisterAccount() {

    }
}

export default new EmailClass();


