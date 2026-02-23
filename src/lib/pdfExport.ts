import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Brand colours (dark theme → white print friendly) ────────────────────
const PRIMARY = [99, 102, 241] as [number, number, number];   // indigo
const ACCENT = [16, 185, 129] as [number, number, number];   // emerald
const DARK = [15, 23, 42] as [number, number, number];   // slate-900
const LIGHT = [248, 250, 252] as [number, number, number];  // slate-50
const BORDER = [226, 232, 240] as [number, number, number];  // slate-200
const MUTED = [100, 116, 139] as [number, number, number];  // slate-500

// ─── Helpers ──────────────────────────────────────────────────────────────
function addHeader(doc: jsPDF, title: string, subtitle: string) {
    const W = doc.internal.pageSize.getWidth();

    // Dark banner
    doc.setFillColor(...DARK);
    doc.rect(0, 0, W, 36, 'F');

    // GymPro logo text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('GymPro', 14, 16);

    // Gradient accent dot
    doc.setFillColor(...PRIMARY);
    doc.circle(14 + doc.getTextWidth('GymPro') + 3, 12, 1.5, 'F');

    // Report title
    doc.setFontSize(11);
    doc.setTextColor(...ACCENT as [number, number, number]);
    doc.text(title.toUpperCase(), 14, 26);

    // Subtitle / date
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.text(subtitle, 14, 32);

    // Right-side meta
    const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    doc.text(`Generated: ${now}`, W - 14, 32, { align: 'right' });
}

function addFooter(doc: jsPDF) {
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const pages = (doc as any).internal.getNumberOfPages();

    for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFillColor(...BORDER);
        doc.rect(0, H - 10, W, 10, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...MUTED as [number, number, number]);
        doc.text('GymPro — Confidential Report', 14, H - 3.5);
        doc.text(`Page ${i} of ${pages}`, W - 14, H - 3.5, { align: 'right' });
    }
}

function sectionTitle(doc: jsPDF, text: string, y: number): number {
    doc.setFillColor(...PRIMARY);
    doc.rect(14, y, 3, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...DARK as [number, number, number]);
    doc.text(text, 20, y + 5.5);
    return y + 14;
}

function statBox(doc: jsPDF, label: string, value: string, x: number, y: number, w: number) {
    doc.setFillColor(...LIGHT);
    doc.roundedRect(x, y, w, 18, 2, 2, 'F');
    doc.setDrawColor(...BORDER);
    doc.roundedRect(x, y, w, 18, 2, 2, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...MUTED as [number, number, number]);
    doc.text(label.toUpperCase(), x + 4, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...DARK as [number, number, number]);
    doc.text(value, x + 4, y + 14);
}

