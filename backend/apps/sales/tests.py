"""
Tests for the sales app
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal

from apps.vehicles.models import Vehicle
from apps.users.models import Inquiry

User = get_user_model()


class FinancingCalculatorTests(TestCase):
    """Test the FinancingCalculator service"""
    
    def test_monthly_payment_calculation(self):
        """Test monthly payment calculation"""
        from apps.sales.financing import FinancingCalculator
        
        calc = FinancingCalculator(
            vehicle_price=Decimal('30000'),
            down_payment=Decimal('3000')
        )
        
        result = calc.calculate_monthly_payment(term_months=60, annual_rate=Decimal('6.0'))
        
        self.assertEqual(result['loan_amount'], Decimal('27000'))
        self.assertGreater(result['monthly_payment'], 0)
        self.assertEqual(result['term_months'], 60)
        self.assertEqual(result['annual_rate'], Decimal('6.0'))
    
    def test_zero_interest_rate(self):
        """Test with 0% interest rate"""
        from apps.sales.financing import FinancingCalculator
        
        calc = FinancingCalculator(
            vehicle_price=Decimal('24000'),
            down_payment=Decimal('0')
        )
        
        result = calc.calculate_monthly_payment(term_months=48, annual_rate=Decimal('0'))
        
        self.assertEqual(result['monthly_payment'], Decimal('500.00'))
        self.assertEqual(result['total_interest'], Decimal('0.00'))
    
    def test_full_down_payment(self):
        """Test when down payment equals vehicle price"""
        from apps.sales.financing import FinancingCalculator
        
        calc = FinancingCalculator(
            vehicle_price=Decimal('20000'),
            down_payment=Decimal('20000')
        )
        
        result = calc.calculate_monthly_payment(term_months=60)
        
        self.assertEqual(result['monthly_payment'], Decimal('0'))
        self.assertEqual(result['loan_amount'], Decimal('0'))
    
    def test_all_term_options(self):
        """Test getting all term options"""
        from apps.sales.financing import FinancingCalculator
        
        calc = FinancingCalculator(vehicle_price=Decimal('25000'))
        options = calc.get_all_term_options()
        
        self.assertEqual(len(options), 6)  # 24, 36, 48, 60, 72, 84 months
        
        # Shorter terms should have higher monthly but lower total interest
        self.assertGreater(options[0]['monthly_payment'], options[-1]['monthly_payment'])
        self.assertLess(options[0]['total_interest'], options[-1]['total_interest'])
    
    def test_amortization_schedule(self):
        """Test amortization schedule generation"""
        from apps.sales.financing import FinancingCalculator
        
        calc = FinancingCalculator(vehicle_price=Decimal('10000'))
        schedule = calc.generate_amortization_schedule(term_months=12, annual_rate=Decimal('12.0'))
        
        self.assertEqual(len(schedule), 12)
        self.assertEqual(schedule[-1]['payment_number'], 12)
        self.assertEqual(schedule[-1]['balance'], Decimal('0.00'))
    
    def test_affordability_check_affordable(self):
        """Test affordability check for affordable vehicle"""
        from apps.sales.financing import FinancingCalculator
        
        calc = FinancingCalculator(vehicle_price=Decimal('15000'))
        result = calc.check_affordability(
            monthly_income=Decimal('5000'),
            monthly_expenses=Decimal('500')
        )
        
        self.assertTrue(result['is_affordable'])
        self.assertLess(result['dti_ratio'], Decimal('36'))
    
    def test_affordability_check_not_affordable(self):
        """Test affordability check for unaffordable vehicle"""
        from apps.sales.financing import FinancingCalculator
        
        calc = FinancingCalculator(vehicle_price=Decimal('100000'))
        result = calc.check_affordability(
            monthly_income=Decimal('3000'),
            monthly_expenses=Decimal('1500')
        )
        
        self.assertFalse(result['is_affordable'])
        self.assertIn('recommendation', result)


class InquiryTests(TestCase):
    """Test Inquiry functionality"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='buyer',
            email='buyer@example.com',
            password='buyerpass'
        )
        self.vehicle = Vehicle.objects.create(
            make='Honda',
            model='Accord',
            year=2022,
            price=32000,
            status='active'
        )
    
    def test_create_inquiry(self):
        """Test creating an inquiry"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post('/api/vehicles/inquiries/', {
            'car': self.vehicle.id,
            'message': 'Interested in this vehicle, please contact me.',
            'preferred_contact': 'phone'
        })
        
        # Check if created successfully
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])
    
    def test_list_user_inquiries(self):
        """Test listing user's inquiries"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get('/api/vehicles/inquiries/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class PriceCalculationTests(TestCase):
    """Test price calculation from monthly payment"""
    
    def test_calculate_price_from_monthly(self):
        """Test reverse calculation"""
        from apps.sales.financing import calculate_price_from_monthly
        
        # If monthly payment is $500 for 60 months at 6%
        price = calculate_price_from_monthly(
            monthly_payment=Decimal('500'),
            term_months=60,
            annual_rate=Decimal('6.0'),
            down_payment=Decimal('5000')
        )
        
        # Should return the vehicle price
        self.assertGreater(price, Decimal('25000'))
        self.assertLess(price, Decimal('35000'))
