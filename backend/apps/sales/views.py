from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils import timezone
from io import BytesIO

from .models import Quote, QuoteNote
from .serializers import (
    QuoteSerializer, QuoteCreateSerializer, 
    QuoteListSerializer, QuoteNoteSerializer
)


class QuoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing quotes.
    Users can view their own quotes, create new quotes, and download PDFs.
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return QuoteCreateSerializer
        if self.action == 'list':
            return QuoteListSerializer
        return QuoteSerializer
    
    def get_queryset(self):
        """Filter quotes to only show user's own quotes"""
        user = self.request.user
        queryset = Quote.objects.filter(user=user)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.select_related('vehicle')
    
    def perform_create(self, serializer):
        serializer.save()
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate and return PDF for a quote"""
        quote = self.get_object()
        
        # Mark as viewed
        if quote.status == 'pending':
            quote.status = 'viewed'
            quote.viewed_at = timezone.now()
            quote.save()
        
        # Generate PDF
        pdf_content = generate_quote_pdf(quote)
        
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="quote_{quote.reference_number}.pdf"'
        return response
    
    @action(detail=True, methods=['post'])
    def mark_contacted(self, request, pk=None):
        """Mark quote as contacted"""
        quote = self.get_object()
        quote.status = 'contacted'
        quote.save()
        return Response({'status': 'contacted'})


def generate_quote_pdf(quote):
    """
    Generate PDF from quote data.
    Uses reportlab for PDF generation.
    """
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    except ImportError:
        # Fallback to simple text if reportlab not installed
        return generate_simple_pdf(quote)
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a1a1a'),
        spaceAfter=20,
    )
    story.append(Paragraph("Vehicle Quote", title_style))
    story.append(Paragraph(f"Reference: {quote.reference_number}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Vehicle Info
    story.append(Paragraph("Vehicle Details", styles['Heading2']))
    vehicle_data = [
        ['Vehicle', quote.vehicle_title],
        ['Year', str(quote.vehicle_year)],
        ['Make', quote.vehicle_make],
        ['Model', quote.vehicle_model],
        ['VIN', quote.vehicle_vin or 'N/A'],
        ['Mileage', f"{quote.vehicle_mileage:,} miles" if quote.vehicle_mileage else 'N/A'],
    ]
    vehicle_table = Table(vehicle_data, colWidths=[2*inch, 4*inch])
    vehicle_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(vehicle_table)
    story.append(Spacer(1, 20))
    
    # Pricing
    story.append(Paragraph("Price Breakdown", styles['Heading2']))
    
    def fmt_price(amount):
        return f"${float(amount):,.2f}"
    
    pricing_data = [
        ['Base Price', fmt_price(quote.base_price)],
        ['Documentation Fee', fmt_price(quote.documentation_fee)],
        ['Registration Fee', fmt_price(quote.registration_fee)],
        ['Delivery Fee', fmt_price(quote.delivery_fee)],
        ['Taxes', fmt_price(quote.tax_amount)],
    ]
    if quote.discount_amount > 0:
        pricing_data.append(['Discount', f"-{fmt_price(quote.discount_amount)}"])
    pricing_data.append(['Total Drive-Away Price', fmt_price(quote.total_price)])
    
    pricing_table = Table(pricing_data, colWidths=[4*inch, 2*inch])
    pricing_table.setStyle(TableStyle([
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#f59e0b')),
        ('TEXTCOLOR', (0, -1), (-1, -1), colors.black),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(pricing_table)
    story.append(Spacer(1, 20))
    
    # Financing (if applicable)
    if quote.financing_term and quote.financing_monthly:
        story.append(Paragraph("Financing Options", styles['Heading2']))
        financing_data = [
            ['Term', f"{quote.financing_term} months"],
            ['APR', f"{quote.financing_rate}%"],
            ['Down Payment', fmt_price(quote.financing_down_payment or 0)],
            ['Monthly Payment', fmt_price(quote.financing_monthly)],
        ]
        financing_table = Table(financing_data, colWidths=[2*inch, 4*inch])
        financing_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f5f5f5')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        story.append(financing_table)
        story.append(Spacer(1, 20))
    
    # Buyer Info
    story.append(Paragraph("Delivery To", styles['Heading2']))
    story.append(Paragraph(f"{quote.buyer_name}", styles['Normal']))
    story.append(Paragraph(f"{quote.buyer_email}", styles['Normal']))
    if quote.buyer_phone:
        story.append(Paragraph(f"{quote.buyer_phone}", styles['Normal']))
    story.append(Paragraph(f"ZIP: {quote.buyer_zip}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    # Footer
    story.append(Paragraph(
        f"Quote generated on {quote.created_at.strftime('%B %d, %Y')}. "
        f"Valid until {quote.expires_at.strftime('%B %d, %Y') if quote.expires_at else 'N/A'}.",
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey)
    ))
    
    doc.build(story)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf


def generate_simple_pdf(quote):
    """Fallback simple PDF generation without reportlab"""
    content = f"""
