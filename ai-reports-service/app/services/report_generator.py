# app/services/report_generator.py

from datetime import datetime
from typing import List, Dict, Any
import google.generativeai as genai
from app.services.data_processor import FinancialDataProcessor
from app.services.prompt_builder import PromptBuilder
from app.core.config import settings


class ReportGenerator:
    """Orchestrates the entire report generation process"""
    
    def __init__(self, transactions: List[Dict], user_profile: Dict = None):
        self.transactions = transactions
        self.user_profile = user_profile or {}
    
    def generate(self) -> Dict[str, Any]:
        """Generate the complete report package"""
        
        # Step 1: Process data
        processor = FinancialDataProcessor(self.transactions, self.user_profile)
        insights = processor.process()
        
        # Step 2: Build prompt
        prompt_builder = PromptBuilder(insights, self.user_profile)
        llm_prompt = prompt_builder.build_prompt()
        
        # Step 3: Return package for LLM
        return {
            'processed_insights': insights,
            'llm_prompt': llm_prompt,
            'metadata': {
                'user_id': self.user_profile.get('user_id'),
                'generated_at': datetime.now().isoformat(),
                'num_transactions': len(self.transactions)
            }
        }
    
    def generate_with_llm(self, model_name: str = "gemini-2.5-flash"):
        """
        Generate report using Gemini LLM
        """
        
        report_package = self.generate()
        
        # Configure Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(model_name)
        
        # Call Gemini API
        response = model.generate_content(report_package['llm_prompt'])
        
        return {
            **report_package,
            'ai_report': response.text,
            'model_used': model_name
        }