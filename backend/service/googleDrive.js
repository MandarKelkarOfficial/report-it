// // backend/googleDrive.js
// const { google } = require('googleapis');
// const fs = require('fs');
// const path = require('path');

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );
// oauth2Client.setCredentials({
//   refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
// });

// const drive = google.drive({ version: "v3", auth: oauth2Client });

// async function uploadReportToDrive(filePath) {
//   const fileMetadata = {
//     name: "precimac_reports_online.xlsx",
//     parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Optional: Target folder
//   };

//   const media = {
//     mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     body: fs.createReadStream(filePath),
//   };

//   // First, try to find and delete old file
//   const list = await drive.files.list({
//     q: "name='precimac_reports_online.xlsx'",
//     fields: "files(id)",
//   });

//   for (const file of list.data.files) {
//     await drive.files.delete({ fileId: file.id });
//   }

//   // Upload new
//   const uploaded = await drive.files.create({
//     resource: fileMetadata,
//     media,
//     fields: "id",
//   });

//   return uploaded.data;
// }

// // module.exports = uploadReportToDrive;
// module.exports = { uploadReportToDrive };



// backend/service/googleDrive.js
const fs = require("fs");
const { google } = require("googleapis");
require("dotenv").config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  GOOGLE_REDIRECT_URI,
  GOOGLE_DRIVE_FOLDER_ID,
} = process.env;

// STEP 1: Setup OAuth2 Client
const oAuth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: "v3", auth: oAuth2Client });

// STEP 2: Upload function
// async function uploadReportToDrive(filePath, fileName, mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
//   try {
//     const fileMetadata = {
//       name: fileName,
//       parents: [GOOGLE_DRIVE_FOLDER_ID], // upload to the target folder
//     };

//     const media = {
//       mimeType,
//       body: fs.createReadStream(filePath),
//     };

//     const response = await drive.files.create({
//       requestBody: fileMetadata,
//       media,
//       fields: "id, name",
//     });

//     console.log("✅ File uploaded to Drive:", response.data);
//     return response.data.id;
//   } catch (err) {
//     console.error("❌ Drive upload failed:", err.message);
//     throw err;
//   }
// }

async function uploadReportToDrive(filePath, fileName, mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
  try {
    // Step 1: Search for existing file with the same name
    const list = await drive.files.list({
      q: `name='${fileName}' and '${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`,
      fields: "files(id, name)",
      spaces: "drive",
    });

    const existingFile = list.data.files?.[0];

    const media = {
      mimeType,
      body: fs.createReadStream(filePath),
    };

    if (existingFile) {
      // Step 2A: If exists, update it
      const response = await drive.files.update({
        fileId: existingFile.id,
        media,
      });

      console.log("✅ File updated on Drive:", response.data);
      return response.data.id;
    } else {
      // Step 2B: If not exists, create new
      const response = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [GOOGLE_DRIVE_FOLDER_ID],
        },
        media,
        fields: "id, name",
      });

      console.log("✅ New file created on Drive:", response.data);
      return response.data.id;
    }
  } catch (err) {
    console.error("❌ Drive upload failed:", err.message);
    throw err;
  }
}


module.exports = { uploadReportToDrive };
