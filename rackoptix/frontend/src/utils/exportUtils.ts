/**
 * Utility functions for handling file exports
 */

/**
 * Triggers a file download from a data URL
 * @param dataUrl The data URL containing the file content
 * @param filename The name to give the downloaded file
 */
export const downloadFromDataUrl = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Converts a canvas element to a data URL
 * @param canvas The canvas element to convert
 * @param format The image format (default: 'png')
 * @param quality The image quality for JPEG format (0-1)
 * @returns A data URL containing the image data
 */
export const canvasToDataUrl = (
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.92
): string => {
  return canvas.toDataURL(`image/${format}`, quality);
};

/**
 * Converts an SVG element to a data URL
 * @param svgElement The SVG element to convert
 * @returns A data URL containing the SVG data
 */
export const svgToDataUrl = (svgElement: SVGElement): string => {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  return URL.createObjectURL(svgBlob);
};

/**
 * Converts JSON data to a downloadable data URL
 * @param data The JSON data to convert
 * @returns A data URL containing the JSON data
 */
export const jsonToDataUrl = (data: any): string => {
  const jsonString = JSON.stringify(data, null, 2);
  const jsonBlob = new Blob([jsonString], { type: 'application/json' });
  return URL.createObjectURL(jsonBlob);
};

/**
 * Converts CSV data to a downloadable data URL
 * @param headers Array of column headers
 * @param rows Array of data rows
 * @returns A data URL containing the CSV data
 */
export const csvToDataUrl = (headers: string[], rows: any[][]): string => {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Handle cells that contain commas by wrapping in quotes
      if (cell && typeof cell === 'string' && cell.includes(',')) {
        return `"${cell}"`;
      }
      return cell;
    }).join(','))
  ].join('\n');
  
  const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  return URL.createObjectURL(csvBlob);
};

/**
 * Creates a PDF from HTML content
 * Note: This is a placeholder. In a real implementation, you would use a library like jsPDF
 * @param htmlContent The HTML content to convert to PDF
 * @returns A promise that resolves to a data URL containing the PDF
 */
export const htmlToPdfDataUrl = async (htmlContent: string): Promise<string> => {
  // This is a placeholder. In a real implementation, you would use a library like jsPDF
  console.log('Converting HTML to PDF:', htmlContent);
  
  // Simulate PDF generation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a fake data URL
  return 'data:application/pdf;base64,JVBERi0xLjcKJeLjz9MKNSAwIG9iago8PCAvVHlwZSAvWE9iamVjdCAvU3VidHlwZSA...';
};