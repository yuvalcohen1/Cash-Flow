# app/core/database.py

import sqlite3
from typing import List, Dict, Optional
from contextlib import contextmanager
import json
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
                    try:
                        profile['financial_goals'] = json.loads(profile['financial_goals'])
                    except:
                        profile['financial_goals'] = []
                return profile
            
            return None

    def save_report(
        self,
        user_id: int,
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
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id,
                report_text,
                json.dumps(processed_insights),
                start_date,
                end_date,
                time_period.get('num_transactions', 0),
                summary.get('savings_rate'),
                summary.get('total_income'),
                summary.get('total_expenses'),
                model_used
            ))
            
            return cursor.lastrowid
    
    def get_user_reports(
        self,
        user_id: int,
        limit: int = 10,
        offset: int = 0
    ) -> List[Dict]:
        """
        Fetch AI reports for a user, ordered by most recent first
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT 
                    id, user_id, report_text, processed_insights,
                    start_date, end_date, num_transactions,
                    savings_rate, total_income, total_expenses,
                    model_used, created_at
                FROM ai_reports
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            """, (user_id, limit, offset))
            
            rows = cursor.fetchall()
            
            reports = []
            for row in rows:
                report = dict(row)
                # Parse JSON insights
                try:
                    report['processed_insights'] = json.loads(report['processed_insights'])
                except:
                    report['processed_insights'] = {}
                reports.append(report)
            
            return reports
    
    def get_report_by_id(self, user_id: int, report_id: int) -> Optional[Dict]:
        """
        Fetch a specific report by ID (with user_id check for security)
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT 
                    id, user_id, report_text, processed_insights,
                    start_date, end_date, num_transactions,
                    savings_rate, total_income, total_expenses,
                    model_used, created_at
                FROM ai_reports
                WHERE id = ? AND user_id = ?
            """, (report_id, user_id))
            
            row = cursor.fetchone()
            
            if row:
                report = dict(row)
                try:
                    report['processed_insights'] = json.loads(report['processed_insights'])
                except:
                    report['processed_insights'] = {}
                return report
            
            return None
    
    def delete_report(self, user_id: int, report_id: int) -> bool:
        """
        Delete a report (with user_id check for security)
        Returns True if deleted, False if not found
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                DELETE FROM ai_reports
                WHERE id = ? AND user_id = ?
            """, (report_id, user_id))
            
            return cursor.rowcount > 0


# Global database instance
db = DatabaseManager()