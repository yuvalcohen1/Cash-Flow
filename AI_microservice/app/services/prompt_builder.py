from typing import Dict


class PromptBuilder:
    """Builds rich, contextual prompts for LLM generation"""
    
    def __init__(self, insights: Dict, user_profile: Dict = None):
        self.insights = insights
        self.user_profile = user_profile or {}
    
    def build_prompt(self) -> str:
        """Construct the complete prompt for LLM"""
        
        system_context = self._build_system_context()
        data_context = self._build_data_context()
        user_context = self._build_user_context()
        tone_guidance = self._build_tone_guidance()
        output_structure = self._build_output_structure()
        
        prompt = f"""{system_context}

{user_context}

{data_context}

{tone_guidance}

{output_structure}"""
        
        return prompt
    
    def _build_system_context(self) -> str:
        """Define the AI's role and capabilities"""
        return """You are a personal finance advisor AI creating a personalized financial report. 
Your goal is to provide insights that are:
- Personal and contextual (using the user's actual data)
- Emotionally intelligent (celebrating wins, being empathetic about challenges)
- Actionable (providing specific, achievable suggestions)
- Encouraging (maintaining a supportive, non-judgmental tone)
- Balanced (acknowledging both strengths and areas for improvement)"""
    
    def _build_user_context(self) -> str:
        """Build context about the user"""
        context_parts = ["# User Context"]
        
        if self.user_profile.get('name'):
            context_parts.append(f"User's name: {self.user_profile['name']}")
        
        if self.user_profile.get('financial_goals'):
            context_parts.append(f"Financial goals: {', '.join(self.user_profile['financial_goals'])}")
        
        if self.user_profile.get('risk_tolerance'):
            context_parts.append(f"Risk tolerance: {self.user_profile['risk_tolerance']}")
        
        return '\n'.join(context_parts)
    
    def _build_data_context(self) -> str:
        """Build detailed data context from insights"""
        
        summary = self.insights.get('summary', {})
        time_period = self.insights.get('time_period', {})
        categories = self.insights.get('spending_by_category', [])
        patterns = self.insights.get('spending_patterns', {})
        milestones = self.insights.get('milestones', [])
        anomalies = self.insights.get('anomalies', [])
        behavioral = self.insights.get('behavioral_insights', [])
        
        context = f"""# Financial Data Analysis

## Time Period
- Period: {time_period.get('start_date')} to {time_period.get('end_date')}
- Duration: {time_period.get('num_days')} days
- Total transactions: {time_period.get('num_transactions')}

## Financial Summary
- Total income: ${summary.get('total_income', 0):,.2f}
- Total expenses: ${summary.get('total_expenses', 0):,.2f}
- Net savings: ${summary.get('net_savings', 0):,.2f}
- Savings rate: {summary.get('savings_rate', 0):.1f}%
- Average daily spending: ${summary.get('avg_daily_spending', 0):.2f}

## Top Spending Categories
"""
        
        for i, cat in enumerate(categories[:5], 1):
            context += f"{i}. {cat['category']}: ${cat['total_spent']:,.2f} ({cat['percentage_of_total']:.1f}% of total)\n"
            context += f"   - {cat['num_transactions']} transactions, avg ${cat['avg_transaction']:.2f}\n"
        
        if patterns:
            context += f"\n## Spending Patterns\n"
            context += f"- Most active spending day: {patterns.get('most_active_day')}\n"
            context += f"- Spending frequency: {patterns.get('spending_frequency')}\n"
        
        if milestones:
            context += f"\n## Achievements & Milestones\n"
            for m in milestones:
                context += f"- {m['message']}\n"
        
        if anomalies:
            context += f"\n## Notable Transactions\n"
            for a in anomalies[:3]:
                t = a['transaction']
                context += f"- Unusually high: ${t['amount']:,.2f} on {t['date'][:10]} ({t.get('description', 'No description')})\n"
        
        if behavioral:
            context += f"\n## Behavioral Insights\n"
            for insight in behavioral:
                context += f"- {insight}\n"
        
        return context
    
    def _build_tone_guidance(self) -> str:
        """Guide the emotional tone of the response"""
        
        summary = self.insights.get('summary', {})
        savings_rate = summary.get('savings_rate', 0)
        
        if savings_rate > 20:
            tone = "celebratory and encouraging"
        elif savings_rate > 0:
            tone = "positive and supportive"
        elif savings_rate > -10:
            tone = "empathetic but constructive"
        else:
            tone = "understanding and gently motivating"
        
        return f"""# Tone Guidance
The user's savings rate is {savings_rate:.1f}%. Use a {tone} tone.
Be genuine and warm - avoid corporate speak or generic advice.
Use "you" language to make it personal.
Include specific numbers from their data to show you're paying attention."""
    
    def _build_output_structure(self) -> str:
        """Define the expected output format"""
        return """# Output Format
Generate a personalized financial report with the following sections:

1. **Opening** (2-3 sentences)
   - Personal greeting with a specific observation about their financial period
   - Set an encouraging tone

2. **Financial Snapshot** (1 paragraph)
   - Summarize their overall financial health this period
   - Highlight the most important metrics in context

3. **What's Working Well** (2-3 specific points)
   - Celebrate their wins with specific data
   - Make them feel good about positive behaviors

4. **Areas for Growth** (2-3 specific points)
   - Frame constructively, not critically
   - Connect to their financial goals if known
   - Be specific with numbers and examples

5. **Key Insight** (1 paragraph)
   - One surprising or important pattern you noticed
   - Explain why it matters to their financial future

6. **Personalized Action Steps** (2-3 concrete recommendations)
   - Specific, achievable actions based on their data
   - Explain the potential impact of each action

7. **Closing** (2-3 sentences)
   - Encouraging message
   - Forward-looking and optimistic

Make it conversational, warm, and personal. Use their actual numbers frequently."""