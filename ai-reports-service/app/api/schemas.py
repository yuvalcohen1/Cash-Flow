from pydantic import BaseModel
from typing import Optional


class ReportRequest(BaseModel):
    """Request model for generating report"""
    start_date: Optional[str] = None  # Optional date filter YYYY-MM-DD
    end_date: Optional[str] = None    # Optional date filter YYYY-MM-DD


class ReportResponse(BaseModel):
    """Response model for generated report"""
    ai_report: str
    processed_insights: dict
    metadata: dict
    model_used: str
    report_id: Optional[int] = None


class InsightsResponse(BaseModel):
    """Response model for insights only"""
    processed_insights: dict
    metadata: dict