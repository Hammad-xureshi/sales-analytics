"""
============================================
Sales Patterns and Distribution Logic
Made by Hammad Naeem
============================================
"""

import random
from datetime import datetime
from config.settings import settings


class SalesPatterns:
    """Handles sales pattern logic for realistic simulation"""
    
    @staticmethod
    def get_current_hour():
        """Get current hour (0-23)"""
        return datetime.now().hour
    
    @staticmethod
    def is_weekend():
        """Check if today is weekend (Friday/Saturday for Pakistan)"""
        # In Pakistan, weekend is Friday and Saturday
        day = datetime.now().weekday()
        return day in [4, 5]  # Friday=4, Saturday=5
    
    @staticmethod
    def get_time_of_day():
        """Get time of day category"""
        hour = SalesPatterns.get_current_hour()
        
        if 6 <= hour < 12:
            return 'morning'
        elif 12 <= hour < 17:
            return 'afternoon'
        elif 17 <= hour < 22:
            return 'evening'
        else:
            return 'night'
    
    @staticmethod
    def get_sales_multiplier():
        """Calculate sales multiplier based on time and day"""
        time_of_day = SalesPatterns.get_time_of_day()
        peak_config = settings.PEAK_HOURS.get(time_of_day, {'multiplier': 1.0})
        
        multiplier = peak_config['multiplier']
        
        # Apply weekend boost
        if SalesPatterns.is_weekend():
            multiplier *= settings.WEEKEND_MULTIPLIER
        
        return multiplier
    
    @staticmethod
    def get_sales_count():
        """Calculate number of sales to generate"""
        base_min = settings.SALES_PER_MINUTE_MIN
        base_max = settings.SALES_PER_MINUTE_MAX
        multiplier = SalesPatterns.get_sales_multiplier()
        
        adjusted_min = max(1, int(base_min * multiplier))
        adjusted_max = max(adjusted_min, int(base_max * multiplier))
        
        return random.randint(adjusted_min, adjusted_max)
    
    @staticmethod
    def get_items_per_sale():
        """Get random number of items for a sale"""
        time_of_day = SalesPatterns.get_time_of_day()
        
        # More items during peak hours
        if time_of_day == 'evening':
            return random.randint(1, 5)
        elif time_of_day == 'afternoon':
            return random.randint(1, 4)
        else:
            return random.randint(1, 3)
    
    @staticmethod
    def get_payment_method():
        """Get random payment method with weighted probability"""
        methods = ['cash', 'card', 'bank_transfer', 'online']
        weights = [0.3, 0.35, 0.15, 0.2]  # 30% cash, 35% card, etc.
        
        return random.choices(methods, weights=weights)[0]
    
    @staticmethod
    def should_have_customer():
        """Determine if sale should have a registered customer"""
        # 60% chance of having a registered customer
        return random.random() < 0.6
    
    @staticmethod
    def get_quantity_for_product():
        """Get random quantity for a product in sale"""
        # Most sales are 1-2 items, occasionally more
        weights = [0.5, 0.3, 0.12, 0.05, 0.03]  # 1, 2, 3, 4, 5 items
        quantities = [1, 2, 3, 4, 5]
        
        return random.choices(quantities, weights=weights)[0]