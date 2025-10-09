# app/api/routes/reports.py

from fastapi import APIRouter, HTTPException, Depends
from app.api.schemas import ReportRequest, ReportResponse, InsightsResponse
from app.services.report_generator import ReportGenerator
from app.core.auth import get_current_user_id
from app.core.database import db

router = APIRouter()


@router.get("/debug-auth")
async def debug_auth(user_id: int = Depends(get_current_user_id)):
    """
    Debug endpoint to verify JWT authentication is working
    Returns the extracted user_id
    """
    return {
        "message": "Authentication successful",
        "user_id": user_id,
        "user_id_type": str(type(user_id))
    }


@router.post("/generate", response_model=ReportResponse)
async def generate_report(
    request: ReportRequest,
    user_id: int = Depends(get_current_user_id)
):
    """
    Generate a personalized financial report from user's transaction data
    Protected endpoint - requires valid JWT token
    """
    try:
        # Fetch transactions from database
        transactions = db.get_transactions_by_user(
            user_id=user_id,
            start_date=request.start_date,
            end_date=request.end_date
        )
        
        if not transactions:
            raise HTTPException(
                status_code=404, 
                detail="No transactions found for this user"
            )
        
        # Fetch user profile
        # user_profile = db.get_user_profile(user_id)
        user_profile = {"user_id": user_id}
        
        # Generate report
        generator = ReportGenerator(transactions, user_profile)
        result = generator.generate_with_llm()
        
        return ReportResponse(**result)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating report: {str(e)}"
        )


@router.post("/insights", response_model=InsightsResponse)
async def generate_insights(
    request: ReportRequest,
    user_id: int = Depends(get_current_user_id)
):
    """
    Generate only the processed insights without LLM generation
    Protected endpoint - requires valid JWT token
    """
    try:
        # Fetch transactions from database
        transactions = db.get_transactions_by_user(
            user_id=user_id,
            start_date=request.start_date,
            end_date=request.end_date
        )
        
        if not transactions:
            raise HTTPException(
                status_code=404, 
                detail="No transactions found for this user"
            )
        
        # Fetch user profile
        # user_profile = db.get_user_profile(user_id)
        user_profile = {"user_id": user_id}
        
        # Generate insights
        generator = ReportGenerator(transactions, user_profile)
        result = generator.generate()
        
        return InsightsResponse(
            processed_insights=result['processed_insights'],
            metadata=result['metadata']
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating insights: {str(e)}"
        )