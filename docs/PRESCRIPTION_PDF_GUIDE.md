# Prescription PDF Download Functionality

This document describes the PDF download functionality added to the MediOca Healthcare Platform.

## Features

### 1. Professional Prescription PDF Generation
- **High-quality PDF output** with proper medical formatting
- **Standardized layout** following medical prescription standards
- **Print-ready format** with proper margins and spacing
- **Professional header** with clinic information
- **Patient and doctor details** clearly displayed
- **Prescription details** with medication, dosage, frequency, and duration
- **Warnings and interactions** prominently highlighted
- **Signature areas** for doctor authentication
- **Unique prescription ID** for tracking

### 2. Multiple Download Options
- **Direct PDF generation** using jsPDF library
- **HTML to PDF conversion** for complex layouts
- **Print functionality** for immediate printing
- **Customizable formatting** for different clinic needs

## Components

### PrescriptionPDFGenerator (`lib/pdf-generator.ts`)
Main utility class for generating prescription PDFs:
- `generatePrescriptionPDF()` - Creates formatted PDF using jsPDF
- `downloadPrescriptionFromHTML()` - Converts HTML element to PDF
- Professional medical formatting with proper sections

### PrescriptionPDFView (`components/prescriptions/prescription-pdf-view.tsx`)
React component for displaying prescription in PDF-ready format:
- Professional layout with medical standards
- Print-optimized styling
- Download and print buttons
- Responsive design

### Updated Components
- **PrescriptionCard** - Added PDF download button
- **Prescription Detail Page** - Added view/edit toggle with PDF preview
- **Print Styles** - Added CSS for clean print output

## Usage

### From Prescription List
1. Navigate to `/prescriptions`
2. Find any prescription card
3. Click the "PDF" button to download

### From Prescription Detail Page
1. Navigate to `/prescriptions/[id]`
2. Click "View PDF" toggle
3. Use "Download PDF", "HTML to PDF", or "Print" buttons

### Programmatic Usage
```typescript
import { downloadPrescriptionPDF } from '@/lib/pdf-generator'

const handleDownload = async () => {
  await downloadPrescriptionPDF({
    ...prescription,
    doctor_name: "Dr. Smith",
    patient_name: "John Doe",
    clinic_name: "MediOca Healthcare",
    clinic_address: "123 Medical St"
  })
}
```

## PDF Content Structure

### Header Section
- Clinic/Hospital name and address
- "PRESCRIPTION" title
- Prescription ID and date

### Doctor Information
- Doctor name with "Dr." prefix
- Specialization
- License information

### Patient Information
- Patient full name
- Email address
- Age (if available)
- Phone number (if available)

### Prescription Details
- Medication name (prominent display)
- Dosage information
- Frequency of administration
- Duration of treatment
- Special instructions (if any)

### Warnings Section
- Drug warnings highlighted in red
- Drug interactions listed
- Important safety information

### Footer
- Doctor signature area
- Date field
- Disclaimer text

## Technical Details

### Dependencies
- `jspdf` - PDF generation library
- `html2canvas` - HTML to canvas conversion
- `@types/jspdf` - TypeScript definitions

### File Naming Convention
PDFs are automatically named as:
`prescription_[PATIENT_NAME]_[DATE].pdf`

Example: `prescription_John_Doe_2025-06-20.pdf`

### Print Optimization
- A4 paper size optimization
- Proper margins and spacing
- Color preservation for warnings
- Clean typography

## Customization

### Clinic Branding
Update the PDF generator with your clinic information:
```typescript
const prescriptionData = {
  ...prescription,
  clinic_name: "Your Clinic Name",
  clinic_address: "Your Address",
  doctor_license: "Your License Info"
}
```

### Styling
Modify print styles in `styles/prescription-print.css`:
- Colors for warnings and headers
- Font sizes and spacing
- Layout adjustments

## Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Limited (print may vary)

## Security Considerations
- PDFs are generated client-side
- No prescription data is sent to external servers
- Patient information remains secure
- PDF contains watermark indicating computer generation

## Troubleshooting

### PDF Not Downloading
1. Check browser popup blockers
2. Ensure JavaScript is enabled
3. Try the "HTML to PDF" alternative method

### Formatting Issues
1. Check print preview first
2. Adjust browser zoom to 100%
3. Use "Print" button for immediate printing

### Missing Information
1. Ensure all required prescription fields are filled
2. Check doctor and patient data completeness
3. Verify medication details are saved

## Future Enhancements
- Electronic signature integration
- Batch PDF generation
- Custom templates
- QR code for verification
- Integration with pharmacy systems
