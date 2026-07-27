
//utils/PdfGenerator.java
package com.hrms.utils;

import com.hrms.model.OfferLetter;
import com.itextpdf.html2pdf.HtmlConverter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Component
@Slf4j
public class PdfGenerator {

 public byte[] generateOfferLetterPdf(OfferLetter offer) {
     try {
         String html = buildOfferLetterHtml(offer);
         return generatePdfFromHtml(html, "Offer Letter");
     } catch (Exception e) {
         log.error("Error generating PDF: ", e);
         throw new RuntimeException("Failed to generate PDF");
     }
 }

 public byte[] generatePdfFromHtml(String htmlContent, String title) {
     try {
         String fullHtml = wrapInHtmlTemplate(htmlContent, title);
         ByteArrayOutputStream baos = new ByteArrayOutputStream();
         HtmlConverter.convertToPdf(fullHtml, baos);
         return baos.toByteArray();
     } catch (Exception e) {
         log.error("Error generating PDF from HTML: ", e);
         throw new RuntimeException("Failed to generate PDF");
     }
 }

 private String buildOfferLetterHtml(OfferLetter offer) {
     DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd MMM yyyy");

     return String.format("""
         <div style="padding: 40px; font-family: Arial, sans-serif;">
             <div style="text-align: center; margin-bottom: 30px;">
                 <h1 style="color: #1e40af; margin: 0;">POTLA TECH SOLUTIONS</h1>
                 <p style="color: #6b7280; margin: 5px 0;">Human Resource Management</p>
                 <hr style="border: 1px solid #e5e7eb;"/>
             </div>

             <div style="text-align: right; margin-bottom: 20px;">
                 <strong>Offer #:</strong> %s<br/>
                 <strong>Date:</strong> %s
             </div>

             <h2 style="color: #1e40af;">OFFER OF EMPLOYMENT</h2>

             <p>Dear <strong>%s</strong>,</p>

             <p>We are pleased to offer you the position of 
             <strong>%s</strong> at Potla Tech Solutions. 
             We were impressed with your background and believe you 
             will make a valuable addition to our team.</p>

             <h3 style="color: #374151;">Terms of Employment:</h3>

             <table style="width: 100%%; border-collapse: collapse;">
                 <tr>
                     <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                         <strong>Position</strong></td>
                     <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                         %s</td>
                 </tr>
                 <tr>
                     <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                         <strong>Department</strong></td>
                     <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                         %s</td>
                 </tr>
                 <tr>
                     <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                         <strong>Annual CTC</strong></td>
                     <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                         ₹ %s</td>
                 </tr>
                 <tr>
                     <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                         <strong>Employment Type</strong></td>
                     <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                         %s</td>
                 </tr>
                 <tr>
                     <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                         <strong>Joining Date</strong></td>
                     <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                         %s</td>
                 </tr>
                 <tr>
                     <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                         <strong>Reporting To</strong></td>
                     <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                         %s</td>
                 </tr>
                 <tr>
                     <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                         <strong>Work Location</strong></td>
                     <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                         %s</td>
                 </tr>
             </table>

             %s

             <p style="margin-top: 20px;">This offer is valid until 
             <strong>%s</strong>. Please confirm your acceptance by 
             signing and returning this letter.</p>

             <p>We look forward to welcoming you to our team!</p>

             <br/><br/>
             <p><strong>Sincerely,</strong><br/>
             HR Department<br/>
             Potla Tech Solutions</p>

             <br/><br/>
             <hr style="border: 1px solid #e5e7eb;"/>
             <p style="text-align: center; color: #6b7280; font-size: 12px;">
                 This is a computer-generated document.
             </p>
         </div>
         """,
         offer.getOfferNumber(),
         offer.getOfferDate().format(dateFmt),
         offer.getCandidateName(),
         offer.getPosition(),
         offer.getPosition(),
         offer.getDepartment() != null ?
                 offer.getDepartment().getName() : "N/A",
         offer.getOfferedSalary(),
         offer.getEmploymentType().name().replace("_", " "),
         offer.getJoiningDate().format(dateFmt),
         offer.getReportingManager() != null ?
                 offer.getReportingManager() : "N/A",
         offer.getWorkLocation() != null ?
                 offer.getWorkLocation() : "N/A",
         offer.getAdditionalTerms() != null ?
                 "<h3>Additional Terms:</h3><p>" +
                         offer.getAdditionalTerms() + "</p>" : "",
         offer.getExpiryDate().format(dateFmt)
     );
 }

 private String wrapInHtmlTemplate(String content, String title) {
     return """
         <!DOCTYPE html>
         <html>
         <head>
             <meta charset="UTF-8"/>
             <title>%s</title>
             <style>
                 body { font-family: Arial, sans-serif; line-height: 1.6; }
                 h1, h2, h3 { color: #1e40af; }
                 table { width: 100%%; border-collapse: collapse; }
             </style>
         </head>
         <body>
             %s
         </body>
         </html>
         """.formatted(title, content);
 }
}