const Puppeteer = require("puppeteer");
const createMailjetTransport = require("./configs/email");
const archiver = require("archiver");
const fs = require("fs");

let transport;

async function pdf(html) {
  try {
    const browser = await Puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-infobars",
        "--window-size=1366,768",
      ],
    });
    const page = await browser.newPage();
    await page.setContent(html);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '1cm',
        right: '1cm',
        bottom: '1cm',
        left: '1cm',
    },
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    return false;
  }
}

function init(username, password) {
  transport = createMailjetTransport(username, password);
  return true;
}

function sendEmailWithPdf(
  html,
  file_name,
  email_subject,
  email_text,
  recipients,
  zip_required,
  pdf_required
) {
  if (transport) {
    if (pdf_required) {
      //generate pdf
      // const output = fs.createWriteStream(
      //   __dirname + "/" + email_subject + ".zip"
      // );
      pdf(html).then(async (pdfBuffer) => {
        if (pdfBuffer != false) {
          // if (zip_required) {
          //   let archive = archiver("zip", {
          //     zlib: { level: 9 }, // compression level
          //   });

          //   archive.pipe(output);

          //   archive.append(pdfBuffer, { name: file_name });

          //   archive.finalize();

          //   var GeneralHelperOptions = {
          //     from: "web-alert@gror.io",
          //     to: recipients,
          //     subject: email_subject,
          //     html: email_text,
          //     attachments: output,
          //   };
          // } else {
            var GeneralHelperOptions = {
              from: "web-alert@gror.io",
              to: recipients,
              subject: email_subject,
              html: email_text,
              attachments: {
                  filename: file_name,
                  content: pdfBuffer,
                },
            };
          // }
          try {
            transport.sendMail(GeneralHelperOptions, (error, info) => {
              if (error) {
                return error
              
              } else {
                return "Email Sent"

              }
            });
          } catch (error) {
            return error
           
          }
        } else {
          console.log(
            "Attachment is too big, sending email without attachment"
          );
          var zGeneralHelperOptions = {
            from: "web-alert@gror.io",
            to: recipients,
            subject: email_subject,
            html: email_text,
          };
          try {
            transport.sendMail(zGeneralHelperOptions, (error, info) => {
              if (error) {
                console.log(error);
             
              } else {
                console.log("Email sent");

              }
            });
          } catch (error) {
            console.log(error);
          
          }
        }
      });
    } else {
      //don't generate pdf

      var GeneralHelperOptions = {
        from: "web-alert@gror.io",
        to: recipients,
        subject: email_subject,
        html: email_text,
      };

      try {
        transport.sendMail(GeneralHelperOptions, (error, info) => {
          if (error) {
            console.log(error);
           
          } else {
            console.log("Email Sent");

           
          }
        });
      } catch (error) {
        console.log(error);
      
      }
    }
  } else {
    console.log("Kindly initialize the package");
  
  }
}

module.exports = {
  init,
  sendEmailWithPdf,
};
