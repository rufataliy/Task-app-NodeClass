const sgMail = require("@sendgrid/mail")
const sendGridApiKey = process.env.MAILAPIKEY

sgMail.setApiKey(sendGridApiKey)

const sendWelcome = (email, name) => {
    sgMail.send({
        to: email,
        from: "rufataliyevbakou@gmail.com",
        subject: "testing",
        text: `I hope this is working, ${name}`
    })
}
const sendCancel = (email, name) => {
    sgMail.send({
        to: email,
        from: "rufataliyevbakou@gmail.com",
        subject: "Don't go",
        text: `Come back soon, ${name}`
    })
}

module.exports = {
    sendWelcome,
    sendCancel
}