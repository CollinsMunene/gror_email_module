const Puppeteer = require("puppeteer");
const createMailjetTransport = require("./configs/email");
const { logger } = require("./configs/logger");
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
      path: null,
      landscape: true,
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
      const output = fs.createWriteStream(
        __dirname + "/" + email_subject + ".zip"
      );
      pdf(html).then(async (pdfBuffer) => {
        if (pdfBuffer != false) {
          if (zip_required) {
            let archive = archiver("zip", {
              zlib: { level: 9 }, // compression level
            });

            archive.pipe(output);

            archive.append(pdfBuffer, { name: file_name });

            archive.finalize();

            var GeneralHelperOptions = {
              from: "grorapp@gror.io",
              to: recipients,
              subject: email_subject,
              html: email_text,
              attachments: output,
            };
          } else {
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
                console.log(error);
                logger.error(error.message, {
                  path: "",
                  function: `${file_name} Email Process`,
                });
              } else {
                console.log("Email Sent");

                logger.info(`Email sent successfully. ${info.messageId}`, {
                  path: "",
                  function: `${file_name} Email Process`,
                });
              }
            });
          } catch (error) {
            console.log(error);
            logger.error(error.message, {
              path: "module",
              function: `${file_name} Email Process`,
            });
          }
        } else {
          console.log(
            "Attachment is too big, sending email without attachment"
          );
          var zGeneralHelperOptions = {
            from: "grorapp@gror.io",
            to: recipients,
            subject: email_subject,
            html: email_text,
          };
          try {
            transport.sendMail(zGeneralHelperOptions, (error, info) => {
              if (error) {
                console.log(error);
                logger.error(error.message, {
                  path: "",
                  function: `${file_name} Email Process`,
                });
              } else {
                console.log("Email sent");

                logger.info(`Email sent successfully. ${info.messageId}`, {
                  path: "",
                  function: `${file_name} Email Process`,
                });
              }
            });
          } catch (error) {
            console.log(error);
            //send email with text only
            logger.error(error.message, {
              path: "module",
              function: `${file_name} Email Process`,
            });
          }
        }
      });
    } else {
      //don't generate pdf

      var GeneralHelperOptions = {
        from: "grorapp@gror.io",
        to: recipients,
        subject: email_subject,
        html: email_text,
      };

      try {
        transport.sendMail(GeneralHelperOptions, (error, info) => {
          if (error) {
            console.log(error);
            logger.error(error.message, {
              path: "",
              function: `${file_name} Email Process`,
            });
          } else {
            console.log("Email Sent");

            logger.info(`Email sent successfully. ${info.messageId}`, {
              path: "",
              function: `${file_name} Email Process`,
            });
          }
        });
      } catch (error) {
        console.log(error);
        logger.error(error.message, {
          path: "module",
          function: `${file_name} Email Process`,
        });
      }
    }
  } else {
    console.log("Kindly initialize the package");
    logger.error("Kindly initialize the package", {
      path: "module",
      function: `${file_name} Email Process`,
    });
  }
}

module.exports = {
  init,
  sendEmailWithPdf,
};
