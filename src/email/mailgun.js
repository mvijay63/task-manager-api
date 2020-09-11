const mailgun = require("mailgun-js");
const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY , domain: process.env.MAILGUN_DOMAIN});
const sendNewUserNotification = (name , email) => {
    const data = {
        from: "Mailgun Sandbox <postmaster@sandbox61f062a1520a4e57b8c91844e70dfa1e.mailgun.org>",
        to: "mohit.lko10@gmail.com",
        subject: "Hello" + name,
        text: "Thanks for creating new accont!"
    };
    mg.messages().send(data, function (error, body) {
        console.log(body);
    });
}
module.exports = sendNewUserNotification