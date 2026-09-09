from django.urls import path
from .views import ProjectAnalyticsView, ProjectAnalyticsExportView

urlpatterns = [
    path('projects/<int:project_id>/analytics/', ProjectAnalyticsView.as_view(), name='project-analytics'),
    path('projects/<int:project_id>/analytics/export/', ProjectAnalyticsExportView.as_view(), name='project-analytics-export'),
]