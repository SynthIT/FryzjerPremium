import { pdf } from 'tinypdf'
import { writeFileSync } from 'fs'

const doc = pdf()

doc.page(612, 792, (p) => {
  const margin = 40, pw = 532

  // Header
  p.rect(margin, 716, pw, 36, '#2563eb')
  p.text('INVOICE', 55, 726, 24, { color: '#fff' })
  p.text('#INV-2025-001', 472, 728, 12, { color: '#fff' })

  // Company & billing info
  p.text('Acme Corporation', margin, 670, 16)
  p.text('123 Business Street', margin, 652, 11, { color: '#666' })
  p.text('New York, NY 10001', margin, 638, 11, { color: '#666' })

  p.text('Bill To:', 340, 670, 12, { color: '#666' })
  p.text('John Smith', 340, 652, 14)
  p.text('456 Customer Ave', 340, 636, 11, { color: '#666' })
  p.text('Los Angeles, CA 90001', 340, 622, 11, { color: '#666' })

  // Table
  p.rect(margin, 560, pw, 25, '#f3f4f6')
  p.text('Description', 50, 568, 11)
  p.text('Qty', 310, 568, 11)
  p.text('Price', 380, 568, 11)
  p.text('Total', 480, 568, 11)

  const items = [
    ['Website Development', '1', '$5,000.00', '$5,000.00'],
    ['Hosting (Annual)', '1', '$200.00', '$200.00'],
    ['Maintenance Package', '12', '$150.00', '$1,800.00'],
  ]

  let y = 535
  for (const [desc, qty, price, total] of items) {
    p.text(desc, 50, y, 11)
    p.text(qty, 310, y, 11)
    p.text(price, 380, y, 11)
    p.text(total, 480, y, 11)
    p.line(margin, y - 15, margin + pw, y - 15, '#e5e7eb', 0.5)
    y -= 30
  }

  // Totals
  p.line(margin, y, margin + pw, y, '#000', 1)
  p.text('Subtotal:', 380, y - 25, 11)
  p.text('$7,000.00', 480, y - 25, 11)
  p.text('Tax (8%):', 380, y - 45, 11)
  p.text('$560.00', 480, y - 45, 11)
  p.rect(370, y - 75, 202, 25, '#2563eb')
  p.text('Total Due:', 380, y - 63, 12, { color: '#fff' })
  p.text('$7,560.00', 480, y - 63, 12, { color: '#fff' })

  // Footer
  p.text('Thank you for your business!', margin, 80, 12, { align: 'center', width: pw, color: '#666' })
  p.text('Payment due within 30 days', margin, 62, 10, { align: 'center', width: pw, color: '#999' })
})

writeFileSync('invoice.pdf', doc.build())