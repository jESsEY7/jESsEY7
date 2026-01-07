"""
Smart Vehicle Matching Engine
Matches client preferences to available vehicles using rule-based scoring
"""
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class VehicleMatchingEngine:
    """
    Rule-based matching engine that scores vehicles based on client preferences
    """
    
    # Weight factors for different criteria (total = 100)
    WEIGHTS = {
        'budget': 30,
        'body_type': 15,
        'fuel_type': 10,
        'condition': 10,
        'mileage': 10,
        'year': 10,
        'make': 10,
        'features': 5,
    }
    
    def __init__(self, vehicles_queryset):
        self.vehicles = vehicles_queryset
    
    def match(self, preferences, limit=10):
        """
        Match vehicles to client preferences
        
        Args:
            preferences: dict with keys like budget_min, budget_max, body_type, etc.
            limit: max number of results
            
        Returns:
            List of (vehicle, score) tuples sorted by score desc
        """
        scored_vehicles = []
        
        for vehicle in self.vehicles.filter(status='active'):
            score = self.calculate_score(vehicle, preferences)
            if score > 0:
                scored_vehicles.append({
                    'vehicle': vehicle,
                    'score': score,
                    'match_details': self.get_match_details(vehicle, preferences)
                })
        
        # Sort by score descending
        scored_vehicles.sort(key=lambda x: x['score'], reverse=True)
        
        return scored_vehicles[:limit]
    
    def calculate_score(self, vehicle, preferences):
        """Calculate match score for a vehicle based on preferences"""
        score = 0
        
        # Budget match (30 points)
        score += self.score_budget(vehicle, preferences)
        
        # Body type match (15 points)
        score += self.score_exact_match(
            vehicle.body_type, 
            preferences.get('body_type'),
            self.WEIGHTS['body_type']
        )
        
        # Fuel type match (10 points)
        score += self.score_exact_match(
            vehicle.fuel_type,
            preferences.get('fuel_type'),
            self.WEIGHTS['fuel_type']
        )
        
        # Condition match (10 points)
        score += self.score_condition(vehicle, preferences)
        
        # Mileage match (10 points)
        score += self.score_mileage(vehicle, preferences)
        
        # Year match (10 points)
        score += self.score_year(vehicle, preferences)
        
        # Make preference (10 points)
        score += self.score_exact_match(
            vehicle.make.lower() if vehicle.make else '',
            preferences.get('make', '').lower() if preferences.get('make') else None,
            self.WEIGHTS['make']
        )
        
        # Features match (5 points)
        score += self.score_features(vehicle, preferences)
        
        return round(score, 2)
    
    def score_budget(self, vehicle, preferences):
        """Score based on how well the vehicle fits the budget"""
        budget_min = preferences.get('budget_min', 0)
        budget_max = preferences.get('budget_max', float('inf'))
        price = float(vehicle.price)
        
        if budget_max == float('inf') and budget_min == 0:
            # No budget preference, give partial points
            return self.WEIGHTS['budget'] * 0.5
        
        if budget_min <= price <= budget_max:
            # Within budget - calculate how centered it is
            if budget_max != float('inf'):
                budget_range = budget_max - budget_min
                if budget_range > 0:
                    # Higher score for prices in the middle of the range
                    center = (budget_min + budget_max) / 2
                    distance_from_center = abs(price - center) / (budget_range / 2)
                    position_score = 1 - (distance_from_center * 0.3)  # Max 30% penalty
                    return self.WEIGHTS['budget'] * position_score
            return self.WEIGHTS['budget']
        
        # Outside budget
        if price < budget_min:
            # Below budget - might be okay, partial score
            ratio = price / budget_min if budget_min > 0 else 0
            return self.WEIGHTS['budget'] * ratio * 0.5
        else:
            # Over budget - penalize more
            if budget_max > 0 and budget_max != float('inf'):
                overage = (price - budget_max) / budget_max
                return max(0, self.WEIGHTS['budget'] * (1 - overage * 2))
            return 0
    
    def score_exact_match(self, vehicle_value, preference_value, weight):
        """Score for exact match criteria"""
        if not preference_value:
            return weight * 0.5  # No preference, partial score
        if vehicle_value and vehicle_value.lower() == preference_value.lower():
            return weight
        return 0
    
    def score_condition(self, vehicle, preferences):
        """Score based on vehicle condition preference"""
        pref_condition = preferences.get('condition')
        if not pref_condition:
            return self.WEIGHTS['condition'] * 0.5
        
        condition_order = ['new', 'certified_preowned', 'excellent', 'good', 'fair']
        
        if vehicle.condition == pref_condition:
            return self.WEIGHTS['condition']
        
        try:
            pref_idx = condition_order.index(pref_condition)
            vehicle_idx = condition_order.index(vehicle.condition) if vehicle.condition else 4
            
            # Better condition than preferred - full score
            if vehicle_idx <= pref_idx:
                return self.WEIGHTS['condition']
            
            # Worse condition - partial score
            distance = vehicle_idx - pref_idx
            return max(0, self.WEIGHTS['condition'] * (1 - distance * 0.25))
        except ValueError:
            return self.WEIGHTS['condition'] * 0.5
    
    def score_mileage(self, vehicle, preferences):
        """Score based on mileage preference"""
        max_mileage = preferences.get('max_mileage')
        if not max_mileage:
            return self.WEIGHTS['mileage'] * 0.5
        
        vehicle_mileage = vehicle.mileage or 0
        
        if vehicle_mileage <= max_mileage:
            # Lower mileage is better
            ratio = 1 - (vehicle_mileage / max_mileage)
            return self.WEIGHTS['mileage'] * (0.5 + ratio * 0.5)
        
        # Over mileage limit
        overage = (vehicle_mileage - max_mileage) / max_mileage
        return max(0, self.WEIGHTS['mileage'] * (1 - overage))
    
    def score_year(self, vehicle, preferences):
        """Score based on year preference"""
        min_year = preferences.get('min_year')
        max_year = preferences.get('max_year')
        
        if not min_year and not max_year:
            return self.WEIGHTS['year'] * 0.5
        
        vehicle_year = vehicle.year
        
        min_year = min_year or 1990
        max_year = max_year or 2030
        
        if min_year <= vehicle_year <= max_year:
            # Newer is generally better within range
            year_range = max_year - min_year
            if year_range > 0:
                position = (vehicle_year - min_year) / year_range
                return self.WEIGHTS['year'] * (0.7 + position * 0.3)
            return self.WEIGHTS['year']
        
        return 0
    
    def score_features(self, vehicle, preferences):
        """Score based on desired features"""
        desired_features = preferences.get('features', [])
        if not desired_features:
            return self.WEIGHTS['features'] * 0.5
        
        vehicle_features = vehicle.features or []
        if not vehicle_features:
            return 0
        
        # Normalize to lowercase for comparison
        vehicle_features_lower = [f.lower() for f in vehicle_features]
        matches = sum(1 for f in desired_features if f.lower() in vehicle_features_lower)
        
        if len(desired_features) > 0:
            match_ratio = matches / len(desired_features)
            return self.WEIGHTS['features'] * match_ratio
        
        return 0
    
    def get_match_details(self, vehicle, preferences):
        """Get detailed breakdown of why this vehicle matches"""
        details = []
        
        # Budget match
        budget_max = preferences.get('budget_max')
        if budget_max and float(vehicle.price) <= budget_max:
            savings = budget_max - float(vehicle.price)
            if savings > 0:
                details.append(f"${savings:,.0f} under budget")
        
        # Condition
        if vehicle.condition == preferences.get('condition'):
            details.append(f"Matches preferred {vehicle.condition} condition")
        
        # Body type
        if vehicle.body_type == preferences.get('body_type'):
            details.append(f"Preferred {vehicle.body_type} body style")
        
        # Low mileage
        max_mileage = preferences.get('max_mileage')
        if max_mileage and vehicle.mileage and vehicle.mileage < max_mileage * 0.5:
            details.append("Low mileage")
        
        return details


