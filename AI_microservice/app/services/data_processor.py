# app/services/data_processor.py

from datetime import datetime
from collections import defaultdict
from typing import List, Dict, Any


class FinancialDataProcessor:
    """Processes raw transaction data into structured insights"""
    
    def __init__(self, transactions: List[Dict], user_profile: Dict = None):
        self.transactions = transactions
        self.user_profile = user_profile or {}
        self.insights = {}
    
    def process(self) -> Dict[str, Any]:
        """Main processing pipeline"""
        # Process in order - some depend on previous results
        self.insights['time_period'] = self._get_time_period()
        self.insights['summary'] = self._calculate_summary()
        self.insights['spending_by_category'] = self._analyze_by_category()
        self.insights['income_analysis'] = self._analyze_income()
        self.insights['spending_patterns'] = self._detect_spending_patterns()
        self.insights['comparisons'] = self._calculate_comparisons()
        self.insights['anomalies'] = self._detect_anomalies()
        self.insights['milestones'] = self._identify_milestones()
        self.insights['behavioral_insights'] = self._extract_behavioral_insights()
        
        return self.insights
    
    def _get_time_period(self) -> Dict:
        """Determine the time period of transactions"""
        if not self.transactions:
            return {}
        
        dates = [datetime.fromisoformat(t['date'].replace('Z', '+00:00')) 
                 for t in self.transactions]
        return {
            'start_date': min(dates).strftime('%Y-%m-%d'),
            'end_date': max(dates).strftime('%Y-%m-%d'),
            'num_days': (max(dates) - min(dates)).days + 1,
            'num_transactions': len(self.transactions)
        }
    
    def _calculate_summary(self) -> Dict:
        """Calculate high-level financial summary"""
        total_income = sum(t['amount'] for t in self.transactions 
                          if t['type'] == 'income')
        total_expenses = sum(t['amount'] for t in self.transactions 
                            if t['type'] == 'expense')
        
        # Get num_days, default to 1 if not available yet
        time_period = self._get_time_period() if not self.insights else self.insights.get('time_period', {})
        num_days = time_period.get('num_days', 1)
        
        return {
            'total_income': total_income,
            'total_expenses': total_expenses,
            'net_savings': total_income - total_expenses,
            'savings_rate': (total_income - total_expenses) / total_income * 100 
                           if total_income > 0 else 0,
            'avg_daily_spending': total_expenses / max(1, num_days)
        }
    
    def _analyze_by_category(self) -> List[Dict]:
        """Analyze spending by category"""
        category_data = defaultdict(lambda: {'total': 0, 'count': 0, 'transactions': []})
        
        for t in self.transactions:
            if t['type'] == 'expense':
                cat = t.get('category_id', 'uncategorized')
                category_data[cat]['total'] += t['amount']
                category_data[cat]['count'] += 1
                category_data[cat]['transactions'].append(t)
        
        total_expenses = sum(c['total'] for c in category_data.values())
        
        result = []
        for cat, data in category_data.items():
            result.append({
                'category': cat,
                'total_spent': data['total'],
                'num_transactions': data['count'],
                'percentage_of_total': (data['total'] / total_expenses * 100) 
                                      if total_expenses > 0 else 0,
                'avg_transaction': data['total'] / data['count'] if data['count'] > 0 else 0,
                'largest_transaction': max(data['transactions'], 
                                          key=lambda x: x['amount'])['amount']
            })
        
        return sorted(result, key=lambda x: x['total_spent'], reverse=True)
    
    def _analyze_income(self) -> Dict:
        """Analyze income sources and patterns"""
        income_txns = [t for t in self.transactions if t['type'] == 'income']
        
        if not income_txns:
            return {}
        
        income_by_category = defaultdict(float)
        for t in income_txns:
            cat = t.get('category_id', 'other')
            income_by_category[cat] += t['amount']
        
        return {
            'total_income': sum(t['amount'] for t in income_txns),
            'num_income_transactions': len(income_txns),
            'avg_income_transaction': sum(t['amount'] for t in income_txns) / len(income_txns),
            'income_sources': dict(income_by_category),
            'largest_income': max(income_txns, key=lambda x: x['amount'])
        }
    
    def _detect_spending_patterns(self) -> Dict:
        """Detect temporal and behavioral spending patterns"""
        expense_txns = [t for t in self.transactions if t['type'] == 'expense']
        
        if not expense_txns:
            return {}
        
        # Group by day of week
        by_day = defaultdict(list)
        for t in expense_txns:
            dt = datetime.fromisoformat(t['date'].replace('Z', '+00:00'))
            by_day[dt.strftime('%A')].append(t['amount'])
        
        # Spending velocity (frequency patterns)
        dates = sorted([datetime.fromisoformat(t['date'].replace('Z', '+00:00')) 
                       for t in expense_txns])
        intervals = [(dates[i+1] - dates[i]).days for i in range(len(dates)-1)]
        avg_days_between = sum(intervals) / len(intervals) if intervals else 0
        
        return {
            'spending_by_day': {day: {
                'total': sum(amounts),
                'avg': sum(amounts) / len(amounts),
                'count': len(amounts)
            } for day, amounts in by_day.items()},
            'most_active_day': max(by_day.items(), key=lambda x: len(x[1]))[0] 
                              if by_day else None,
            'avg_days_between_transactions': avg_days_between,
            'spending_frequency': 'high' if avg_days_between < 1 
                                 else 'moderate' if avg_days_between < 3 
                                 else 'low'
        }
    
    def _calculate_comparisons(self) -> Dict:
        """Calculate period-over-period comparisons if data available"""
        summary = self.insights.get('summary', {})
        
        return {
            'vs_typical_savings_rate': self._compare_to_benchmark(
                summary.get('savings_rate', 0), 20
            ),
            'spending_trend': self._calculate_trend()
        }
    
    def _compare_to_benchmark(self, value: float, benchmark: float) -> Dict:
        """Compare a value to a benchmark"""
        diff = value - benchmark
        return {
            'value': value,
            'benchmark': benchmark,
            'difference': diff,
            'performance': 'above' if diff > 0 else 'below' if diff < 0 else 'at'
        }
    
    def _calculate_trend(self) -> str:
        """Calculate spending trend over time"""
        expense_txns = [t for t in self.transactions if t['type'] == 'expense']
        
        if len(expense_txns) < 2:
            return 'insufficient_data'
        
        sorted_txns = sorted(expense_txns, 
                            key=lambda x: datetime.fromisoformat(x['date'].replace('Z', '+00:00')))
        
        mid = len(sorted_txns) // 2
        first_half = sum(t['amount'] for t in sorted_txns[:mid])
        second_half = sum(t['amount'] for t in sorted_txns[mid:])
        
        if second_half > first_half * 1.1:
            return 'increasing'
        elif second_half < first_half * 0.9:
            return 'decreasing'
        else:
            return 'stable'
    
    def _detect_anomalies(self) -> List[Dict]:
        """Detect unusual transactions"""
        expense_txns = [t for t in self.transactions if t['type'] == 'expense']
        
        if len(expense_txns) < 3:
            return []
        
        amounts = [t['amount'] for t in expense_txns]
        avg = sum(amounts) / len(amounts)
        std = (sum((x - avg) ** 2 for x in amounts) / len(amounts)) ** 0.5
        
        anomalies = []
        for t in expense_txns:
            if t['amount'] > avg + 2 * std:
                anomalies.append({
                    'transaction': t,
                    'reason': 'unusually_high',
                    'deviation': (t['amount'] - avg) / std
                })
        
        return sorted(anomalies, key=lambda x: x['deviation'], reverse=True)[:5]
    
    def _identify_milestones(self) -> List[Dict]:
        """Identify positive financial milestones"""
        milestones = []
        summary = self.insights.get('summary', {})
        
        if summary.get('savings_rate', 0) > 0:
            milestones.append({
                'type': 'positive_savings',
                'message': f"You saved {summary['savings_rate']:.1f}% of your income",
                'sentiment': 'positive'
            })
        
        if summary.get('savings_rate', 0) > 20:
            milestones.append({
                'type': 'excellent_savings',
                'message': "Excellent savings rate above 20%",
                'sentiment': 'very_positive'
            })
        
        spending_patterns = self.insights.get('spending_patterns', {})
        if spending_patterns.get('spending_frequency') == 'low':
            milestones.append({
                'type': 'controlled_spending',
                'message': "You're being thoughtful with your spending frequency",
                'sentiment': 'positive'
            })
        
        return milestones
    
    def _extract_behavioral_insights(self) -> List[str]:
        """Extract behavioral insights from patterns"""
        insights = []
        
        spending_patterns = self.insights.get('spending_patterns', {})
        most_active_day = spending_patterns.get('most_active_day')
        
        if most_active_day:
            insights.append(f"You tend to spend most on {most_active_day}s")
        
        categories = self.insights.get('spending_by_category', [])
        if categories:
            top_cat = categories[0]
            if top_cat['percentage_of_total'] > 40:
                insights.append(
                    f"{top_cat['category']} dominates your spending at "
                    f"{top_cat['percentage_of_total']:.0f}% of expenses"
                )
        
        comparisons = self.insights.get('comparisons', {})
        trend = comparisons.get('spending_trend')
        if trend == 'decreasing':
            insights.append("Your spending has been decreasing over time - great progress!")
        elif trend == 'increasing':
            insights.append("Your spending has been trending upward recently")
        
        return insights