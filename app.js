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
    const prescriptionFontConfiguration = requestData.prescriptionPrintSettings.prescriptionFontConfiguration ? requestData.prescriptionPrintSettings.prescriptionFontConfiguration : {};
    const language = getLanguage(requestData.language ? requestData.language.trim() : "");

    function getLanguage(language) {
        switch (language.toLowerCase()) {
            case 'english':
                return 'Devanagari';
                break;
            case 'marathi':
                return 'Devanagari';
                break;
            case 'hindi':
                return 'Devanagari';
                break;
            default:
                return language;

        }
    }

    const entityLayout = settings.letterHead ? `
    <div>
        <div id="invoice-mid" style="display: flex; justify-content: space-between;">
            ${entityLogo ? `<img src="data:image/png;base64,${entityLogo}" width="68" height="68" style="display: block; margin: 0 auto;"><br>` : ``}
            <div class="info" style="width: calc(50% - 10px);">
                <h2 style="font-size: ${prescriptionFontConfiguration.fontHeader}px;">${clinicName}</h2>
                <p style="max-width: 100%; font-size: ${prescriptionFontConfiguration.fontHeader}px;">${clinicAddress}<br>
    <span style="font-size: ${prescriptionFontConfiguration.fontHeader}px;"><strong>Contact :</strong> ${clinicContact}</span>
  </span></p>
            </div>
            <div id="project" style="width: calc(50% - 10px);">
                <h2 style="font-size: ${prescriptionFontConfiguration.fontHeader}px;">${doctorName}</h2>
                <p class="degree" style="max-width: 100%; word-wrap: break-word; font-size: ${prescriptionFontConfiguration.fontHeader}px;">${doctorDegress}</span></p>
            </div>
        </div>
        <hr style="background-color: rgb(226, 223, 223);">
    </div>
    ` : '';
    const symptomsLayout = settings.symptoms ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Symptoms :</strong></span> <span style="font-size: ${prescriptionFontConfiguration.fontDetails}px;">${symptoms}</span></p>
<br>`: '';
    const clinicalFindingLayout = settings.clinicalFinding ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Clinical Findings :</strong></span> <span style="font-size: ${prescriptionFontConfiguration.fontDetails}px;"> ${clinicalFindings}</span></p>
<br>`: '';

    const diagnosesLayout = settings.diagnosis ?
        `${diagnoses ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Diagnosis :</strong> </span> <span style="font-size: ${prescriptionFontConfiguration.fontDetails}px;">${diagnoses}</span></p>
<br>`: ``}
`: ``;
    const medicineHeaders = ` <tr class="tabletitle">
    <td class="sr">
        <h2 style="font-size: ${prescriptionFontConfiguration.fontHeader}px;">RX </h2>
    </td>
    <td class="item">
    <h2 style="font-size: ${prescriptionFontConfiguration.fontHeader}px;">BRANDS </h2>
    </td>
    <td class="Hours">
    <h2 style="font-size: ${prescriptionFontConfiguration.fontHeader}px;">FREQUENCY </h2>
    </td>
    <td class="Rate">
    <h2 style="font-size: ${prescriptionFontConfiguration.fontHeader}px;">DURATION </h2>
    </td>
    ${settings.totalQuantity ? `
    <td class="subtotal">
    <h2 style="font-size: ${prescriptionFontConfiguration.fontHeader}px;">QUANTITY </h2>
    </td>
    `: ``}
</tr>`;
    const medicineTable = medicineDTOS && medicineDTOS.length > 0 ? `
