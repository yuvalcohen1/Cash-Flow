# app/core/database.py

import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
from typing import List, Dict, Optional
from contextlib import contextmanager
import json
import os
from app.core.config import settings
from app.core.categories import get_category_name


class DatabaseManager:
    """Manages PostgreSQL database connections and queries"""
    
    def __init__(self):
        # Use DATABASE_URL directly instead of parsing it
        database_url = settings.DATABASE_URL

        if not database_url:
            raise ValueError("DATABASE_URL environment variable is not set!")

        # Initialize connection pool with connection string
        self.pool = SimpleConnectionPool(
            minconn=1,
            maxconn=20,
            dsn=database_url  # Use connection string directly
        )
        print("✅ Connected to Supabase PostgreSQL")
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = self.pool.getconn()
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            self.pool.putconn(conn)
    
    def get_transactions_by_user(
        self, 
        user_id: str,  # UUID as string
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[Dict]:
        """
        Fetch all transactions for a user, optionally filtered by date range
        Converts category_id to category name
        """
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            query = """
                SELECT id, user_id, type, amount, category_id, description, 
                       date, created_at, updated_at
                FROM transactions
                WHERE user_id = %s
            """
            params = [user_id]
            
            if start_date:
                query += " AND date >= %s"
                params.append(start_date)
            
            if end_date:
                query += " AND date <= %s"
                params.append(end_date)
            
            query += " ORDER BY date DESC"
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            # Convert RealDictRow to dict and map category names
            transactions = []
            for row in rows:
                transaction = dict(row)
                # Convert UUID to string
                transaction['user_id'] = str(transaction['user_id'])
                # Convert category_id to name
                transaction['category_id'] = get_category_name(transaction['category_id'])
                transactions.append(transaction)
            
            return transactions
    
    def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """
        Fetch user profile information
        Note: You may need to create a user_profiles table if it doesn't exist
        """
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute("""
                SELECT user_id, name, financial_goals, risk_tolerance
                FROM user_profiles
                WHERE user_id = %s
            """, (user_id,))
            
            row = cursor.fetchone()
            
            if row:
                profile = dict(row)
                profile['user_id'] = str(profile['user_id'])
                # Parse financial_goals if stored as JSON
                if profile.get('financial_goals'):
                    if isinstance(profile['financial_goals'], str):
                        try:
                            profile['financial_goals'] = json.loads(profile['financial_goals'])
                        except:
                            profile['financial_goals'] = []
                return profile
            
            return None

    def save_report(
        self,
        user_id: str,  # UUID as string
        report_text: str,
        processed_insights: Dict,
        start_date: Optional[str],
        end_date: Optional[str],
        model_used: str = "gemini-2.5-flash"
    ) -> int:
        """
        Save an AI report to the database
        Returns the report ID
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Extract summary data
            summary = processed_insights.get('summary', {})
            time_period = processed_insights.get('time_period', {})
            
            cursor.execute("""
                INSERT INTO ai_reports (
                    user_id, report_text, processed_insights,
                    start_date, end_date, num_transactions,
                    savings_rate, total_income, total_expenses, model_used
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                user_id,
                report_text,
                json.dumps(processed_insights),  # PostgreSQL handles JSON automatically
                start_date,
                end_date,
                time_period.get('num_transactions', 0),
                summary.get('savings_rate'),
                summary.get('total_income'),
                summary.get('total_expenses'),
                model_used
            ))
            
            report_id = cursor.fetchone()[0]
            return report_id
    
    def get_user_reports(
        self,
        user_id: str,  # UUID as string
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict]:
        """
        Fetch AI reports for a user, ordered by most recent first
        """
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute("""
                SELECT 
                    id, user_id, report_text, processed_insights,
                    start_date, end_date, num_transactions,
                    savings_rate, total_income, total_expenses,
                    model_used, created_at
                FROM ai_reports
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """, (user_id, limit, offset))
            
            rows = cursor.fetchall()
            
            reports = []
            for row in rows:
                report = dict(row)
                report['user_id'] = str(report['user_id'])
                # Parse JSON insights (PostgreSQL may return as dict already)
                if isinstance(report['processed_insights'], str):
                    try:
                        report['processed_insights'] = json.loads(report['processed_insights'])
                    except:
                        report['processed_insights'] = {}
                reports.append(report)
            
            return reports
    
    def get_report_by_id(self, user_id: str, report_id: int) -> Optional[Dict]:
        """
        Fetch a specific report by ID (with user_id check for security)
        """
        with self.get_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            cursor.execute("""
                SELECT 
                    id, user_id, report_text, processed_insights,
                    start_date, end_date, num_transactions,
                    savings_rate, total_income, total_expenses,
                    model_used, created_at
                FROM ai_reports
                WHERE id = %s AND user_id = %s
            """, (report_id, user_id))
            
            row = cursor.fetchone()
            
            if row:
                report = dict(row)
                report['user_id'] = str(report['user_id'])
                if isinstance(report['processed_insights'], str):
                    try:
                        report['processed_insights'] = json.loads(report['processed_insights'])
                    except:
                        report['processed_insights'] = {}
                return report
            
            return None
    
    def delete_report(self, user_id: str, report_id: int) -> bool:
        """
        Delete a report (with user_id check for security)
        Returns True if deleted, False if not found
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                DELETE FROM ai_reports
                WHERE id = %s AND user_id = %s
            """, (report_id, user_id))
            
            return cursor.rowcount > 0
    
    def close(self):
        """Close all connections in the pool"""
        if self.pool:
            self.pool.closeall()
            print("🔒 Database connection pool closed")


# Global database instance
db = DatabaseManager()