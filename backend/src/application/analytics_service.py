from datetime import datetime
from typing import Optional
from src.infrastructure.repositories.postgres_analytics_repository import PostgresAnalyticsRepository
from src.domain.analytics_schemas import AnalyticsSummary, PriceVariationResponse

class AnalyticsService:
    def __init__(self, repo: PostgresAnalyticsRepository):
        self.repo = repo

    def get_dashboard_summary(self, start_date: datetime, end_date: datetime, product_id: Optional[str] = None) -> AnalyticsSummary:
        data = self.repo.get_analytics_data(start_date, end_date, product_id=product_id)
        return AnalyticsSummary(**data)

    def get_price_variation(self, year: int, month: int, product_id: Optional[str] = None) -> PriceVariationResponse:
        data = self.repo.get_price_variation(year, month, product_id=product_id)
        return PriceVariationResponse(**data)
