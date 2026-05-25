import jsPDF from "jspdf";
import type { TravelPlan } from "../models/TravelPlan";
import type { Destination } from "../models/Destination";
import type { Activity } from "../models/Activity";
import type { ChecklistItem } from "../models/ChecklistItem";
import type { Expense } from "../models/Expense";

type RGB = [number, number, number];

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("sr-RS");

const categoryLabels: Record<string, string> = {
  transport: "Prevoz",
  accommodation: "Smještaj",
  food: "Hrana",
  tickets: "Ulaznice",
  shopping: "Kupovina",
  other: "Ostalo",
};

const statusLabels: Record<string, string> = {
  planned: "Planirano",
  reserved: "Rezervisano",
  completed: "Završeno",
  cancelled: "Otkazano",
};

const statusColors: Record<string, RGB> = {
  planned: [79, 142, 247],
  reserved: [246, 173, 85],
  completed: [72, 187, 120],
  cancelled: [252, 129, 129],
};

const C = {
  primary:   [79, 142, 247] as RGB,
  secondary: [56, 178, 172] as RGB,
  dark:      [45, 55, 72]   as RGB,
  gray:      [113, 128, 150] as RGB,
  lightGray: [237, 242, 247] as RGB,
  white:     [255, 255, 255] as RGB,
  green:     [39, 103, 73]  as RGB,
  red:       [197, 48, 48]  as RGB,
};

