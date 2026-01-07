"""
Financing calculation service
Handles loan calculations, payment schedules, and affordability analysis
"""
from decimal import Decimal, ROUND_HALF_UP
from datetime import datetime, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class FinancingCalculator:
    """
    Calculate financing options for vehicle purchases
    """
    
    # Default rate tiers based on credit score
    RATE_TIERS = {
        'excellent': Decimal('4.5'),   # 750+
        'good': Decimal('6.0'),        # 700-749
        'fair': Decimal('9.0'),        # 650-699
        'poor': Decimal('14.0'),       # 600-649
        'subprime': Decimal('18.0'),   # Below 600
        'default': Decimal('7.5'),     # Unknown credit
    }
    
    # Common loan terms in months
    AVAILABLE_TERMS = [24, 36, 48, 60, 72, 84]
    
    def __init__(self, vehicle_price: Decimal, down_payment: Decimal = Decimal('0')):
        self.vehicle_price = Decimal(str(vehicle_price))
        self.down_payment = Decimal(str(down_payment))
        self.loan_amount = self.vehicle_price - self.down_payment
    
    def calculate_monthly_payment(
        self, 
        term_months: int = 60, 
        annual_rate: Optional[Decimal] = None,
        credit_tier: str = 'default'
    ) -> dict:
        """
        Calculate monthly payment using standard amortization formula
        
        Args:
            term_months: Loan term in months
            annual_rate: Annual interest rate (as percentage, e.g., 5.0)
            credit_tier: Credit tier for rate lookup if rate not provided
            
        Returns:
            dict with payment details
        """
        if annual_rate is None:
            annual_rate = self.RATE_TIERS.get(credit_tier, self.RATE_TIERS['default'])
        else:
            annual_rate = Decimal(str(annual_rate))
        
        if self.loan_amount <= 0:
            return {
                'monthly_payment': Decimal('0'),
                'total_payment': self.vehicle_price,
                'total_interest': Decimal('0'),
                'loan_amount': Decimal('0'),
                'down_payment': self.down_payment,
                'term_months': term_months,
                'annual_rate': annual_rate,
            }
        
        # Monthly interest rate
        monthly_rate = annual_rate / Decimal('100') / Decimal('12')
        
        if monthly_rate == 0:
            # No interest - simple division
            monthly_payment = self.loan_amount / Decimal(str(term_months))
        else:
            # Standard amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
            compound = (1 + monthly_rate) ** term_months
            monthly_payment = self.loan_amount * (monthly_rate * compound) / (compound - 1)
        
        monthly_payment = monthly_payment.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        total_payment = (monthly_payment * term_months) + self.down_payment
        total_interest = total_payment - self.vehicle_price
        
        return {
            'monthly_payment': monthly_payment,
            'total_payment': total_payment.quantize(Decimal('0.01')),
            'total_interest': total_interest.quantize(Decimal('0.01')),
            'loan_amount': self.loan_amount,
            'down_payment': self.down_payment,
            'vehicle_price': self.vehicle_price,
            'term_months': term_months,
            'annual_rate': annual_rate,
        }
    
    def get_all_term_options(self, credit_tier: str = 'default') -> list:
        """Get payment options for all available terms"""
        options = []
        for term in self.AVAILABLE_TERMS:
            option = self.calculate_monthly_payment(term_months=term, credit_tier=credit_tier)
            option['term_label'] = f"{term} months ({term // 12} years)" if term >= 12 else f"{term} months"
            options.append(option)
        return options
    
    def generate_amortization_schedule(
        self, 
        term_months: int = 60, 
        annual_rate: Optional[Decimal] = None,
        start_date: Optional[datetime] = None
    ) -> list:
        """
        Generate full amortization schedule
        
        Returns:
            List of payment entries with date, payment, principal, interest, balance
        """
        if annual_rate is None:
            annual_rate = self.RATE_TIERS['default']
        else:
            annual_rate = Decimal(str(annual_rate))
        
        calc = self.calculate_monthly_payment(term_months, annual_rate)
        monthly_payment = calc['monthly_payment']
        monthly_rate = annual_rate / Decimal('100') / Decimal('12')
        
        schedule = []
        balance = self.loan_amount
        start_date = start_date or datetime.now()
        
        for month in range(1, term_months + 1):
            interest_payment = (balance * monthly_rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            principal_payment = monthly_payment - interest_payment
            
            # Adjust final payment if needed
            if month == term_months:
                principal_payment = balance
                monthly_payment = principal_payment + interest_payment
            
            balance -= principal_payment
            if balance < 0:
                balance = Decimal('0')
            
            payment_date = start_date + timedelta(days=30 * month)
            
            schedule.append({
                'payment_number': month,
                'date': payment_date.strftime('%Y-%m-%d'),
                'payment': monthly_payment,
                'principal': principal_payment,
                'interest': interest_payment,
                'balance': balance.quantize(Decimal('0.01')),
            })
        
        return schedule
    
    def check_affordability(
        self, 
        monthly_income: Decimal, 
        monthly_expenses: Decimal = Decimal('0'),
        max_dti_ratio: Decimal = Decimal('0.36')
    ) -> dict:
        """
        Check if the vehicle is affordable based on debt-to-income ratio
        
        Args:
            monthly_income: Gross monthly income
            monthly_expenses: Current monthly debt payments
            max_dti_ratio: Maximum acceptable DTI ratio (default 36%)
            
        Returns:
            Affordability assessment
        """
        monthly_income = Decimal(str(monthly_income))
        monthly_expenses = Decimal(str(monthly_expenses))
        
        # Calculate for 60-month term as baseline
        calc = self.calculate_monthly_payment(term_months=60)
        new_payment = calc['monthly_payment']
        
        # Calculate DTI with new payment
        total_monthly_debt = monthly_expenses + new_payment
        dti_ratio = total_monthly_debt / monthly_income if monthly_income > 0 else Decimal('1')
        
        affordable = dti_ratio <= max_dti_ratio
        
        # Calculate maximum affordable payment
        max_payment = (monthly_income * max_dti_ratio) - monthly_expenses
        
        # Find terms that would be affordable
        affordable_terms = []
        for term in self.AVAILABLE_TERMS:
            option = self.calculate_monthly_payment(term_months=term)
            if option['monthly_payment'] <= max_payment:
                affordable_terms.append(option)
        
        return {
            'is_affordable': affordable,
            'dti_ratio': (dti_ratio * 100).quantize(Decimal('0.1')),
            'max_dti_ratio': (max_dti_ratio * 100).quantize(Decimal('0.1')),
            'monthly_payment': new_payment,
            'max_affordable_payment': max_payment.quantize(Decimal('0.01')) if max_payment > 0 else Decimal('0'),
            'affordable_terms': affordable_terms,
            'recommendation': self._get_affordability_recommendation(dti_ratio, max_dti_ratio)
        }
    
    def _get_affordability_recommendation(self, dti_ratio: Decimal, max_dti_ratio: Decimal) -> str:
        """Get human-readable affordability recommendation"""
        if dti_ratio <= max_dti_ratio * Decimal('0.7'):
            return "Excellent fit for your budget. This vehicle is well within your means."
        elif dti_ratio <= max_dti_ratio:
            return "Good fit for your budget. Consider a larger down payment for more flexibility."
        elif dti_ratio <= max_dti_ratio * Decimal('1.2'):
            return "Slightly over budget. Consider a longer term or larger down payment."
        else:
            return "This vehicle may stretch your budget. Consider a more affordable option."


def calculate_price_from_monthly(
    monthly_payment: Decimal,
    term_months: int = 60,
    annual_rate: Decimal = Decimal('7.5'),
    down_payment: Decimal = Decimal('0')
) -> Decimal:
    """
    Reverse calculation: determine vehicle price from desired monthly payment
    """
    monthly_payment = Decimal(str(monthly_payment))
    annual_rate = Decimal(str(annual_rate))
    down_payment = Decimal(str(down_payment))
    
    monthly_rate = annual_rate / Decimal('100') / Decimal('12')
    
    if monthly_rate == 0:
        loan_amount = monthly_payment * term_months
    else:
        # Rearrange amortization formula to solve for P
        compound = (1 + monthly_rate) ** term_months
        loan_amount = monthly_payment * (compound - 1) / (monthly_rate * compound)
    
    vehicle_price = loan_amount + down_payment
    return vehicle_price.quantize(Decimal('0.01'))
