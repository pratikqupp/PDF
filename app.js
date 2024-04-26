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
    // Extracting all fields from the request body
    const clinicAddress = requestData.clinicAddress;
    const entiyLogo = requestData.entiyLogo;
    const qrCode = requestData.qrCode;
    const clinicContact = requestData.clinicContact;
    const clinicName = requestData.clinicName;
    const clinicalFindings = requestData.clinicalFindings;
    const diagnoses = requestData.diagnoses;
    const doctorName = requestData.doctorName;
    const instructions = requestData.instructions;
    const investigations = requestData.investigations;
    const language = requestData.language;
    const medicineDTOS = requestData.medicineDTOS;
    const symptoms = requestData.symptoms;
    const vital = requestData.vital;
    const patientBookingRequestId = requestData.patientBookingRequestId;
    const patientName = requestData.patientName;
    const prescriptionId = requestData.prescriptionId;
    const entityId = requestData.entityId;
    const privateInstruction = requestData.privateInstruction;
    const followupDate = requestData.followupDate;
    const followupNote = requestData.followupNote;
    const referredDoctorId = requestData.referredDoctorId;
    const referredDoctorName = requestData.referredDoctorName;
    const doctorDegress = requestData.doctorDegress;
    const patientMobileNumber = requestData.patientMobileNumber;
    const prescriptionDate = requestData.prescriptionDate;
    const patientAgeGender = requestData.patientAgeGender;
    const settings = requestData.settings;
    const prescriptionPrintSettings = requestData.prescriptionPrintSettings;

    const entityLayout = settings.letterHead ? `
<div>
    <div id="invoice-mid">
        <img id="clinic-logo" alt="Clinic logo" width="68" height="68" style="display: block; margin: 0 auto;">
        <div class="info">
            <h2>${clinicName}</h2>
            <p>${clinicAddress}<br>
                Contact :${clinicContact}
            </p>
        </div>
        <div id="project">
            <h2>${doctorName}</h2>
            <p class="degree" style="max-width: 600px; word-wrap: break-word;">${doctorDegress}</p>
        </div>
    </div>
    <hr style="background-color: rgb(226, 223, 223);">
</div>
` : '';

    const symptomsLayout = settings.symptoms ? ` <p><strong>Symptoms : </strong> ${symptoms}</p>
<br>`: '';
    const clinicalFindingLayout = settings.clinicalFinding ? ` <p><strong>Clinical Findings : </strong> ${clinicalFindings}</p>
<br>`: '';
    const diagnosesLayout = settings.diagnosis ? `<p><strong>Diagnosis :</strong> ${diagnoses}</p>
<br>`: '';

    const medicineHeaders = ` <tr class="tabletitle">
    <td class="sr">
        <h2>RX </h2>
    </td>
    <td class="item">
        <h2>BRANDS </h2>
    </td>
    <td class="Hours">
        <h2>FREQUENCY </h2>
    </td>
    <td class="Rate">
        <h2>DURATION </h2>
    </td>
    <td class="subtotal">
        <h2>QUANTITY </h2>
    </td>
</tr>`;
    const medicineTable = settings.medicineComposition ? `
    <div id="middle-section">
    <div id="table">
    <table>
        ${medicineHeaders}
        ${medicineDTOS.map((medicine, index) => `
        <tr class="service">
            <td class="tableitem">
                <p class="itemtext">${index + 1}</p>
            </td>
            <td class="tableitem">
                <p class="itemtext">${medicine.brandName}</p>
                <p class="itemtext">${medicine.genericName}</p>
            </td>
            <td class="tableitem">
                <p class="itemtext">${medicine.frequancy}</p>
            </td>
            <td class="tableitem">
                <p class="itemtext">${medicine.duration}</p>
            </td>
            <td class="tableitem">
                <p class="itemtext">${medicine.quantity}</p>
            </td>
        </tr>`
    ).join('')}
    </table>
</div>
<br>
</div>
`: '';
    const investigationsLayout = settings.medicalHistory ? `<p><strong>Investigations :</strong> ${investigations}</p>
<br>
`: ``;
    const instructionsLayout = settings.instruction ? `
<p><strong>General instructions :</strong></p>
<p>${instructions}</p>
<br>
`: '';
    const followupLayout = `
<p><strong>Next Follow-up :</strong> Date:- ${followupDate}</p>
<br>
<p><strong>Followup Note : </strong> ${followupNote}</p>
<br>`;

    const footer = settings.signature ? ` <div>
        <h2>${doctorName}</h2>
        <p class="degree" style="max-width: 600px; word-wrap: break-word;">${doctorDegress}</p>
    `: ``;
    const htmlContent =
        `
<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Q UP Bill</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+${language}:wght@400&display=swap" rel="stylesheet">
    <style>

        * {
            margin: ${prescriptionPrintSettings.marginTop}   ${prescriptionPrintSettings.marginRight} ${prescriptionPrintSettings.marginBottom} ${prescriptionPrintSettings.marginLeft};
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

        #invoiceholder {
            width: 100%;
            height: 100%;
            padding-top: 50px;
        }

        #headerimage {
            z-index: -1;
            position: relative;
            overflow: hidden;
            background-attachment: fixed;
            background-size: 1920px 80%;
            background-position: 50% -90%;
        }

        #invoice {
            position: relative;
            margin: 0 auto;
            background: #FFF;
        }

        [id*='invoice-'] {
            padding: 30px;
        }

        [id*='bottomline-'] {
            border-bottom: 1px solid #EEE;
            padding: 30px;
        }

        #invoice-bot {
            min-height: 250px;
        }

        .logo {
            float: left;
            height: 60px;
            width: 60px;
            background-size: 60px 60px;
        }

        .clientlogo {
            float: left;
            height: 60px;
            width: 60px;
            background-size: 60px 60px;
            border-radius: 50px;
        }

        .info {
            display: block;
            float: left;
            margin-left: 20px;
        }

        .title {
            float: right;
        }

        .title p {
            text-align: right;
        }

        #project {
            margin-left: 52%;
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
            padding: 5px;
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

        #legalcopy {
            margin-top: 30px;
        }

        form {
            float: right;
            margin-top: 30px;
            text-align: right;
        }

        .effect2 {
            position: relative;
        }

        .effect2:before,
        .effect2:after {
            z-index: -1;
            position: absolute;
            content: "";
            bottom: 15px;
            left: 10px;
            width: 50%;
            top: 80%;
            max-width: 300px;
            background: #777;
            -webkit-transform: rotate(-3deg);
            -moz-transform: rotate(-3deg);
            -o-transform: rotate(-3deg);
            -ms-transform: rotate(-3deg);
            transform: rotate(-3deg);
        }

        .effect2:after {
            -webkit-transform: rotate(3deg);
            -moz-transform: rotate(3deg);
            -o-transform: rotate(3deg);
            -ms-transform: rotate(3deg);
            transform: rotate(3deg);
            right: 10px;
            left: auto;
        }

        .legal {
            width: 70%;
        }

        .degree {
            white-space: pre-wrap;
        }
    </style>
</head>

<body>
    <div id="invoiceholder">
        ${entityLayout}
        <div>
            <div id="invoice-mid">
                <div class="info">
                    <h2>Name : ${patientName}</h2>
                    <p>Age/Gender : ${patientAgeGender}
                    </p>
                </div>
                <div id="project">
                    <h2>Date : ${prescriptionDate}</h2>
                    <p>Mobile No : ${patientMobileNumber}
                    </p>
                </div>
            </div>
        </div>
        <hr style="background-color: rgb(226, 223, 223) margin: 0px ${prescriptionPrintSettings.marginRight} 0px ${prescriptionPrintSettings.marginLeft};">
        <div id="invoice" class="effect2">
            <div id="invoice-bot">
                <div id="left-section">
                ${settings.vitals ? `<p><strong>Vital : </strong> ${vital}</p> <br>` : ``}
                    ${symptomsLayout}
                    ${clinicalFindingLayout}
                    ${diagnosesLayout}
                </div>
                
                    ${medicineTable}
               
                <div id="right-section">
                    ${investigationsLayout}
                    ${instructionsLayout}
                    ${followupLayout}
                    <div style="display: flex; align-items: center;">
    <div class="info" style="flex: 1; margin-right: 20px;">
        <p style="color: blue; margin: 0;">Download your prescription on Q UP app</p>
        <img id="qr-code" alt="Clinic logo" width="68" height="68">
    </div>
    <div id="project" style="flex: 1;">
        ${footer}
    </div>
                </div>
            </div>
        </div>
    </div>
    <div>
</div>

</div>

</div>
    </div>
    <script>
    window.onload = async () => {
        const [clinicLogoImg, qrCodeImg] = await Promise.all([
            new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = '${entiyLogo}';
            }),
            new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.src = '${qrCode}';
            })
        ]);

        document.getElementById('clinic-logo').src = clinicLogoImg.src;
        document.getElementById('qr-code').src = qrCodeImg.src;
    };
    </script>
</body>

</html>
`;

    const page = await browserInstance.newPage();

    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    // Wait for the image to load
    await page.waitForSelector('#qr-code');
    if (settings.letterHead) {
        await page.waitForSelector('#clinic-logo');
    }
    const pdfBuffer = await page.pdf();
    res.setHeader('Content-Type', 'application/pdf');
    console.log('data ',req.body);
    res.send(pdfBuffer);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