VEHICLE QUOTE
Reference: {quote.reference_number}
Generated: {quote.created_at.strftime('%Y-%m-%d')}

VEHICLE DETAILS
{quote.vehicle_title}
VIN: {quote.vehicle_vin or 'N/A'}
Mileage: {quote.vehicle_mileage:,} miles

PRICING
Base Price: ${float(quote.base_price):,.2f}
Documentation Fee: ${float(quote.documentation_fee):,.2f}
Registration Fee: ${float(quote.registration_fee):,.2f}
Delivery Fee: ${float(quote.delivery_fee):,.2f}
Taxes: ${float(quote.tax_amount):,.2f}
------------------------
TOTAL: ${float(quote.total_price):,.2f}

DELIVERY TO
{quote.buyer_name}
{quote.buyer_email}
ZIP: {quote.buyer_zip}

Valid until: {quote.expires_at.strftime('%Y-%m-%d') if quote.expires_at else 'N/A'}
"""
    return content.encode('utf-8')


# Financing calculator endpoints
@api_view(['POST'])
@permission_classes([])
def calculate_financing(request):
    """Calculate financing options for a vehicle"""
    vehicle_price = float(request.data.get('vehicle_price', 0))
    down_payment = float(request.data.get('down_payment', 0))
    term_months = int(request.data.get('term_months', 60))
    credit_tier = request.data.get('credit_tier', 'default')
    
    # APR based on credit tier
    apr_rates = {
        'excellent': 3.99,
        'good': 5.99,
        'fair': 8.99,
        'default': 6.99,
    }
    apr = apr_rates.get(credit_tier, 6.99)
    
    loan_amount = vehicle_price - down_payment
    monthly_rate = apr / 100 / 12
    
    if monthly_rate > 0 and term_months > 0:
        monthly_payment = (
            loan_amount * monthly_rate * (1 + monthly_rate) ** term_months
        ) / ((1 + monthly_rate) ** term_months - 1)
    else:
        monthly_payment = loan_amount / term_months if term_months > 0 else 0
    
    total_interest = (monthly_payment * term_months) - loan_amount
    
    return Response({
        'loan_amount': round(loan_amount, 2),
        'apr': apr,
        'term_months': term_months,
        'monthly_payment': round(monthly_payment, 2),
        'total_interest': round(total_interest, 2),
        'total_cost': round(monthly_payment * term_months, 2),
    })


@api_view(['POST'])
@permission_classes([])
def check_affordability(request):
    """Check if a vehicle is affordable based on income"""
    vehicle_price = float(request.data.get('vehicle_price', 0))
    monthly_income = float(request.data.get('monthly_income', 0))
    monthly_expenses = float(request.data.get('monthly_expenses', 0))
    
    # Calculate max affordable payment (28% of gross income rule)
    max_payment = monthly_income * 0.28
    available_income = monthly_income - monthly_expenses
    
    # Estimate monthly payment at 6% APR for 60 months
    apr = 6.0
    term = 60
    monthly_rate = apr / 100 / 12
    estimated_payment = (
        vehicle_price * monthly_rate * (1 + monthly_rate) ** term
    ) / ((1 + monthly_rate) ** term - 1)
    
    is_affordable = estimated_payment <= max_payment and estimated_payment <= available_income * 0.5
    
    return Response({
        'is_affordable': is_affordable,
        'max_recommended_payment': round(max_payment, 2),
        'estimated_payment': round(estimated_payment, 2),
        'available_income': round(available_income, 2),
        'debt_to_income_ratio': round((estimated_payment / monthly_income) * 100, 1) if monthly_income > 0 else 0,
    })
