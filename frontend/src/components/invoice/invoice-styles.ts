export const invoiceCss = `
  @page { 
    size: letter; 
    margin: 0; 
  }
  *, *::before, *::after { 
    box-sizing: border-box; 
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #000;
    font-size: 8.5pt;
    line-height: 1.3;
    -webkit-font-smoothing: antialiased;
  }

  .toolbar {
    width: 8.5in;
    max-width: 100%;
    margin: 0 auto 10px;
    display: flex;
    justify-content: flex-end;
  }
  .toolbar button {
    background: #0066cc;
    color: #fff;
    border: 0;
    border-radius: 6px;
    padding: 5px 12px;
    font: inherit;
    font-size: 12px;
    cursor: pointer;
  }
  .invoice-screen {
    background: #d9d9d9;
    padding: 12px 0;
    min-height: 100vh;
  }

  /* Hoja Letter Compacta */
  .sheet {
    width: 8.5in;
    height: 11in;
    position: relative;
    overflow: hidden;
    margin: 0 auto 16px;
    padding: 0.5in 0.5in 0.5in 0.5in;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    page-break-after: always;
    break-after: page;
  }
  .sheet:last-child {
    margin-bottom: 0;
    page-break-after: auto;
    break-after: auto;
  }

  /* Encabezado */
  .header-title-row { display: flex; align-items: center; gap: 4px; }
  .store-logo { height: 13px; width: auto; }
  .store-title {
    font-size: 12.5pt;
    font-weight: 600;
    letter-spacing: -0.3px;
    line-height: 1;
  }
  .receipt-subtitle {
    font-size: 10.5pt;
    font-weight: 600;
    letter-spacing: -0.2px;
    margin-top: 2px;
  }
  .do-not-pay { margin-top: 6px; margin-bottom: 0.2in; font-size: 8.5pt; }

  /* Grid de dos columnas */
  .grid-2col {
    display: grid;
    grid-template-columns: 58% 1fr;
    margin-bottom: 0.18in;
    gap: 10px;
  }
  .field-label { font-weight: 600; font-size: 8.5pt; }
  .field-value { margin-top: 1px; font-size: 8.5pt; }
  .pre { white-space: pre-line; }

  .customer-no { margin-top: 0.06in; margin-bottom: 0.2in; font-size: 8.5pt; }

  .section-heading {
    font-size: 10.5pt;
    font-weight: 600;
    letter-spacing: -0.2px;
    margin-bottom: 0.06in;
  }

  /* Tablas de Artículos */
  .items-table, .additional-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .items-table th, .additional-table th {
    text-align: left;
    font-weight: 600;
    font-size: 8.5pt;
    letter-spacing: -0.2px;
    padding: 0 0 2px 0;
    border-bottom: 1.5px solid #000;
    vertical-align: bottom;
    line-height: 1.1;
  }
  .items-table td, .additional-table td {
    padding: 2px 0 0 0;
    vertical-align: top;
    font-size: 8.5pt;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: clip;
  }
  .items-table td.col-name { text-transform: uppercase; }
  .items-table td.serial {
    padding: 1px 0 0 0.2in;
    white-space: normal;
  }

  .additional-table.continued { border-top: 1.5px solid #000; }
  .additional-table.continued td { padding-top: 4px; }

  .item-notice { margin-top: 0.15in; font-size: 8.5pt; }

  /* Formas de Pago */
  .border-section-title {
    font-size: 10.5pt;
    font-weight: 600;
    letter-spacing: -0.2px;
    border-bottom: 1.5px solid #000;
    padding-bottom: 2px;
    margin-top: 0.2in;
    margin-bottom: 0.06in;
  }
  .border-section-title.plain {
    border-bottom: none;
    padding-bottom: 0;
    margin-top: 0.16in;
    margin-bottom: 0.1in;
  }
  .payment-text { line-height: 1.35; font-size: 8.5pt; }

  /* Tabla de Totales */
  .totals-table {
    margin-top: 0.12in;
    margin-left: auto;
    width: 38%;
    border-collapse: collapse;
    font-weight: 600;
  }
  .totals-table td {
    font-size: 8.5pt;
    height: 14pt;
    line-height: 14pt;
    padding: 0;
  }
  .totals-table td:last-child {
    text-align: right;
  }

  .policies-link { margin-top: 0.2in; line-height: 1.35; font-size: 8.5pt; }
  .policies-link a { color: #0066cc; text-decoration: underline; }

  /* Pie de página oficial */
  .footer {
    position: absolute;
    left: 0.5in;
    right: 0.5in;
    bottom: 0.35in;
    font-size: 7pt;
    color: #6e6e6e;
    letter-spacing: 0.1px;
  }
  .footer-top { display: flex; justify-content: space-between; }
  .footer-bottom { text-align: right; margin-top: 1px; }

  @media print {
    body * {
      visibility: hidden;
    }
    .invoice-screen,
    .invoice-screen * {
      visibility: visible;
    }
    .invoice-screen {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      min-height: 0;
      padding: 0;
      background: #fff;
    }
    .sheet {
      margin: 0;
      box-shadow: none;
    }
    .no-print {
      display: none !important;
    }
  }
`;