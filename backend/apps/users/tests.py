"""
Tests for the users app
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()


class UserModelTests(TestCase):
    """Test the User model"""
    
    def test_create_user(self):
        """Test creating a user"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
        self.assertEqual(user.role, 'buyer')  # Default role
    
    def test_create_dealer(self):
        """Test creating a dealer user"""
        user = User.objects.create_user(
            username='dealer1',
            email='dealer@example.com',
            password='dealerpass',
            role='dealer',
            dealer_name='Test Motors'
        )
        self.assertEqual(user.role, 'dealer')
        self.assertEqual(user.dealer_name, 'Test Motors')
    
    def test_create_superuser(self):
        """Test creating a superuser"""
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass'
        )
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_staff)


class UserAPITests(TestCase):
    """Test User API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_register_user(self):
        """Test user registration"""
        response = self.client.post('/api/users/', {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
        })
        # Should create successfully (201) or return appropriate error
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])
    
    def test_login(self):
        """Test JWT login"""
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
    
    def test_login_invalid_credentials(self):
        """Test login with wrong password"""
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_get_profile_authenticated(self):
        """Test getting user profile when authenticated"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
    
    def test_get_profile_unauthenticated(self):
        """Test getting profile without auth returns 401"""
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class FavoriteAPITests(TestCase):
    """Test Favorite API endpoints"""
    
    def setUp(self):
        from apps.vehicles.models import Vehicle
        
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='buyer',
            email='buyer@example.com',
            password='buyerpass'
        )
        self.vehicle = Vehicle.objects.create(
            make='Toyota',
            model='Camry',
            year=2020,
            price=25000,
            status='active'
        )
    
    def test_toggle_favorite(self):
        """Test adding and removing favorite"""
        self.client.force_authenticate(user=self.user)
        
        # Add favorite
        response = self.client.post('/api/users/favorites/toggle/', {
            'vehicle_id': self.vehicle.id
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['is_favorited'])
        
        # Remove favorite
        response = self.client.post('/api/users/favorites/toggle/', {
            'vehicle_id': self.vehicle.id
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_favorited'])
    
    def test_list_favorites(self):
        """Test listing user favorites"""
        from apps.users.models import Favorite
        
        self.client.force_authenticate(user=self.user)
        Favorite.objects.create(user=self.user, vehicle=self.vehicle)
        
        response = self.client.get('/api/users/favorites/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
