const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'vchatzipan@gmail.com',
    pass: process.env.GMAIL_PASS,
  },
})

module.exports = function(body) {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: 'vchatzipan@gmail.com', // sender address
      to: 'vchatzipan@gmail.com', // list of receivers
      subject: 'Logs of updateStaticData Function', // Subject line
      html: `<p>${body}</p>`, // plain text body
    }

    console.log('===SENDING EMAIL===')
    transporter.sendMail(mailOptions, function(err, data) {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        console.log('===EMAIL SENT===')
        console.log(data)
        resolve(data)
      }
    })
  })
}