<div id="middle-section">
    <div id="table">
        <table>
            ${medicineHeaders}
            ${medicineDTOS.map((medicine, index) => `
                <tr class="service">
                    <td class="tableitem">
                        <p style="font-size: ${prescriptionFontConfiguration.fontDetails}px;" class="itemtext">${index + 1}</p>
                    </td>
                    <td class="tableitem">
                        <p style="font-size: ${prescriptionFontConfiguration.fontDetails}px;" class="itemtext">${medicine.brandName ? medicine.brandName : ""}</p>
                        ${settings.medicineComposition ? `<p style="font-size: ${prescriptionFontConfiguration.fontGeneric}px;" class="itemtext">${medicine.genericName ? medicine.genericName : ""}</p>` : ``}
                    </td>
                    <td class="tableitem">
                        <p style="font-size: ${prescriptionFontConfiguration.fontDetails}px;" class="itemtext">${medicine.frequancy ? medicine.frequancy : ""}</p>
                    </td>
                    <td class="tableitem">
                        <p style="font-size: ${prescriptionFontConfiguration.fontDetails}px;" class="itemtext">${medicine.duration ? medicine.duration : ""}</p>
                    </td>
                    ${settings.totalQuantity ? `
                        <td class="tableitem">
                            <p style="font-size: ${prescriptionFontConfiguration.fontDetails}px;" class="itemtext">${medicine.quantity ? medicine.quantity : ""}</p>
                        </td>
                    ` : ``}      
                </tr>`
    ).join('')}
        </table>
    </div>
    <br>
