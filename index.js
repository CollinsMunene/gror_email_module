const Puppeteer = require('puppeteer')  
const createMailjetTransport = require('./configs/email');
const { logger } = require("./configs/logger");
const archiver = require('archiver');
const fs = require('fs');

let transport;

async function pdf(html) {
  const browser = await Puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setContent(html)

  const pdfBuffer = page.pdf({
    path:null,
    landscape:true,
    timeout: 60000 
  })

  page.on('error', err => console.log('Page error: ', err));

  await browser.close()

  return pdfBuffer
}

function init(username, password){
  transport = createMailjetTransport(username, password);
  return true;
}

function sendEmailWithPdf(html, file_name, email_subject, email_text,recipients,zip_required) {
  if(transport){
    const output = fs.createWriteStream(__dirname + '/'+email_subject+'.zip');
    pdf(html).then(async (pdfBuffer) => {
      if(zip_required){
        let archive = archiver('zip', {
          zlib: { level: 9 } // compression level
        });

        archive.pipe(output);

        archive.append(pdfBuffer, { name: file_name});

        console.log("zip starting....")
      
          archive.finalize();

          archive.on('warning', function(err) {
            if (err.code === 'ENOENT') {
              // log warning
              // console.log(err)
            } else {
              // throw error
              // console.log(err)
            }
          });
          archive.on('error', function(err){
            // console.log(err)
          });
          archive.on('end', () => {
            console.log("zip ended....")
          });
     

        var GeneralHelperOptions = {
          from: "grorapp@gror.io",
          to: recipients,
          subject: email_subject,
          html: email_text,
          attachments: output,
        };
      }else{
        var GeneralHelperOptions = {
          from: "grorapp@gror.io",
          to: recipients,
          subject: email_subject,
          html: email_text,
          attachments: output,
        };
      }
      try {
          
          transport.sendMail(GeneralHelperOptions, (error, info) => {
            if (error) {
              console.log(error)
              logger.error(error.message, {
                path: "",
                function: `${file_name} Email Process`,
              });
            } else {
              console.log("sent")
              
              logger.info(`Email sent successfully. ${info.messageId}`, {
                path: "",
                function: `${file_name} Email Process`,
              });
            }
          });
        } catch (error) {
          console.log(error)
          logger.error(error.message, {
            path: "module",
            function: `${file_name} Email Process`,
          });
        }
    });
  }else{
    console.log("Kindly Initialize the package")
    logger.error("Kindly Initialize the package", {
      path: "module",
      function: `${file_name} Email Process`,
    });
  }
}
module.exports = {
  init,
  sendEmailWithPdf
};