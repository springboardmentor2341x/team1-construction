import io
from datetime import datetime, timezone
from typing import Dict, Any, List

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Canvas computing dynamic total page count for 'Page X of Y' footer."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Subsequent pages header
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(36, 11 * inch - 36, 8.5 * inch - 36, 11 * inch - 36)
            self.drawString(36, 11 * inch - 30, "BuildTrack Construction Management System — Module 10 Official Report")

        # Footer divider line & page numbers
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(36, 45, 8.5 * inch - 36, 45)
        
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 36, 30, page_str)
        self.drawString(36, 30, f"Confidential & Proprietary — Generated on {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
        self.restoreState()


class ReportPDFGenerator:

    @staticmethod
    def generate_pdf(title: str, project_info: Dict[str, Any], summary_kpis: List[Dict[str, str]], table_headers: List[str], table_rows: List[List[str]], extra_notes: str = None) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=36,
            rightMargin=36,
            topMargin=45,
            bottomMargin=54
        )

        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=colors.HexColor("#0F172A")
        )
        
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#D97706")
        )
        
        meta_label = ParagraphStyle('MetaLabel', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, textColor=colors.HexColor("#475569"))
        meta_val = ParagraphStyle('MetaVal', parent=styles['Normal'], fontName='Helvetica', fontSize=8.5, textColor=colors.HexColor("#0F172A"))
        table_cell = ParagraphStyle('TableCell', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=10, textColor=colors.HexColor("#1E293B"))
        table_header_cell = ParagraphStyle('TableHeaderCell', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=colors.white)

        elements = []

        # 1. Header Banner
        banner_data = [
            [
                Paragraph("BUILDTRACK CONSTRUCTION MANAGEMENT SYSTEM", subtitle_style),
                Paragraph(f"Date: <b>{datetime.now(timezone.utc).strftime('%Y-%m-%d')}</b>", meta_val)
            ],
            [
                Paragraph(title, title_style),
                Paragraph("Official Report Export", meta_label)
            ]
        ]
        banner_table = Table(banner_data, colWidths=[380, 160])
        banner_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (1,0), (1,-1), 'RIGHT'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ]))
        elements.append(banner_table)
        elements.append(Spacer(1, 6))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#F59E0B"), spaceAfter=10))

        # 2. Project Metadata Block
        meta_table_data = [
            [
                Paragraph("Project Code:", meta_label), Paragraph(str(project_info.get("code", "N/A")), meta_val),
                Paragraph("Project Name:", meta_label), Paragraph(str(project_info.get("name", "N/A")), meta_val)
            ],
            [
                Paragraph("Category / Status:", meta_label), Paragraph(f"{project_info.get('category', 'General')} ({project_info.get('status', 'Active')})", meta_val),
                Paragraph("Project Manager:", meta_label), Paragraph(str(project_info.get("pm_name", "N/A")), meta_val)
            ]
        ]
        meta_table = Table(meta_table_data, colWidths=[90, 180, 90, 180])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('PADDING', (0,0), (-1,-1), 5),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 12))

        # 3. Summary KPI Grid
        if summary_kpis:
            kpi_cells = []
            for kpi in summary_kpis:
                card_text = f"<b>{kpi.get('label', '')}</b><br/><font size=11 color='#D97706'><b>{kpi.get('value', '')}</b></font>"
                kpi_cells.append(Paragraph(card_text, ParagraphStyle('KPICell', parent=styles['Normal'], fontName='Helvetica', fontSize=8, leading=11, alignment=1)))
            
            kpi_table_data = [kpi_cells]
            col_w = 540 / max(1, len(summary_kpis))
            kpi_table = Table(kpi_table_data, colWidths=[col_w] * len(summary_kpis))
            kpi_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FFFBE6")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#FCD34D")),
                ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#FEF3C7")),
                ('PADDING', (0,0), (-1,-1), 7),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            elements.append(kpi_table)
            elements.append(Spacer(1, 12))

        # 4. Extra Notes / Notice Section
        if extra_notes:
            note_p = Paragraph(f"<b>Notice:</b> {extra_notes}", ParagraphStyle('NoticeP', parent=styles['Normal'], fontName='Helvetica-Oblique', fontSize=8, textColor=colors.HexColor("#B45309")))
            note_table = Table([[note_p]], colWidths=[540])
            note_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FFF8F0")),
                ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#FDE68A")),
                ('PADDING', (0,0), (-1,-1), 5),
            ]))
            elements.append(note_table)
            elements.append(Spacer(1, 10))

        # 5. Formatted Data Table
        if table_headers and table_rows:
            elements.append(Paragraph("<b>Detailed Report Records</b>", ParagraphStyle('SubHead', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=10.5, textColor=colors.HexColor("#0F172A"))))
            elements.append(Spacer(1, 5))

            hdr_cells = [Paragraph(h, table_header_cell) for h in table_headers]
            formatted_table_data = [hdr_cells]

            for idx, row in enumerate(table_rows):
                r_cells = [Paragraph(str(cell), table_cell) for cell in row]
                formatted_table_data.append(r_cells)

            col_width = 540 / max(1, len(table_headers))
            data_table = Table(formatted_table_data, colWidths=[col_width] * len(table_headers), repeatRows=1)
            
            t_style = [
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
                ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ]
            for r_idx in range(1, len(formatted_table_data)):
                if r_idx % 2 == 0:
                    t_style.append(('BACKGROUND', (0, r_idx), (-1, r_idx), colors.HexColor("#F8FAFC")))
            
            data_table.setStyle(TableStyle(t_style))
            elements.append(data_table)

        doc.build(elements, canvasmaker=NumberedCanvas)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
