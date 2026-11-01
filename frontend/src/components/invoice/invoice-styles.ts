// components/invoice/invoice-styles.ts
export const invoiceCss = `
  @page { size: letter; margin: 0; }
  *, *::before, *::after { box-sizing: border-box; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #000;
    font-size: 10.5pt;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }

  .toolbar {
    width: 8.5in;
    max-width: 100%;
    margin: 0 auto 16px;
    display: flex;
    justify-content: flex-end;
  }
  .toolbar button {
    background: #0066cc;
    color: #fff;
    border: 0;
    border-radius: 6px;
    padding: 8px 16px;
    font: inherit;
    font-size: 14px;
    cursor: pointer;
  }
  .invoice-screen {
    background: #d9d9d9;
    padding: 24px 0;
    min-height: 100vh;
  }

  /* Cada hoja Letter */
  .sheet {
    width: 8.5in;
    height: 11in;
    position: relative;
    overflow: hidden;
    margin: 0 auto 24px;
    padding: 1.2in 0.57in 0.9in 0.57in;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    page-break-after: always;
    break-after: page;
  }
  .sheet:last-child {
    margin-bottom: 0;
    page-break-after: auto;
    break-after: auto;
  }

  /* Encabezado */
  .header-title-row { display: flex; align-items: center; gap: 3px; }
  .store-logo { height: 17px; width: auto; }
  .store-title {
    font-size: 16pt;
    font-weight: 600;
    letter-spacing: -0.4px;
    line-height: 1;
  }
  .receipt-subtitle {
    font-size: 13pt;
    font-weight: 600;
    letter-spacing: -0.2px;
    margin-top: 4px;
  }
  .do-not-pay { margin-top: 14px; margin-bottom: 0.42in; }

  /* Dos columnas */
  .grid-2col {
    display: grid;
    grid-template-columns: 59.5% 1fr;
    margin-bottom: 0.4in;
  }
  .field-label { font-weight: 600; }
  .field-value { margin-top: 2px; }
  .pre { white-space: pre-line; }

  .customer-no { margin-top: 0.12in; margin-bottom: 0.4in; }

  .section-heading {
    font-size: 13pt;
    font-weight: 600;
    letter-spacing: -0.2px;
    margin-bottom: 0.14in;
  }

  /* Tablas */
  .items-table, .additional-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .items-table th, .additional-table th {
    text-align: left;
    font-weight: 600;
    font-size: 10.5pt;
    letter-spacing: -0.25px;
    padding: 0 0 2px 0;
    border-bottom: 2.5px solid #000;
    vertical-align: bottom;
    white-space: nowrap;
    overflow: hidden;
  }
  .items-table td, .additional-table td {
    padding: 4px 0 0 0;
    vertical-align: top;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: clip;
  }
  .items-table td.col-name { text-transform: uppercase; }
  .items-table td.serial {
    padding: 2px 0 0 0.35in;
    white-space: normal;
  }
  .additional-table.continued { border-top: 2.5px solid #000; }
  .additional-table.continued td { padding-top: 10px; }

  .item-notice { margin-top: 0.3in; }

  /* Etiquetas de totales */
  .totals {
    margin-top: 0.12in;
    margin-left: 79%;
    font-weight: 600;
  }
  .totals-row {
    font-size: 10.5pt;
    height: 19pt;
    line-height: 19pt;
  }

  /* Secciones con línea gruesa */
  .border-section-title {
    font-size: 13pt;
    font-weight: 600;
    letter-spacing: -0.2px;
    border-bottom: 2.5px solid #000;
    padding-bottom: 5px;
    margin-top: 0.45in;
    margin-bottom: 0.1in;
  }
  .border-section-title.plain {
    border-bottom: none;
    padding-bottom: 0;
    margin-top: 0.3in;
    margin-bottom: 0.3in;
  }
  .payment-text { line-height: 1.5; }

  .policies-link { margin-top: 0.45in; line-height: 1.5; }
  .policies-link a { color: #0066cc; text-decoration: underline; }

  /* Pie de impresión */
  .footer {
    position: absolute;
    left: 0.57in;
    right: 0.57in;
    bottom: 0.6in;
    font-size: 8pt;
    color: #6e6e6e;
    letter-spacing: 0.1px;
  }
  .footer-top { display: flex; justify-content: space-between; }
  .footer-bottom { text-align: right; margin-top: 1px; }

   @media print {
    /* Oculta todo el layout (navbar, footer, etc.) */
    body * {
      visibility: hidden;
    }
    /* Solo muestra la factura y sus hijos */
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