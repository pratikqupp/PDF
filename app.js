const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

let browserInstance;

app.post('/', async (req, res) => {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({ args: ['--no-sandbox'] });
    }
    const requestData = req.body;
    console.log('req ', req.body);
    const clinicAddress = requestData.clinicAddress ? requestData.clinicAddress.trim() : "";
    const entityLogo = requestData.entityLogo ? requestData.entityLogo.trim() : "";
    const qrCode = requestData.qrCode ? requestData.qrCode.trim() : "";
    const clinicContact = requestData.clinicContact ? requestData.clinicContact.trim() : "";
    const clinicName = requestData.clinicName ? requestData.clinicName.trim() : "";
    const clinicalFindings = requestData.clinicalFindings ? requestData.clinicalFindings.trim() : "";
    const diagnoses = requestData.diagnoses ? requestData.diagnoses.trim() : "";
    const doctorName = requestData.doctorName ? requestData.doctorName.trim() : "";
    const instructions = requestData.instructions ? requestData.instructions.trim() : "";
    const investigations = requestData.investigations ? requestData.investigations.trim() : "";

    const medicineDTOS = requestData.medicineDTOS ? requestData.medicineDTOS : [];
    const symptoms = requestData.symptom ? requestData.symptom.trim() : "";
    const vital = requestData.vital ? requestData.vital.trim() : "";
    const patientBookingRequestId = requestData.patientBookingRequestId ? requestData.patientBookingRequestId.trim() : "";
    const patientName = requestData.patientName ? requestData.patientName.trim() : "";
    const prescriptionId = requestData.prescriptionId ? requestData.prescriptionId.trim() : "";
    const entityId = requestData.entityId ? requestData.entityId.trim() : "";
    const privateInstruction = requestData.privateInstruction ? requestData.privateInstruction.trim() : "";
    const followupDate = requestData.followupDate ? requestData.followupDate.trim() : "";
    const followupNote = requestData.followupNote ? requestData.followupNote.trim() : "";
    const referredDoctorId = requestData.referredDoctorId ? requestData.referredDoctorId.trim() : "";
    const referredDoctorName = requestData.referredDoctorName ? requestData.referredDoctorName.trim() : "";
    const doctorDegress = requestData.doctorDegress ? requestData.doctorDegress.trim() : "";
    const patientMobileNumber = requestData.patientMobileNumber ? requestData.patientMobileNumber : "";
    const prescriptionDate = requestData.prescriptionDate ? requestData.prescriptionDate : "";
    const patientAgeGender = requestData.patientAgeGender ? requestData.patientAgeGender : "";
    const settings = requestData.settings ? requestData.settings : {};
    const prescriptionPrintSettings = requestData.prescriptionPrintSettings ? requestData.prescriptionPrintSettings : {};
    const medicalInfoOfGynecModule = requestData.medicalInfoOfGynecModule ? requestData.medicalInfoOfGynecModule : {};
    const prescriptionFontConfiguration = requestData.prescriptionFontConfiguration ? requestData.prescriptionFontConfiguration : {};
    const language = getLanguage(requestData.language ? requestData.language.trim() : "");

    function getLanguage(language) {
        switch (language.toLowerCase()) {
            case 'english':
                return 'Devanagari';
            case 'marathi':
                return 'Devanagari';
            case 'hindi':
                return 'Devanagari';
            default:
                return language;
        }
    }

    const entityLayout = settings.letterHead ? `
    <div>
        <div id="invoice-mid" style="display: flex; justify-content: space-between;">
            ${entityLogo ? `<img src="data:image/png;base64,${entityLogo}" width="68" height="68" style="display: block; margin: 0 auto;"><br>` : ``}
            <div class="info" style="width: calc(50% - 25px);">
                <h2>${clinicName}</h2>
                <p style="max-width: 100%;">${clinicAddress}<br>
                <span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Contact :</strong> ${clinicContact}</span></p>
            </div>
            <div id="project" style="width: calc(50% - 25px);">
                <h2>${doctorName}</h2>
                <p class="degree" style="max-width: 100%; word-wrap: break-word;">${doctorDegress}</p>
            </div>
        </div>
        <hr style="background-color: rgb(226, 223, 223);">
    </div>
    ` : '';
    
    const symptomsLayout = settings.symptoms ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Symptoms :</strong> ${symptoms}</span></p><br>`: '';
    const clinicalFindingLayout = settings.clinicalFinding ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Clinical Findings :</strong> ${clinicalFindings}</span></p><br>`: '';
    const diagnosesLayout = settings.diagnosis ? (diagnoses ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Diagnosis :</strong> ${diagnoses}</span></p><br>`: ``) : ``;
    
    const medicineHeaders = ` 
    <tr class="tabletitle">
        <td class="sr"><h2>RX </h2></td>
        <td class="item"><h2>BRANDS </h2></td>
        <td class="Hours"><h2>FREQUENCY </h2></td>
        <td class="Rate"><h2>DURATION </h2></td>
        ${settings.totalQuantity ? `<td class="subtotal"><h2>QUANTITY </h2></td>`: ``}
    </tr>`;

    const medicineTable = medicineDTOS && medicineDTOS.length > 0 ? `
    <div id="middle-section">
        <div id="table">
            <table>
                ${medicineHeaders}
                ${medicineDTOS.map((medicine, index) => `
                    <tr class="service">
                        <td class="tableitem"><p class="itemtext">${index + 1}</p></td>
                        <td class="tableitem"><p class="itemtext">${medicine.brandName ? medicine.brandName : ""}</p>${settings.medicineComposition ? `<p class="itemtext">${medicine.genericName ? medicine.genericName : ""}</p>` : ``}</td>
                        <td class="tableitem"><p class="itemtext">${medicine.frequancy ? medicine.frequancy : ""}</p></td>
                        <td class="tableitem"><p class="itemtext">${medicine.duration ? medicine.duration : ""}</p></td>
                        ${settings.totalQuantity ? `<td class="tableitem"><p class="itemtext">${medicine.quantity ? medicine.quantity : ""}</p></td>` : ``}      
                    </tr>`
                ).join('')}
            </table>
        </div>
        <br>
    </div>
    ` : '';

    const investigationsLayout = investigations ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Investigations :</strong> ${investigations}</span></p><br>` : '';
    const instructionsLayout = settings.instruction ? (instructions ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>General instructions :</strong></span></p><p>${instructions}</p><br>` : ``) : '';
    const footer = settings.signature ? `<div><h2>${doctorName}</h2><p class="degree" style="max-width: 600px; word-wrap: break-word;">${doctorDegress}</p></div>`: '';

    const htmlContent = `
<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Q UP Bill</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+${language}:wght@400&display=swap" rel="stylesheet">
    <style>
        * {
            margin: ${prescriptionPrintSettings.marginTop}px ${prescriptionPrintSettings.marginRight}px ${prescriptionPrintSettings.marginBottom}px ${prescriptionPrintSettings.marginLeft}px;
            box-sizing: border-box;
        }
        body {
            font-family: 'Noto Sans ${language}', sans-serif;
            background-repeat: repeat-y;
            background-size: 100%;
        }
        ::selection {
            background: #f31544;
            color: #FFF;
        }
        ::moz-selection {
            background: #f31544;
            color: #FFF;
        }
        h1 {
            font-size: 1.5em;
            color: #222;
        }
        h2 {
            font-size: .9em;
        }
        h3 {
            font-size: 1.2em;
            font-weight: 300;
            line-height: 2em;
        }
        p {
            font-size: .7em;
            color: #666;
            line-height: 1.2em;
        }
        #invoice-mid {
            min-height: 100px;
        }
        .logo {
            display: block;
            margin: 0 auto;
            width: 70px;
            height: 70px;
            background-image: url("data:image/png;base64,${entityLogo}");
            background-size: 70px 70px;
            border-radius: 50px;
        }
        .info {
            display: block;
            margin-left: 20px;
        }
        .info h2 {
            margin: 0;
            line-height: 1.5em;
            font-size: 1.4em;
        }
        .info p {
            margin: 0;
        }
        .title {
            float: right;
        }
        .title p {
            text-align: right;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        td {
            padding: 5px 0 5px 15px;
            border: 1px solid #EEE
        }
        .tabletitle {
            background: #EEE;
        }
        .service {
            border: 1px solid #EEE;
        }
        .item {
            width: 50%;
        }
        .itemtext {
            font-size: .9em;
        }
        .rate {
            font-size: 1.2em;
            color: #333;
        }
        .paid {
            padding: 10px;
            text-align: center;
            background: #F97352;
            color: #FFF;
        }
        .legal {
            width: 70%;
        }
    </style>
</head>
<body>
    <div id="invoice-mid">
        ${entityLayout}
    </div>
    ${symptomsLayout}
    ${clinicalFindingLayout}
    ${diagnosesLayout}
    ${medicineTable}
    ${investigationsLayout}
    ${instructionsLayout}
    ${footer}
</body>
</html>
    `;

    const pdf = await generatePDF(htmlContent);

    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdf);
});

async function generatePDF(content) {
    const page = await browserInstance.newPage();
    await page.setContent(content, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await page.close();
    return pdfBuffer;
}

process.on('SIGINT', async () => {
    if (browserInstance) await browserInstance.close();
    process.exit();
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
