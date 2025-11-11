"use client";

import html2canvas from 'html2canvas';
import { createClient } from "@/utils/supabase/client";

export interface InvoiceData {
  customerName: string;
  mobileNumber: string;
  amount: number;
  paymentMode: "cash" | "upi";
  planDuration: string;
  validFrom: string;
  validUntil: string;
  invoiceNumber: string;
}

const generateInvoiceNumber = () => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

export const generateInvoiceHTML = (data: InvoiceData) => {
  // Add debugging
  console.log('Generating invoice with data:', data);
  
  // Validate required fields
  if (!data.customerName || !data.mobileNumber) {
    console.error('Missing required customer data:', data);
  }

  const invoiceHTML = `
 <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: white; padding: 20px;">
  <div id="invoice" style="width: 100%; max-width: 800px; padding: 20px; font-family: Arial, sans-serif; border: 2px solid black; background-color: white; color: black; box-sizing: border-box;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h1 style="color: #1a56db; margin: 0; font-size: 24px;">SR Fitness</h1>
      <p style="color: #4b5563; margin: 5px 0; font-size: 16px;">Fitness Center Invoice</p>
    </div>

    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 30px;">
      <div style="flex: 1; min-width: 200px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 18px;">Bill To:</h3>
        <div style="color: black;">
          <p style="margin: 5px 0; color: black; font-size: 14px;">${data?.customerName || 'N/A'}</p>
          <p style="margin: 5px 0; color: black; font-size: 14px;">Mobile: ${data?.mobileNumber || 'N/A'}</p>
        </div>
      </div>
      <div style="flex: 1; min-width: 200px; text-align: right;">
        <p style="margin: 5px 0; color: black; font-size: 14px;">Invoice #: ${data.invoiceNumber}</p>
        <p style="margin: 5px 0; color: black; font-size: 14px;">Date: ${new Date().toLocaleDateString()}</p>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-size: 14px; color: black;">Description</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-size: 14px; color: black;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: black;">
            Gym Membership - ${data.planDuration} Month<br>
            <small style="color: #6b7280; font-size: 12px;">Valid from: ${data.validFrom} to ${data.validUntil}</small>
          </td>
          <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: black;">₹${data.amount}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 14px; color: black;">Total:</td>
          <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 14px; color: black;">₹${data.amount}</td>
        </tr>
      </tfoot>
    </table>

    <div style="margin-bottom: 30px;">
      <p style="margin: 5px 0; color: black; font-size: 14px;"><strong>Payment Method:</strong> ${data.paymentMode.toUpperCase()}</p>
    </div>

    <div style="text-align: center; color: #6b7280; font-size: 12px;">
      <p>Thank you for choosing SR Fitness!</p>
      <p>For any queries, please contact us at your convenience.</p>
    </div>
  </div>
</div>
  `;

  return invoiceHTML;
};

export const generateAndUploadInvoice = async (
  data: InvoiceData
): Promise<string> => {
  console.log('Starting invoice generation with data:', data);
  const supabase = createClient();
  
  try {
    // Create a temporary container for the invoice
    const container = document.createElement('div');
    container.innerHTML = generateInvoiceHTML(data);
    document.body.appendChild(container);

    // Add a small delay and log the rendered content
    await new Promise(resolve => {
      setTimeout(() => {
        console.log('Rendered invoice HTML:', container.innerHTML);
        resolve(true);
      }, 200);
    });

    // Generate canvas from HTML with specific options
    const canvas = await html2canvas(container, {
      scale: 2, // Increased scale for better quality
      logging: true,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      onclone: (document) => {
        console.log('HTML2Canvas cloned document');
        const clonedInvoice = document.querySelector('#invoice');
        if (clonedInvoice) {
          console.log('Found cloned invoice element');
        } else {
          console.error('Could not find cloned invoice element');
        }
      }
    });

    document.body.removeChild(container);

    // Convert canvas to blob with higher quality
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.95);
    });

    // Create file from blob
    const file = new File([blob], `invoice-${data.invoiceNumber}.jpeg`, {
      type: 'image/jpeg'
    });

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gymweb/invoices')
      .upload(`${data.customerName}/${file.name}`, file);

    if (uploadError) {
      console.error('Error uploading invoice:', uploadError);
      throw new Error(`Error uploading invoice: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData} = supabase.storage
      .from('gymweb/invoices')
      .getPublicUrl(`${data.customerName}/${file.name}`);

    if (!urlData) {
      console.error('Error getting public URL');
      throw new Error(`Error getting public URL`);
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};

export default generateAndUploadInvoice;