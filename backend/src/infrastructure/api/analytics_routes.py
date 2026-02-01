from fastapi import APIRouter, Depends, Query
from typing import Annotated, Optional
from datetime import datetime, timedelta
from src.application.analytics_service import AnalyticsService
from src.infrastructure.repositories.postgres_analytics_repository import PostgresAnalyticsRepository
from src.infrastructure.api.dependencies import get_db
from src.domain.analytics_schemas import AnalyticsSummary, PriceVariationResponse
from sqlalchemy.orm import Session
from src.infrastructure.api.security import get_api_key

router = APIRouter(
    tags=["Analytics"],
    dependencies=[Depends(get_api_key)]
)

def get_analytics_service(db: Session = Depends(get_db)) -> AnalyticsService:
    repo = PostgresAnalyticsRepository(db)
    return AnalyticsService(repo)

@router.get("/dashboard", response_model=AnalyticsSummary)
def get_dashboard_metrics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    product_id: Optional[str] = None,
    service: Annotated[AnalyticsService, Depends(get_analytics_service)] = None
):
    if not end_date:
        end_date = datetime.now()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    # Ensure end_date covers the full day (23:59:59) when only a date is provided
    if end_date.hour == 0 and end_date.minute == 0 and end_date.second == 0:
        end_date = end_date.replace(hour=23, minute=59, second=59)

    return service.get_dashboard_summary(start_date, end_date, product_id=product_id)

@router.get("/price-variation", response_model=PriceVariationResponse)
def get_price_variation(
    year: Optional[int] = None,
    month: Optional[int] = None,
    product_id: Optional[str] = None,
    service: Annotated[AnalyticsService, Depends(get_analytics_service)] = None
):
    now = datetime.now()
    if not year:
        year = now.year
    if not month:
        month = now.month

    return service.get_price_variation(year, month, product_id=product_id)
