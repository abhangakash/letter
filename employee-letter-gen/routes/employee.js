const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Employee = require('../models/Employee');

// Search employee by emp_id
router.get('/search', async (req, res) => {
  const { emp_id } = req.query;
  if (!emp_id) return res.status(400).json({ error: 'emp_id is required' });

  try {
    const emp = await Employee.findOne({ emp_id: emp_id.toUpperCase() });
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate and download PDF letter
router.get('/letter/:emp_id', async (req, res) => {
  try {
    const emp = await Employee.findOne({ emp_id: req.params.emp_id.toUpperCase() });
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const doc = new PDFDocument({ margin: 60, size: 'A4' });
    const filename = `Increment_Letter_${emp.emp_id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    const formatCurrency = (n) => `INR ${Number(n).toLocaleString('en-IN')} per annum`;

    // ── Header ──────────────────────────────────────────
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#1a1a2e')
       .text('TechCorp India Pvt. Ltd.', { align: 'center' });
    doc.fontSize(9).font('Helvetica').fillColor('#555')
       .text('123, Business Park, Baner Road, Pune - 411045 | hr@techcorp.in | +91-20-12345678', { align: 'center' });

    doc.moveDown(0.5);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor('#1a1a2e').lineWidth(2).stroke();
    doc.moveDown(1);

    // ── Date & Reference ────────────────────────────────
    doc.fontSize(10).font('Helvetica').fillColor('#333');
    doc.text(`Date: ${formatDate(new Date())}`, { align: 'right' });
    doc.text(`Ref No: HR/INC/${emp.emp_id}/${new Date().getFullYear()}`, { align: 'right' });
    doc.moveDown(1);

    // ── Subject ─────────────────────────────────────────
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#1a1a2e')
       .text('SALARY INCREMENT LETTER', { align: 'center', underline: true });
    doc.moveDown(1.2);

    // ── Addressee ───────────────────────────────────────
    doc.fontSize(10).font('Helvetica').fillColor('#333');
    doc.text(`To,`);
    doc.font('Helvetica-Bold').text(emp.name);
    doc.font('Helvetica').text(`Employee ID: ${emp.emp_id}`);
    doc.text(`${emp.job_role} — ${emp.department}`);
    doc.text(emp.location);
    doc.moveDown(1);

    // ── Salutation ──────────────────────────────────────
    doc.text(`Dear ${emp.name.split(' ')[0]},`);
    doc.moveDown(0.8);

    // ── Body Paragraph ──────────────────────────────────
    doc.font('Helvetica').fontSize(10).fillColor('#333');
    doc.text(
      `We are pleased to inform you that, upon review of your performance and contribution to the organization, ` +
      `the management has decided to revise your compensation package effective from ${formatDate(emp.effective_date)}.`,
      { align: 'justify', lineGap: 4 }
    );
    doc.moveDown(0.8);
    doc.text(
      `This decision reflects our appreciation for your dedication, consistent performance, and the value you bring ` +
      `to your team and the organization as a whole. We look forward to your continued growth with us.`,
      { align: 'justify', lineGap: 4 }
    );
    doc.moveDown(1.2);

    // ── Details Table ────────────────────────────────────
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1a1a2e').text('Employee & Compensation Details');
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const col1 = 60, col2 = 260;
    const rowH = 24;

    const rows = [
      ['Full Name', emp.name],
      ['Employee ID', emp.emp_id],
      ['Job Role', emp.job_role],
      ['Department', emp.department],
      ['Employee Type', emp.employee_type],
      ['Date of Joining', formatDate(emp.date_of_joining)],
      ['Reporting Manager', emp.manager_name],
      ['Work Location', emp.location],
      ['Current CTC', formatCurrency(emp.current_salary)],
      ['Increment %', `${emp.increment_percentage}%`],
      ['Revised CTC', formatCurrency(emp.new_salary)],
      ['Effective From', formatDate(emp.effective_date)],
    ];

    rows.forEach((row, i) => {
      const y = tableTop + i * rowH;
      const bg = i % 2 === 0 ? '#f0f4ff' : '#ffffff';

      doc.rect(col1, y, 475, rowH).fillColor(bg).fill();
      doc.rect(col1, y, 475, rowH).strokeColor('#c0c8e0').lineWidth(0.5).stroke();

      doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#1a1a2e')
         .text(row[0], col1 + 8, y + 7, { width: 185 });
      doc.font('Helvetica').fillColor('#333')
         .text(row[1], col2 + 8, y + 7, { width: 265 });
    });

    doc.y = tableTop + rows.length * rowH + 20;
    doc.moveDown(1);

    // ── Closing ──────────────────────────────────────────
    doc.fontSize(10).font('Helvetica').fillColor('#333');
    doc.text('We trust that you will continue to contribute positively to our organization\'s success.', { align: 'justify' });
    doc.moveDown(0.5);
    doc.text('Please sign and return a copy of this letter as acknowledgment of receipt.', { align: 'justify' });
    doc.moveDown(1.5);

    doc.text('Warm Regards,');
    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').text('Neha Joshi');
    doc.font('Helvetica').text('Head of Human Resources');
    doc.text('TechCorp India Pvt. Ltd.');
    doc.moveDown(2);

    // ── Footer ───────────────────────────────────────────
    doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor('#c0c8e0').lineWidth(1).stroke();
    doc.moveDown(0.4);
    doc.fontSize(8).fillColor('#888')
       .text('This is a system-generated letter. For queries, contact hr@techcorp.in', { align: 'center' });

    doc.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

module.exports = router;