from fastapi import APIRouter, HTTPException, Depends, Query
from app.api.schemas import ReportRequest, ReportResponse, InsightsResponse
from app.services.report_generator import ReportGenerator
from app.core.auth import get_current_user_id
from app.core.database import db

router = APIRouter()

@router.post("/generate", response_model=ReportResponse)
async def generate_report(
    request: ReportRequest,
    user_id: str = Depends(get_current_user_id)
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

        # Save report to database
        report_id = db.save_report(
            user_id=user_id,
            report_text=result['ai_report'],
            processed_insights=result['processed_insights'],
            start_date=request.start_date,
            end_date=request.end_date,
            model_used=result['model_used']
        )
        
        # Add report_id to response
        result['report_id'] = report_id
        
        return ReportResponse(**result)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error generating report: {str(e)}"
        )

@router.get("/history")
async def get_report_history(
    user_id: str = Depends(get_current_user_id),
    limit: int = Query(default=10, ge=1, le=50),
    offset: int = Query(default=0, ge=0)
):
    """
    Get user's report history
    Protected endpoint - requires valid JWT token
    """
    try:
        reports = db.get_user_reports(user_id, limit, offset)
        
        return {
            "reports": reports,
            "count": len(reports)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching report history: {str(e)}"
        )


@router.get("/history/{report_id}")
async def get_report_by_id(report_id: int, user_id: str = Depends(get_current_user_id),):
    """
    Get a specific report by ID
    Protected endpoint - requires valid JWT token
    """
    try:
        report = db.get_report_by_id(user_id, report_id)
        
        if not report:
            raise HTTPException(
                status_code=404,
                detail="Report not found"
            )
        
        return report
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching report: {str(e)}"
        )


@router.delete("/history/{report_id}")
async def delete_report(report_id: int, user_id: str = Depends(get_current_user_id),):
    """
    Delete a report by ID
    Protected endpoint - requires valid JWT token
    """
    try:
        deleted = db.delete_report(user_id, report_id)
        
        if not deleted:
            raise HTTPException(
                status_code=404,
                detail="Report not found"
            )
        
        return {"message": "Report deleted successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting report: {str(e)}"
        )



@router.post("/insights", response_model=InsightsResponse)
async def generate_insights(
    request: ReportRequest,
    user_id: str = Depends(get_current_user_id)
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