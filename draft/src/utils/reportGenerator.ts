// Report Generator Utility
// Generates beautiful HTML reports that can be printed or saved as PDF

interface ReportData {
  title: string;
  generatedDate: string;
  generatedBy: string;
  period?: string;
  department?: string;
  sections: ReportSection[];
}

interface ReportSection {
  title: string;
  type: 'stats' | 'table' | 'text' | 'chart';
  data: any;
}

export function generateReport(data: ReportData) {
  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 40px;
    }
    
    .header {
      text-align: center;
      padding: 30px 0;
      border-bottom: 3px solid #0F2D52;
      margin-bottom: 30px;
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .logo {
      width: 80px;
      height: 80px;
      background: #0F2D52;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 32px;
      font-weight: bold;
    }
    
    .header h1 {
      color: #0F2D52;
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .header h2 {
      color: #666;
      font-size: 24px;
      font-weight: normal;
      margin-bottom: 10px;
    }
    
    .university {
      color: #999;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .report-info {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .report-info-item {
      display: flex;
      flex-direction: column;
    }
    
    .report-info-item label {
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    
    .report-info-item value {
      color: #0F2D52;
      font-size: 16px;
      font-weight: 600;
    }
    
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    
    .section-title {
      color: #0F2D52;
      font-size: 20px;
      padding: 12px 0;
      border-bottom: 2px solid #0F2D52;
      margin-bottom: 20px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #0F2D52 0%, #1a4d7f 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .stat-card label {
      font-size: 12px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 8px;
    }
    
    .stat-card value {
      font-size: 32px;
      font-weight: bold;
      display: block;
    }
    
    .stat-card .change {
      font-size: 14px;
      margin-top: 5px;
      opacity: 0.9;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    thead {
      background: #0F2D52;
      color: white;
    }
    
    th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    td {
      padding: 12px 15px;
      border-bottom: 1px solid #e9ecef;
    }
    
    tbody tr:hover {
      background: #f8f9fa;
    }
    
    tbody tr:last-child td {
      border-bottom: none;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .badge-success {
      background: #d4edda;
      color: #155724;
    }
    
    .badge-info {
      background: #d1ecf1;
      color: #0c5460;
    }
    
    .badge-warning {
      background: #fff3cd;
      color: #856404;
    }
    
    .text-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #0F2D52;
    }
    
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #dee2e6;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    
    .star {
      color: #ffc107;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .section {
        page-break-inside: avoid;
      }
      
      @page {
        margin: 20mm;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <div class="logo">BK</div>
    </div>
    <div class="university">Ho Chi Minh City University of Technology</div>
    <h1>BK TUTOR SYSTEM</h1>
    <h2>${data.title}</h2>
  </div>
  
  <div class="report-info">
    <div class="report-info-item">
      <label>Generated Date</label>
      <value>${data.generatedDate}</value>
    </div>
    <div class="report-info-item">
      <label>Generated By</label>
      <value>${data.generatedBy}</value>
    </div>
    ${data.period ? `
    <div class="report-info-item">
      <label>Period</label>
      <value>${data.period}</value>
    </div>
    ` : ''}
    ${data.department ? `
    <div class="report-info-item">
      <label>Department</label>
      <value>${data.department}</value>
    </div>
    ` : ''}
  </div>
  
  ${data.sections.map(section => generateSection(section)).join('\n')}
  
  <div class="footer">
    <p>This report was automatically generated by BK TUTOR System</p>
    <p>© ${new Date().getFullYear()} HCMUT - All Rights Reserved</p>
  </div>
</body>
</html>
`;

  return html;
}

function generateSection(section: ReportSection): string {
  switch (section.type) {
    case 'stats':
      return generateStatsSection(section);
    case 'table':
      return generateTableSection(section);
    case 'text':
      return generateTextSection(section);
    default:
      return '';
  }
}

function generateStatsSection(section: ReportSection): string {
  const stats = section.data as Array<{ label: string; value: string; change?: string }>;
  return `
    <div class="section">
      <h3 class="section-title">${section.title}</h3>
      <div class="stats-grid">
        ${stats.map(stat => `
          <div class="stat-card">
            <label>${stat.label}</label>
            <value>${stat.value}</value>
            ${stat.change ? `<div class="change">${stat.change}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function generateTableSection(section: ReportSection): string {
  const { columns, rows } = section.data as { columns: string[], rows: any[][] };
  return `
    <div class="section">
      <h3 class="section-title">${section.title}</h3>
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map((cell, idx) => {
                // Check if it's a badge
                if (typeof cell === 'object' && cell.type === 'badge') {
                  return `<td><span class="badge badge-${cell.variant}">${cell.text}</span></td>`;
                }
                // Check if it's a star rating
                if (typeof cell === 'string' && cell.includes('★')) {
                  return `<td><span class="star">${cell}</span></td>`;
                }
                return `<td>${cell}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function generateTextSection(section: ReportSection): string {
  const text = section.data as string;
  return `
    <div class="section">
      <h3 class="section-title">${section.title}</h3>
      <div class="text-section">
        <p>${text}</p>
      </div>
    </div>
  `;
}

export function openReportInNewWindow(html: string) {
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
    
    // Auto-trigger print dialog after a short delay
    setTimeout(() => {
      newWindow.focus();
      newWindow.print();
    }, 500);
  }
}

export function downloadReportAsHTML(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
