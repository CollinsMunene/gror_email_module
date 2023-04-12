const nodemailer = require('nodemailer');
const smtp = require('nodemailer-smtp-transport');

function createMailjetTransport(username, password) {
  return nodemailer.createTransport(smtp({
    host: 'in-v3.mailjet.com',
    port: 465,
    auth: {
      user: username,
      pass: password
    }
  }));
}

module.exports = createMailjetTransport;