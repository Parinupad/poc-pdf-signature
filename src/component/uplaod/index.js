import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import SignatureCapture from '../signatureCapture';

const PdfUploadAndSign = () => {
  const [pdfData, setPdfData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const pdfData = new Uint8Array(e.target.result);
        setPdfData(pdfData);
        setPdfUrl(URL.createObjectURL(new Blob([pdfData], { type: 'application/pdf' })));
      };
      fileReader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const addSignature = async () => {
    if (pdfData && signatureImage) {
      // Load the PDF
      const pdfDoc = await PDFDocument.load(pdfData);

      // Load the signature image
      const imageBytes = await fetch(signatureImage).then(res => res.arrayBuffer());
      const signatureImageEmbed = await pdfDoc.embedPng(imageBytes);

      // Add the signature image to the first page
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      firstPage.drawImage(signatureImageEmbed, {
        x: 50,
        y: 50,
        width: 150,
        height: 50,
      });

      // Save the modified PDF
      const pdfBytes = await pdfDoc.save();
      const signedPdfUrl = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
      setPdfUrl(signedPdfUrl);
    } else {
      alert('Please capture your signature first.');
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {pdfUrl && <iframe src={pdfUrl} style={{ width: '100%', height: '500px' }} />}
      <SignatureCapture onSignatureCapture={setSignatureImage} />
      <button onClick={addSignature}>Add Signature</button>
    </div>
  );
};

export default PdfUploadAndSign;