def get_recommendations_for_user(user, limit=6):
    """
    Get personalized vehicle recommendations based on user history
    """
    from apps.vehicles.models import Vehicle
    from apps.users.models import Favorite, Inquiry
    
    # Analyze user's favorites and inquiries to build preference profile
    preferences = {}
    
    # Get favorited vehicles
    favorites = Favorite.objects.filter(user=user).select_related('vehicle')
    if favorites.exists():
        fav_vehicles = [f.vehicle for f in favorites]
        
        # Analyze price range
        prices = [float(v.price) for v in fav_vehicles if v.price]
        if prices:
            preferences['budget_min'] = min(prices) * 0.8
            preferences['budget_max'] = max(prices) * 1.2
        
        # Most common body type
        body_types = [v.body_type for v in fav_vehicles if v.body_type]
        if body_types:
            preferences['body_type'] = max(set(body_types), key=body_types.count)
        
        # Most common make
        makes = [v.make for v in fav_vehicles if v.make]
        if makes:
            preferences['make'] = max(set(makes), key=makes.count)
    
    # Get active vehicles
    vehicles = Vehicle.objects.filter(status='active').exclude(
        id__in=[f.vehicle_id for f in favorites]  # Exclude already favorited
    )
    
    engine = VehicleMatchingEngine(vehicles)
    matches = engine.match(preferences, limit=limit)
    
    return matches