// ─── Inline bar (for tables) ──────────────────────────────────────────────
function barCell(doc: jsPDF, value: number, max: number, x: number, y: number, w: number) {
    const bw = max > 0 ? (value / max) * (w - 4) : 0;
    doc.setFillColor(...BORDER);
    doc.roundedRect(x + 2, y + 2.5, w - 4, 5, 1, 1, 'F');
    doc.setFillColor(...PRIMARY);
    if (bw > 0) doc.roundedRect(x + 2, y + 2.5, bw, 5, 1, 1, 'F');
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT: Complete Report
// ═══════════════════════════════════════════════════════════════════════════
export function exportCompletePDF(data: {
    stats: any;
    revenueData: any[];
    membershipData: any[];
    attendanceData: any[];
    productSalesData: any[];
}) {
    const { stats, revenueData, membershipData, attendanceData, productSalesData } = data;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    addHeader(doc, 'Complete Analytics Report', `${month} | GymPro Business Analytics`);

    // ── Summary stat boxes ──────────────────────────────────────────────────
    let y = 46;
    const boxW = (W - 28 - 9) / 4;
    statBox(doc, 'Total Members', String(stats?.totalMembers ?? 0), 14, y, boxW);
    statBox(doc, 'Active Members', String(stats?.activeMembers ?? 0), 14 + boxW + 3, y, boxW);
    statBox(doc, 'Monthly Revenue', `₹${(stats?.monthlyRevenue ?? 0).toLocaleString('en-IN')}`, 14 + 2 * (boxW + 3), y, boxW);
    statBox(doc, 'Pending Dues', `₹${(stats?.pendingDues ?? 0).toLocaleString('en-IN')}`, 14 + 3 * (boxW + 3), y, boxW);
    y += 26;

    // ── Revenue Table ────────────────────────────────────────────────────────
    y = sectionTitle(doc, 'Monthly Revenue (Last 6 Months)', y);
    const maxRevenue = Math.max(...revenueData.map(r => r.revenue), 1);
    autoTable(doc, {
        startY: y,
        head: [['Month', 'Revenue (₹)', 'Trend']],
        body: revenueData.map(r => [r.month, `₹${r.revenue.toLocaleString('en-IN')}`, '']),
        theme: 'plain',
        headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
        bodyStyles: { fontSize: 9, cellPadding: 4, textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 45 }, 2: { cellWidth: W - 14 - 14 - 30 - 45 } },
        margin: { left: 14, right: 14 },
        didDrawCell: (hookData) => {
            if (hookData.section === 'body' && hookData.column.index === 2) {
                const rowIdx = hookData.row.index;
                barCell(doc, revenueData[rowIdx]?.revenue ?? 0, maxRevenue, hookData.cell.x, hookData.cell.y, hookData.cell.width);
            }
        },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // ── Membership Distribution ──────────────────────────────────────────────
    y = sectionTitle(doc, 'Membership Distribution', y);
    const totalMembers = membershipData.reduce((s: number, m: any) => s + m.value, 0) || 1;
    autoTable(doc, {
        startY: y,
        head: [['Plan', 'Members', '% Share', 'Proportion']],
        body: membershipData.map((m: any) => [
            m.name,
            m.value,
            `${((m.value / totalMembers) * 100).toFixed(1)}%`,
            ''
        ]),
        theme: 'plain',
        headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
        bodyStyles: { fontSize: 9, cellPadding: 4, textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 30 }, 2: { cellWidth: 25 }, 3: { cellWidth: W - 14 - 14 - 115 } },
        margin: { left: 14, right: 14 },
        didDrawCell: (hookData) => {
            if (hookData.section === 'body' && hookData.column.index === 3) {
                const rowIdx = hookData.row.index;
                barCell(doc, membershipData[rowIdx]?.value ?? 0, totalMembers, hookData.cell.x, hookData.cell.y, hookData.cell.width);
            }
        },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // ── Attendance ────────────────────────────────────────────────────────────
    if (y > 210) { doc.addPage(); y = 20; }
    y = sectionTitle(doc, 'Weekly Attendance', y);
    const maxAtt = Math.max(...attendanceData.map((a: any) => a.attendance), 1);
    autoTable(doc, {
        startY: y,
        head: [['Day', 'Check-Ins', 'Trend']],
        body: attendanceData.map((a: any) => [a.day, a.attendance, '']),
        theme: 'plain',
        headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
        bodyStyles: { fontSize: 9, cellPadding: 4, textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 35 }, 2: { cellWidth: W - 14 - 14 - 65 } },
        margin: { left: 14, right: 14 },
        didDrawCell: (hookData) => {
            if (hookData.section === 'body' && hookData.column.index === 2) {
                const rowIdx = hookData.row.index;
                barCell(doc, attendanceData[rowIdx]?.attendance ?? 0, maxAtt, hookData.cell.x, hookData.cell.y, hookData.cell.width);
            }
        },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // ── Top Products ─────────────────────────────────────────────────────────
    if (y > 210) { doc.addPage(); y = 20; }
    y = sectionTitle(doc, 'Top Products by Sales', y);
    const maxSales = Math.max(...productSalesData.map((p: any) => p.sales), 1);
    autoTable(doc, {
        startY: y,
        head: [['Rank', 'Product', 'Units Sold', 'Trend']],
        body: productSalesData.map((p: any, i: number) => [`#${i + 1}`, p.name, p.sales, '']),
        theme: 'plain',
        headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
        bodyStyles: { fontSize: 9, cellPadding: 4, textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 55 }, 2: { cellWidth: 30 }, 3: { cellWidth: W - 14 - 14 - 100 } },
        margin: { left: 14, right: 14 },
        didDrawCell: (hookData) => {
            if (hookData.section === 'body' && hookData.column.index === 3) {
                const rowIdx = hookData.row.index;
                barCell(doc, productSalesData[rowIdx]?.sales ?? 0, maxSales, hookData.cell.x, hookData.cell.y, hookData.cell.width);
            }
        },
    });

    addFooter(doc);
    doc.save(`GymPro_Complete_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT: Revenue Report
// ═══════════════════════════════════════════════════════════════════════════
export function exportRevenuePDF(revenueData: any[], stats: any) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();

    addHeader(doc, 'Revenue Report', 'Last 6 months of income analytics');

    let y = 46;
    const boxW = (W - 28 - 6) / 3;
    statBox(doc, 'Total Revenue', `₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`, 14, y, boxW);
    statBox(doc, 'This Month', `₹${(stats?.monthlyRevenue ?? 0).toLocaleString('en-IN')}`, 14 + boxW + 3, y, boxW);
    statBox(doc, 'Pending Dues', `₹${(stats?.pendingDues ?? 0).toLocaleString('en-IN')}`, 14 + 2 * (boxW + 3), y, boxW);
    y += 26;

    y = sectionTitle(doc, 'Monthly Revenue Breakdown', y);
    const maxR = Math.max(...revenueData.map(r => r.revenue), 1);
    autoTable(doc, {
        startY: y,
        head: [['Month', 'Revenue (₹)', 'vs Max', 'Trend']],
        body: revenueData.map(r => [
            r.month,
            `₹${r.revenue.toLocaleString('en-IN')}`,
            `${((r.revenue / maxR) * 100).toFixed(0)}%`,
            ''
        ]),
        theme: 'plain',
        headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
        bodyStyles: { fontSize: 9, cellPadding: 4, textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 50 }, 2: { cellWidth: 25 }, 3: { cellWidth: W - 14 - 14 - 105 } },
        margin: { left: 14, right: 14 },
        didDrawCell: (hookData) => {
            if (hookData.section === 'body' && hookData.column.index === 3) {
                barCell(doc, revenueData[hookData.row.index]?.revenue ?? 0, maxR, hookData.cell.x, hookData.cell.y, hookData.cell.width);
            }
        },
    });

    addFooter(doc);
    doc.save(`GymPro_Revenue_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT: Membership Report
// ═══════════════════════════════════════════════════════════════════════════
export function exportMembershipPDF(membershipData: any[], stats: any) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();

    addHeader(doc, 'Membership Report', 'Distribution of members by plan');

    let y = 46;
    const boxW = (W - 28 - 6) / 3;
    statBox(doc, 'Total Members', String(stats?.totalMembers ?? 0), 14, y, boxW);
    statBox(doc, 'Active Members', String(stats?.activeMembers ?? 0), 14 + boxW + 3, y, boxW);
    statBox(doc, 'Expired Members', String(stats?.expiredMembers ?? 0), 14 + 2 * (boxW + 3), y, boxW);
    y += 26;

    y = sectionTitle(doc, 'Members by Plan', y);
    const total = membershipData.reduce((s: number, m: any) => s + m.value, 0) || 1;
    autoTable(doc, {
        startY: y,
        head: [['Plan Name', 'Members', '% of Total', 'Distribution']],
        body: membershipData.map((m: any) => [
            m.name, m.value, `${((m.value / total) * 100).toFixed(1)}%`, ''
        ]),
        theme: 'plain',
        headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
        bodyStyles: { fontSize: 9, cellPadding: 4, textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 25 }, 2: { cellWidth: 30 }, 3: { cellWidth: W - 14 - 14 - 115 } },
        margin: { left: 14, right: 14 },
        didDrawCell: (hookData) => {
            if (hookData.section === 'body' && hookData.column.index === 3) {
                barCell(doc, membershipData[hookData.row.index]?.value ?? 0, total, hookData.cell.x, hookData.cell.y, hookData.cell.width);
            }
        },
    });

    addFooter(doc);
    doc.save(`GymPro_Membership_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT: Attendance Report
// ═══════════════════════════════════════════════════════════════════════════
export function exportAttendancePDF(attendanceData: any[]) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();

    addHeader(doc, 'Attendance Report', 'Weekly check-in trend');

    const totalCheckins = attendanceData.reduce((s: number, a: any) => s + a.attendance, 0);
    const maxDay = attendanceData.reduce((best: any, a: any) => (!best || a.attendance > best.attendance ? a : best), null);

    let y = 46;
    const boxW = (W - 28 - 6) / 3;
    statBox(doc, 'Week Total', String(totalCheckins), 14, y, boxW);
    statBox(doc, 'Busiest Day', maxDay?.day ?? '-', 14 + boxW + 3, y, boxW);
    statBox(doc, 'Peak Check-Ins', String(maxDay?.attendance ?? 0), 14 + 2 * (boxW + 3), y, boxW);
    y += 26;

    y = sectionTitle(doc, 'Daily Attendance Breakdown', y);
    const maxA = Math.max(...attendanceData.map((a: any) => a.attendance), 1);
    autoTable(doc, {
        startY: y,
        head: [['Day', 'Check-Ins', 'Trend']],
        body: attendanceData.map((a: any) => [a.day, a.attendance, '']),
        theme: 'plain',
        headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
        bodyStyles: { fontSize: 9, cellPadding: 4, textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 35 }, 2: { cellWidth: W - 14 - 14 - 70 } },
        margin: { left: 14, right: 14 },
        didDrawCell: (hookData) => {
            if (hookData.section === 'body' && hookData.column.index === 2) {
                barCell(doc, attendanceData[hookData.row.index]?.attendance ?? 0, maxA, hookData.cell.x, hookData.cell.y, hookData.cell.width);
            }
        },
    });

    addFooter(doc);
    doc.save(`GymPro_Attendance_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT: Products Report
// ═══════════════════════════════════════════════════════════════════════════
export function exportProductsPDF(productSalesData: any[]) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();

    addHeader(doc, 'Product Sales Report', 'Top selling supplements this month');

    let y = 46;
    const totalSold = productSalesData.reduce((s: number, p: any) => s + p.sales, 0);
    const topProduct = productSalesData[0];
    const boxW = (W - 28 - 6) / 3;
    statBox(doc, 'Total Units Sold', String(totalSold), 14, y, boxW);
    statBox(doc, 'Top Product', topProduct?.name ?? '-', 14 + boxW + 3, y, boxW);
    statBox(doc, 'Top Units', String(topProduct?.sales ?? 0), 14 + 2 * (boxW + 3), y, boxW);
    y += 26;

    y = sectionTitle(doc, 'Product Ranking by Units Sold', y);
    const maxS = Math.max(...productSalesData.map((p: any) => p.sales), 1);
    autoTable(doc, {
        startY: y,
        head: [['Rank', 'Product', 'Units Sold', '% Share', 'Trend']],
        body: productSalesData.map((p: any, i: number) => [
            `#${i + 1}`, p.name, p.sales, `${((p.sales / (totalSold || 1)) * 100).toFixed(1)}%`, ''
        ]),
        theme: 'plain',
        headStyles: { fillColor: DARK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
        bodyStyles: { fontSize: 9, cellPadding: 4, textColor: DARK },
        alternateRowStyles: { fillColor: LIGHT },
        columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 55 }, 2: { cellWidth: 25 }, 3: { cellWidth: 25 }, 4: { cellWidth: W - 14 - 14 - 120 } },
        margin: { left: 14, right: 14 },
        didDrawCell: (hookData) => {
            if (hookData.section === 'body' && hookData.column.index === 4) {
                barCell(doc, productSalesData[hookData.row.index]?.sales ?? 0, maxS, hookData.cell.x, hookData.cell.y, hookData.cell.width);
            }
        },
    });

    addFooter(doc);
    doc.save(`GymPro_Products_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
