# gror_email_module

Gror Email is a Node.js module for sending email messages with PDF attachments using the Mailjet email service and the Nodemailer library and uses the pdf package to generate PDFs from HTML.

This also has the zipping capabilities for large files.

## Installation 
To use this module, you first need to install it and its dependencies:

Copy code
```sh
npm install gror_email_module
```

### Usage 
First, you need to initialize the module with username and password:

Copy code
```sh
const email_handler = require('gror_email_module');

email_handler.init('username', 'password'); 
```

Then, you can use the sendEmailWithPdf function to send an email with a PDF attachment:

Copy code
```sh
const html = '<p>Hello, world!</p>';
const fileName = 'example.pdf';
const subject = 'Example Subject';
const text = 'This is an example email.';
const recipients = ['recipient1@example.com', 'recipient2@example.com'];
const zip_required = false/true

email_handler.sendEmailWithPdf(html, fileName, subject, text,recipients,zip_required);

```

The sendEmailWithPdf function takes five arguments:

- html: The HTML content to generate the PDF from
- fileName: The name of the PDF file to attach to the email
- subject: The subject line of the email
- text: The text content of the email
- recipients: An array of recipient email addresses
- zip_required: a boolean if the document should be zipped or not

## License
This module is licensed under the MIT License.