export const generateTravelPlanPdf = (
  plan: TravelPlan,
  destinations: Destination[],
  activities: Activity[],
  checklistItems: ChecklistItem[],
  expenses: Expense[]
) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = 210;
  const margin = 16;
  const contentW = pageW - margin * 2;
  let y = 0;

  const rgb = (c: RGB) => { doc.setFillColor(c[0], c[1], c[2]); };
  const textRgb = (c: RGB) => { doc.setTextColor(c[0], c[1], c[2]); };
  const drawRgb = (c: RGB) => { doc.setDrawColor(c[0], c[1], c[2]); };

  const checkPageBreak = (needed: number) => {
    if (y + needed > 280) { doc.addPage(); y = 16; }
  };

  const drawSectionHeader = (title: string) => {
    checkPageBreak(14);
    rgb(C.primary);
    doc.roundedRect(margin, y, contentW, 10, 2, 2, "F");
    textRgb(C.white);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin + 4, y + 7);
    y += 14;
    textRgb(C.dark);
  };

  const drawDivider = () => {
    drawRgb(C.lightGray);
    doc.line(margin, y, margin + contentW, y);
    y += 4;
  };

 //header
  rgb(C.primary);
  doc.rect(0, 0, pageW, 40, "F");
  rgb(C.secondary);
  doc.rect(pageW / 2, 0, pageW / 2, 40, "F");

  textRgb(C.white);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(plan.title, margin, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(plan.description || "Bez opisa", margin, 26);

  doc.setFontSize(9);
  doc.text(`${formatDate(plan.startDate)}  ->  ${formatDate(plan.endDate)}`, margin, 33);

  doc.setFontSize(8);
  doc.setTextColor(220, 240, 255);
  const genText = `Generisano: ${new Date().toLocaleDateString("sr-RS")}`;
  doc.text(genText, pageW - margin - doc.getTextWidth(genText), 33);

  y = 48;

  //budget summary
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = plan.budget - totalExpenses;
  const pct = Math.min((totalExpenses / plan.budget) * 100, 100);

  checkPageBreak(38);
  rgb(C.lightGray);
  doc.roundedRect(margin, y, contentW, 34, 3, 3, "F");

  textRgb(C.dark);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Pregled budzeta", margin + 4, y + 7);

  const boxW = (contentW - 8) / 3;
  const bY = y + 12;
  const boxes: { label: string; value: string; color: RGB }[] = [
    { label: "Ukupni budzet", value: `${plan.budget} EUR`, color: C.primary },
    { label: "Potroseno",     value: `${totalExpenses} EUR`, color: pct > 90 ? C.red : C.secondary },
    { label: "Preostalo",     value: `${remaining} EUR`, color: remaining >= 0 ? C.green : C.red },
  ];

  boxes.forEach((box, i) => {
    const bX = margin + 4 + i * (boxW + 4);
    rgb(C.white);
    doc.roundedRect(bX, bY, boxW - 4, 14, 2, 2, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    textRgb(C.gray);
    doc.text(box.label, bX + 3, bY + 5);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    textRgb(box.color);
    doc.text(box.value, bX + 3, bY + 11);
  });

  //progress bar
  const barY = y + 30;
  doc.setFillColor(200, 215, 230);
  doc.roundedRect(margin + 4, barY, contentW - 8, 3, 1, 1, "F");
  if (pct > 90) { rgb(C.red); } else { rgb(C.primary); }
  doc.roundedRect(margin + 4, barY, ((contentW - 8) * pct) / 100, 3, 1, 1, "F");

  y += 40;

  //destinacije
  if (destinations.length > 0) {
    drawSectionHeader("Destinacije");
    destinations.forEach((d, i) => {
      checkPageBreak(24);
      doc.setFillColor(245, 248, 255);
      doc.roundedRect(margin, y, contentW, 20, 2, 2, "F");
      doc.setFillColor(102, 126, 234);
      doc.roundedRect(margin, y, 3, 20, 1, 1, "F");

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      textRgb(C.dark);
      doc.text(`${i + 1}. ${d.name}`, margin + 7, y + 7);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      textRgb(C.gray);
      const locStr = d.location ? `${d.location}   ` : "";
      const dateStr = `${formatDate(d.arrivalDate)} -> ${formatDate(d.departureDate)}`;
      doc.text(locStr + dateStr, margin + 7, y + 13);

      if (d.description) {
        textRgb(C.dark);
        doc.setFontSize(8);
        const lines = doc.splitTextToSize(d.description, contentW - 14);
        doc.text(lines[0], margin + 7, y + 18);
      }

      y += 24;
    });
    y += 2;
  }

  //aktivnosti
  if (activities.length > 0) {
    drawSectionHeader("Aktivnosti");
    activities.forEach((a) => {
      checkPageBreak(22);
      doc.setFillColor(245, 248, 255);
      doc.roundedRect(margin, y, contentW, 18, 2, 2, "F");

      const sc = statusColors[a.status] ?? C.primary;
      doc.setFillColor(sc[0], sc[1], sc[2]);
      doc.roundedRect(margin, y, 3, 18, 1, 1, "F");

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      textRgb(C.dark);
      doc.text(a.name, margin + 7, y + 7);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      textRgb(C.gray);
      const metaParts = [
        `${formatDate(a.activityDate)}`,
        a.activityTime ?? null,
        a.location ?? null,
      ].filter(Boolean) as string[];
      doc.text(metaParts.join("  |  "), margin + 7, y + 13);

      const badge = statusLabels[a.status] ?? a.status;
      const badgeW = doc.getTextWidth(badge) + 6;
      doc.setFillColor(sc[0], sc[1], sc[2]);
      doc.roundedRect(margin + contentW - badgeW - 2, y + 3, badgeW, 6, 1, 1, "F");
      textRgb(C.white);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.text(badge, margin + contentW - badgeW + 1, y + 7.5);

      doc.setFontSize(9);
      textRgb(C.green);
      const costStr = `${a.estimatedCost} EUR`;
      doc.text(costStr, margin + contentW - badgeW - doc.getTextWidth(costStr) - 6, y + 7.5);

      y += 22;
    });
    y += 2;
  }

  //checklist
  if (checklistItems.length > 0) {
    drawSectionHeader("Checklist");
    const completed = checklistItems.filter((i) => i.isCompleted).length;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    textRgb(C.gray);
    doc.text(`Zavrseno: ${completed} / ${checklistItems.length}`, margin, y);
    y += 7;

    const colW = (contentW - 4) / 2;
    const rowsNeeded = Math.ceil(checklistItems.length / 2);
    checkPageBreak(rowsNeeded * 8 + 4);

    checklistItems.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const xBase = margin + col * (colW + 4);
      const yRow = y + row * 8;

      drawRgb(C.gray);
      if (item.isCompleted) {
        rgb(C.secondary);
        doc.roundedRect(xBase, yRow, 5, 5, 1, 1, "FD");
        textRgb(C.white);
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("v", xBase + 1, yRow + 4);
      } else {
        rgb(C.white);
        doc.roundedRect(xBase, yRow, 5, 5, 1, 1, "FD");
      }

      doc.setFontSize(9);
      doc.setFont("helvetica", item.isCompleted ? "italic" : "normal");
      textRgb(item.isCompleted ? C.gray : C.dark);
      const label = doc.splitTextToSize(item.name, colW - 8)[0];
      doc.text(label, xBase + 7, yRow + 4.5);
    });

    y += rowsNeeded * 8 + 8;
  }

  //expenses
  if (expenses.length > 0) {
    drawSectionHeader("Troskovi");

    checkPageBreak(10);
    rgb(C.dark);
    doc.rect(margin, y, contentW, 7, "F");
    textRgb(C.white);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Naziv",      margin + 2,           y + 5);
    doc.text("Kategorija", margin + 65,           y + 5);
    doc.text("Datum",      margin + 108,          y + 5);
    doc.text("Iznos",      margin + contentW - 18, y + 5);
    y += 9;

    expenses.forEach((exp, i) => {
      checkPageBreak(9);
      if (i % 2 === 0) {
        doc.setFillColor(245, 248, 255);
        doc.rect(margin, y - 1, contentW, 9, "F");
      }
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      textRgb(C.dark);
      doc.text(doc.splitTextToSize(exp.name, 60)[0], margin + 2, y + 5);
      textRgb(C.gray);
      doc.text(categoryLabels[exp.category] ?? exp.category, margin + 65, y + 5);
      doc.text(formatDate(exp.expenseDate),              margin + 108, y + 5);
      doc.setFont("helvetica", "bold");
      textRgb(C.green);
      const amtStr = `${exp.amount} EUR`;
      doc.text(amtStr, margin + contentW - doc.getTextWidth(amtStr) - 2, y + 5);

      if (exp.description) {
        y += 6;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        textRgb(C.gray);
        doc.text(`   ${doc.splitTextToSize(exp.description, contentW - 4)[0]}`, margin + 2, y + 2);
      }

      y += 9;
    });

    checkPageBreak(12);
    drawDivider();
    rgb(C.lightGray);
    doc.rect(margin, y - 1, contentW, 9, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    textRgb(C.dark);
    doc.text("UKUPNO", margin + 2, y + 5);
    textRgb(C.green);
    const totalStr = `${totalExpenses} EUR`;
    doc.text(totalStr, margin + contentW - doc.getTextWidth(totalStr) - 2, y + 5);
    y += 12;
  }

  //footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    rgb(C.lightGray);
    doc.rect(0, 288, pageW, 9, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    textRgb(C.gray);
    doc.text("Travel Planner — Izvjestaj o putovanju", margin, 294);
    const pageStr = `Stranica ${p} / ${totalPages}`;
    doc.text(pageStr, pageW - margin - doc.getTextWidth(pageStr), 294);
  }

  const safeTitle = plan.title.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`izvjestaj_${safeTitle}.pdf`);
};