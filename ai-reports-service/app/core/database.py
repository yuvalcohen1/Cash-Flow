# app/core/database.py

import sqlite3
from typing import List, Dict, Optional
from contextlib import contextmanager
from app.core.config import settings
from app.core.categories import get_category_name


class DatabaseManager:
    """Manages SQLite database connections and queries"""
    
    def __init__(self):
        self.db_path = settings.DATABASE_PATH
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Return rows as dictionaries
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def get_transactions_by_user(
        self, 
        user_id: int, 
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict]:
        """
        Fetch all transactions for a user, optionally filtered by date range
        Converts category_id to category name
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            query = """
                SELECT id, user_id, type, amount, category_id, description, 
                       date, created_at, updated_at
                FROM transactions
                WHERE user_id = ?
            """
            params = [user_id]
            
            if start_date:
                query += " AND date >= ?"
                params.append(start_date)
            
            if end_date:
                query += " AND date <= ?"
                params.append(end_date)
            
            query += " ORDER BY date DESC"
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            # Convert Row objects to dictionaries and map category names
            transactions = []
            for row in rows:
                transaction = dict(row)
                # Convert category_id to name
                transaction['category_id'] = get_category_name(transaction['category_id'])
                transactions.append(transaction)
            
            return transactions
    
    def get_user_profile(self, user_id: int) -> Optional[Dict]:
        """
        Fetch user profile information
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT user_id, name, financial_goals, risk_tolerance
                FROM user_profiles
                WHERE user_id = ?
            """, (user_id,))
            
            row = cursor.fetchone()
            
            if row:
                profile = dict(row)
                # Parse financial_goals if stored as JSON string
                if profile.get('financial_goals'):
                    import json
                    try:
                        profile['financial_goals'] = json.loads(profile['financial_goals'])
                    except:
                        profile['financial_goals'] = []
                return profile
            
            return None


# Global database instance
db = DatabaseManager()