</div>
` : '';

    const investigationsLayout =
        `${investigations ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Investigations :</strong></span> <span style="font-size: ${prescriptionFontConfiguration.fontDetails}px;"> ${investigations}</span></p>
    <br>`: ``}
`;
    const instructionsLayout = settings.instruction ? `
    ${instructions ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>General instructions :</strong></span></p>
<p style="font-size: ${prescriptionFontConfiguration.fontDetails}px;" >${instructions}</p>` : ``}
<br>
`: '';
    const footer = settings.signature ? ` <div>
        <h2 style="font-size: ${prescriptionFontConfiguration.fontHeader}px;" >${doctorName}</h2>
        <p class="degree" style="max-width: 600px; word-wrap: break-word; font-size: ${prescriptionFontConfiguration.fontHeader}px;">${doctorDegress}</p>
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
            // font-size: 1.5em;
            color: #222;
        }

        h2 {
            // font-size: .9em;
        }

        h3 {
            // font-size: 1.2em;
            font-weight: 300;
            line-height: 2em;
        }

        p {
            // font-size: .7em;
            color: #666;
            line-height: 1.2em;
        }

        #invoiceholder {
            width: 100%;
            height: 100%;
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
            // padding: 30px;
        }

        [id*='bottomline-'] {
            border-bottom: 1px solid #EEE;
            // padding: 30px;
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
            padding: 5px 0 5px 5px;
            border: 1px solid #EEE
        }

        .tabletitle {
            padding: 0px;
            background: #EEE;
        }

        .service {
            border: 1px solid #EEE;
        }

        .item {
            width: 50%;
        }

        .itemtext {
            // font-size: 11px;
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
<div  style=" margin-top: ${prescriptionPrintSettings.marginTop * 37.7952755906}px; 
margin-bottom: ${prescriptionPrintSettings.marginBottom * 37.7952755906}px; 
margin-left: ${prescriptionPrintSettings.marginLeft * 37.7952755906}px; 
margin-right: ${prescriptionPrintSettings.marginRight * 37.7952755906}px;">
<div >
${entityLayout}
<div> 
</div>
<div>
    <div id="invoice-mid" style="display: flex; justify-content: space-between;">
        <div class="info" style="width: calc(50% - 25px);">
            <h2 style="max-width: 100%; font-size: ${prescriptionFontConfiguration.fontTitle}px;">${patientName}</h2>
            <p style="max-width: 100%; font-size: ${prescriptionFontConfiguration.fontTitle}px;">
                <strong>Age/Gender :</strong> ${patientAgeGender}
            </p>
        </div>
        <div id="project" style="width: calc(50% - 25px);">
            <h2 style="max-width: 100%; font-size: ${prescriptionFontConfiguration.fontTitle}px;">Date : ${prescriptionDate}</h2>
            <p  style="max-width: 100%; word-wrap: break-word; font-size: ${prescriptionFontConfiguration.fontTitle}px;">
                <strong>Mobile No :</strong> ${patientMobileNumber}
            </p>
        </div>
    </div>
</div>
</div>

        <hr style="background-color: rgb(226, 223, 223) margin: 0px ${prescriptionPrintSettings.marginRight} 0px ${prescriptionPrintSettings.marginLeft};">
        <div id="invoice" class="effect2">
            <div id="invoice-bot">
                <div id="left-section">
                ${vital ? settings.vitals ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Vital : </strong> ${vital}</span></p> <br>` : `` : ''}
                    ${symptoms ? symptomsLayout : ''}
                    ${clinicalFindings ? clinicalFindingLayout : ''}
                    ${diagnoses ? diagnosesLayout : ''}
                </div>
                    ${medicineTable}
                <div id="right-section">
                ${medicalInfoOfGynecModule.gptal ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>GTPAL :</strong> ${medicalInfoOfGynecModule.gptal}</span></p> <br> ` : ``}
                ${medicalInfoOfGynecModule.lmpOrEdd ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>LMP/EDD :</strong> ${medicalInfoOfGynecModule.lmpOrEdd}</span></p> <br> ` : ``}
                ${medicalInfoOfGynecModule.cEdd ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>C-EDD :</strong> ${medicalInfoOfGynecModule.cEdd}</span></p> <br> ` : ``}
                ${medicalInfoOfGynecModule.cycle ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Cycle :</strong> ${medicalInfoOfGynecModule.cycle}</span></p> <br> ` : ``}
                ${medicalInfoOfGynecModule.flow ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Flow :</strong> ${medicalInfoOfGynecModule.flow}</span></p> <br> ` : ``}
                ${medicalInfoOfGynecModule.surgeryList ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Surgery :</strong> ${medicalInfoOfGynecModule.surgeryList}</span></p> <br> ` : ``}
                ${medicalInfoOfGynecModule.patientHistory ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Patient Medical Disease :</strong> ${medicalInfoOfGynecModule.patientHistory}</span></p> <br> ` : ``}
                ${medicalInfoOfGynecModule.familyMemberHistory ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Family Member Medical Disease :</strong> ${medicalInfoOfGynecModule.familyMemberHistory}</span></p> <br> ` : ``}
                ${medicalInfoOfGynecModule.breastCancer ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Breast Cancer :</strong> ${medicalInfoOfGynecModule.breastCancer}</span></p> <br> ` : ``}
                ${medicalInfoOfGynecModule.childWithMentalOrGeneticDisorder ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Child with mental or genetic disorder :</strong> ${medicalInfoOfGynecModule.childWithMentalOrGeneticDisorder}</span></p> <br> ` : ``}
                ${medicalInfoOfGynecModule.menopausheAge ? `<p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Menopause Age :</strong> ${medicalInfoOfGynecModule.menopausheAge}</span></p> <br> ` : ``}
               
                    ${investigations ? investigationsLayout : ''}
                    ${instructions ? instructionsLayout : ''}
                    ${followupDate ? ` <p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Next Follow-up :</strong> Date:- ${followupDate}</span></p> <br> ` : ``}
                    ${followupNote ? ` <p><span style="font-size: ${prescriptionFontConfiguration.fontTitle}px;"><strong>Followup Note : </strong> ${followupNote}</span></p> <br> ` : ``}

                    <div style="display: flex; align-items: center;">
                    <div class="info" style="flex: 1; margin-right: 20px;">
                    ${qrCode ? `
                    <img src="data:image/png;base64,${qrCode}" width="38" height="38" style="display: block; margin: 0 auto;"</img>
                    <p style="color: blue; margin: 0; font-size: 10px;">Download your prescription on Q UP app</p>
                    ` : ``}
                    </div>
                    <div id="project" style="flex: 1;"> ${footer} </div>
                </div>
            </div>
        </div>
     </div>
    <div>
</div>
</div>
</div>
    </div>
    </div>
    <script>
    </script>
</body>
</html>
`;

    const page = await browserInstance.newPage();
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
