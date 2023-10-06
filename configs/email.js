const nodemailer = require('nodemailer');
const smtp = require('nodemailer-smtp-transport');

function createMailjetTransport(username, password) {
  return nodemailer.createTransport(smtp({
    host: 'smtp.office365.com',
    port: 587,
    auth: {
      user: username,
      pass: password
    }
  }));
}

module.exports = createMailjetTransport;