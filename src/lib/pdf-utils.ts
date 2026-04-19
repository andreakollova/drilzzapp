import jsPDF from "jspdf";
import QRCode from "qrcode";

// Load image and convert to base64
export const loadImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Failed to load image:", e);
    return null;
  }
};

// Add Drilzz branded header
export const addDrilzzHeader = (
  pdf: jsPDF,
  pageWidth: number,
  margin: number
): number => {
  pdf.setFillColor(233, 0, 68); // Hot pink primary
  pdf.rect(0, 0, pageWidth, 30, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("Drilzz", margin, 20);
  return 45; // Return Y position after header
};

// Add footer with QR code
export const addDrilzzFooter = async (
  pdf: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  url: string
): Promise<void> => {
  const qrCodeDataUrl = await QRCode.toDataURL(url, {
    width: 200,
    margin: 1,
  });

  const qrSize = 40;
  const qrX = pageWidth - margin - qrSize;
  const qrY = pageHeight - margin - qrSize - 15;

  pdf.addImage(qrCodeDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(100, 100, 100);
  pdf.text("Scan to view online", qrX, qrY + qrSize + 5);
  pdf.text("Drilzz.com", margin, pageHeight - 10);
};

// Generate a drill page in PDF
export const generateDrillPage = async (
  pdf: jsPDF,
  drill: any,
  startY: number,
  pageWidth: number,
  pageHeight: number,
  margin: number
): Promise<number> => {
  let yPosition = startY;

  // Drill Title
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  const titleLines = pdf.splitTextToSize(drill.title, pageWidth - 2 * margin);
  pdf.text(titleLines, margin, yPosition);
  yPosition += titleLines.length * 10 + 5;

  // Badges/Metadata
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  const metadata = `${drill.sport} | ${drill.category} | ${drill.difficulty} | ${drill.age_group}`;
  pdf.text(metadata, margin, yPosition);
  yPosition += 10;

  // Separator line
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Add drill diagram image if available
  if (drill.image_url && !drill.image_url.includes("placeholder")) {
    const imageData = await loadImageAsBase64(drill.image_url);
    if (imageData) {
      const imgWidth = 170;
      const imgHeight = 100;
      const imgX = (pageWidth - imgWidth) / 2;

      pdf.addImage(imageData, "PNG", imgX, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 15;
    }
  }

  // Quick Info Section
  if (drill.duration || drill.players || drill.equipment) {
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Quick Info", margin, yPosition);
    yPosition += 8;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    if (drill.duration) {
      pdf.text(`Duration: ${drill.duration} minutes`, margin + 5, yPosition);
      yPosition += 6;
    }
    if (drill.players) {
      pdf.text(`Players: ${drill.players}`, margin + 5, yPosition);
      yPosition += 6;
    }
    if (drill.equipment) {
      pdf.text(`Equipment: ${drill.equipment}`, margin + 5, yPosition);
      yPosition += 6;
    }
    yPosition += 5;
  }

  // Description Section
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = margin;
  }
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Description", margin, yPosition);
  yPosition += 8;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const descriptionLines = pdf.splitTextToSize(
    drill.description,
    pageWidth - 2 * margin
  );
  descriptionLines.forEach((line: string) => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });
  yPosition += 8;

  // Coaching Points Section
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = margin;
  }
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Coaching Points", margin, yPosition);
  yPosition += 8;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const coachingLines = pdf.splitTextToSize(
    drill.coaching_points,
    pageWidth - 2 * margin
  );
  coachingLines.forEach((line: string) => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });

  return yPosition;
};

// Generate batch drills PDF
export const generateBatchDrillsPDF = async (
  drills: any[],
  filename?: string
): Promise<void> => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // Cover page
  let yPosition = addDrilzzHeader(pdf, pageWidth, margin);
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("Training Drills Export", margin, yPosition);
  yPosition += 15;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(`${drills.length} drill${drills.length !== 1 ? "s" : ""} selected`, margin, yPosition);
  
  const totalDuration = drills.reduce((sum, d) => sum + (d.duration || 0), 0);
  if (totalDuration > 0) {
    yPosition += 8;
    pdf.text(`Total duration: ${totalDuration} minutes`, margin, yPosition);
  }

  // Generate each drill
  for (let i = 0; i < drills.length; i++) {
    pdf.addPage();
    yPosition = addDrilzzHeader(pdf, pageWidth, margin);
    
    // Drill number indicator
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Drill ${i + 1} of ${drills.length}`, margin, yPosition - 5);
    
    await generateDrillPage(
      pdf,
      drills[i],
      yPosition + 5,
      pageWidth,
      pageHeight,
      margin
    );
  }

  // Add footer to last page
  await addDrilzzFooter(pdf, pageWidth, pageHeight, margin, "https://drilzz.com");

  const finalFilename = filename || `drilzz_drills_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(finalFilename);
};

// Generate batch sessions PDF
export const generateBatchSessionsPDF = async (
  sessions: any[],
  filename?: string
): Promise<void> => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;

  // Cover page
  let yPosition = addDrilzzHeader(pdf, pageWidth, margin);
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("Training Sessions Export", margin, yPosition);
  yPosition += 15;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(`${sessions.length} session${sessions.length !== 1 ? "s" : ""} selected`, margin, yPosition);

  // Generate each session
  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    pdf.addPage();
    yPosition = addDrilzzHeader(pdf, pageWidth, margin);
    
    // Session number indicator
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Session ${i + 1} of ${sessions.length}`, margin, yPosition - 5);
    yPosition += 5;
    
    // Session title
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const titleLines = pdf.splitTextToSize(session.name, pageWidth - 2 * margin);
    pdf.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * 10 + 5;

    // Metadata
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const metadata = `${session.sport} | ${session.total_duration} min`;
    pdf.text(metadata, margin, yPosition);
    yPosition += 10;

    // Description
    if (session.description) {
      const descLines = pdf.splitTextToSize(session.description, pageWidth - 2 * margin);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      descLines.forEach((line: string) => {
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    }
  }

  // Add footer to last page
  await addDrilzzFooter(pdf, pageWidth, pageHeight, margin, "https://drilzz.com");

  const finalFilename = filename || `drilzz_sessions_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(finalFilename);
};
