import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export const exportChartAsPNG = async (chartId: string, filename: string = 'chart') => {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error('Chart element not found');
  }

  const canvas = await html2canvas(chartElement, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
  });

  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

export const exportChartAsPDF = async (chartId: string, filename: string = 'chart') => {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    throw new Error('Chart element not found');
  }

  const canvas = await html2canvas(chartElement, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const imgWidth = 297; // A4 width in mm
  const pageHeight = 210; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;

  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(`${filename}.pdf`);
};

export const exportDataAsCSV = (data: any[], filename: string = 'data') => {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

export const exportDataAsExcel = (data: any[], filename: string = 'data') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};
