/**
 * Certificate Generation Service
 * Generates PDF certificates for course completions
 */

import PDFDocument from 'pdfkit';
import fs from 'fs/promises';
import path from 'path';

class CertificateService {
  constructor() {
    this.certificatesDir = path.join(process.cwd(), 'certificates');
    this.ensureCertificatesDirectory();
  }

  async ensureCertificatesDirectory() {
    try {
      await fs.access(this.certificatesDir);
    } catch {
      await fs.mkdir(this.certificatesDir, { recursive: true });
    }
  }

  async generateCertificate({
    studentName,
    courseName,
    instructorName,
    completionDate,
    grade,
    certificateId,
    courseHours,
    skills = []
  }) {
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 50
    });

    const fileName = `certificate_${certificateId}.pdf`;
    const filePath = path.join(this.certificatesDir, fileName);

    // Create write stream
    const stream = doc.pipe(require('fs').createWriteStream(filePath));

    // Certificate background and border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(3)
      .stroke('#4F46E5');

    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .lineWidth(1)
      .stroke('#E5E7EB');

    // Header
    doc.fontSize(28)
      .font('Helvetica-Bold')
      .fillColor('#4F46E5')
      .text('CERTIFICATE OF COMPLETION', 0, 80, { align: 'center' });

    // Decorative line
    doc.moveTo(150, 120)
      .lineTo(doc.page.width - 150, 120)
      .lineWidth(2)
      .stroke('#10B981');

    // Main content
    doc.fontSize(16)
      .font('Helvetica')
      .fillColor('#374151')
      .text('This is to certify that', 0, 160, { align: 'center' });

    // Student name (prominent)
    doc.fontSize(32)
      .font('Helvetica-Bold')
      .fillColor('#1F2937')
      .text(studentName, 0, 200, { align: 'center' });

    // Has successfully completed
    doc.fontSize(16)
      .font('Helvetica')
      .fillColor('#374151')
      .text('has successfully completed the course', 0, 260, { align: 'center' });

    // Course name (prominent)
    doc.fontSize(24)
      .font('Helvetica-Bold')
      .fillColor('#4F46E5')
      .text(courseName, 0, 290, { align: 'center' });

    // Course details
    const detailsY = 340;
    doc.fontSize(14)
      .font('Helvetica')
      .fillColor('#6B7280');

    if (courseHours) {
      doc.text(`Course Duration: ${courseHours} hours`, 0, detailsY, { align: 'center' });
    }

    if (grade) {
      doc.text(`Final Grade: ${grade}`, 0, detailsY + 20, { align: 'center' });
    }

    // Skills acquired (if provided)
    if (skills.length > 0) {
      doc.fontSize(12)
        .text('Skills Acquired:', 0, detailsY + 50, { align: 'center' });
      
      doc.text(skills.join(' • '), 0, detailsY + 70, { 
        align: 'center',
        width: doc.page.width - 100
      });
    }

    // Date and signatures section
    const signaturesY = doc.page.height - 150;
    
    // Completion date
    doc.fontSize(12)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(`Date of Completion: ${new Date(completionDate).toLocaleDateString()}`, 100, signaturesY);

    // Instructor signature
    doc.text(`Instructor: ${instructorName}`, doc.page.width - 250, signaturesY);

    // Certificate ID (bottom right)
    doc.fontSize(10)
      .fillColor('#9CA3AF')
      .text(`Certificate ID: ${certificateId}`, doc.page.width - 200, doc.page.height - 50);

    // Mini Coursera logo/branding (bottom left)
    doc.fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#4F46E5')
      .text('Mini Coursera', 50, doc.page.height - 50);

    // Verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-certificate/${certificateId}`;
    doc.fontSize(8)
      .fillColor('#6B7280')
      .text(`Verify at: ${verificationUrl}`, 50, doc.page.height - 35);

    // Add decorative elements
    this.addDecorativeElements(doc);

    // Finalize PDF
    doc.end();

    // Wait for file to be written
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return {
      fileName,
      filePath,
      downloadUrl: `/api/certificates/download/${certificateId}`,
      verificationUrl
    };
  }

  addDecorativeElements(doc) {
    // Add decorative corner elements
    const cornerSize = 30;
    
    // Top left corner
    doc.save()
      .translate(60, 60)
      .rotate(0)
      .moveTo(0, 0)
      .lineTo(cornerSize, 0)
      .lineTo(cornerSize, 3)
      .lineTo(3, 3)
      .lineTo(3, cornerSize)
      .lineTo(0, cornerSize)
      .closePath()
      .fillColor('#10B981')
      .fill()
      .restore();

    // Top right corner
    doc.save()
      .translate(doc.page.width - 60, 60)
      .rotate(90)
      .moveTo(0, 0)
      .lineTo(cornerSize, 0)
      .lineTo(cornerSize, 3)
      .lineTo(3, 3)
      .lineTo(3, cornerSize)
      .lineTo(0, cornerSize)
      .closePath()
      .fillColor('#10B981')
      .fill()
      .restore();

    // Bottom left corner
    doc.save()
      .translate(60, doc.page.height - 60)
      .rotate(-90)
      .moveTo(0, 0)
      .lineTo(cornerSize, 0)
      .lineTo(cornerSize, 3)
      .lineTo(3, 3)
      .lineTo(3, cornerSize)
      .lineTo(0, cornerSize)
      .closePath()
      .fillColor('#10B981')
      .fill()
      .restore();

    // Bottom right corner
    doc.save()
      .translate(doc.page.width - 60, doc.page.height - 60)
      .rotate(180)
      .moveTo(0, 0)
      .lineTo(cornerSize, 0)
      .lineTo(cornerSize, 3)
      .lineTo(3, 3)
      .lineTo(3, cornerSize)
      .lineTo(0, cornerSize)
      .closePath()
      .fillColor('#10B981')
      .fill()
      .restore();

    // Add some decorative stars
    this.drawStar(doc, 120, 140, 8, '#F59E0B');
    this.drawStar(doc, doc.page.width - 120, 140, 8, '#F59E0B');
  }

  drawStar(doc, x, y, radius, color) {
    const outerRadius = radius;
    const innerRadius = radius * 0.4;
    const numPoints = 5;
    
    doc.save()
      .translate(x, y);

    doc.moveTo(0, -outerRadius);
    
    for (let i = 1; i <= numPoints * 2; i++) {
      const angle = (i * Math.PI) / numPoints;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const px = r * Math.sin(angle);
      const py = -r * Math.cos(angle);
      doc.lineTo(px, py);
    }
    
    doc.closePath()
      .fillColor(color)
      .fill()
      .restore();
  }

  async verifyCertificate(certificateId) {
    try {
      // In a real application, you would verify against database
      const filePath = path.join(this.certificatesDir, `certificate_${certificateId}.pdf`);
      await fs.access(filePath);
      
      return {
        valid: true,
        certificateId,
        generatedAt: (await fs.stat(filePath)).birthtime
      };
    } catch {
      return {
        valid: false,
        certificateId
      };
    }
  }

  async getCertificateFile(certificateId) {
    const filePath = path.join(this.certificatesDir, `certificate_${certificateId}.pdf`);
    
    try {
      await fs.access(filePath);
      return filePath;
    } catch {
      throw new Error('Certificate not found');
    }
  }

  async generateBatchCertificates(certificates) {
    const results = [];
    
    for (const certData of certificates) {
      try {
        const result = await this.generateCertificate(certData);
        results.push({
          success: true,
          certificateId: certData.certificateId,
          ...result
        });
      } catch (error) {
        results.push({
          success: false,
          certificateId: certData.certificateId,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Generate certificate with custom template
  async generateCustomCertificate(templateName, data) {
    // This could be extended to support different certificate templates
    // For now, use the default template
    return this.generateCertificate(data);
  }

  // Get certificate statistics
  async getCertificateStats() {
    try {
      const files = await fs.readdir(this.certificatesDir);
      const certificates = files.filter(f => f.startsWith('certificate_') && f.endsWith('.pdf'));
      
      const stats = {
        totalGenerated: certificates.length,
        generatedToday: 0,
        generatedThisMonth: 0
      };

      const today = new Date();
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      for (const file of certificates) {
        const filePath = path.join(this.certificatesDir, file);
        const stat = await fs.stat(filePath);
        
        if (stat.birthtime >= thisMonth) {
          stats.generatedThisMonth++;
        }
        
        if (stat.birthtime.toDateString() === today.toDateString()) {
          stats.generatedToday++;
        }
      }

      return stats;
    } catch (error) {
      return {
        totalGenerated: 0,
        generatedToday: 0,
        generatedThisMonth: 0,
        error: error.message
      };
    }
  }
}

export default CertificateService;