from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, Avg, Count
from apps.projects.models import Project
from .models import ProjectAnalytics
from .serializers import ProjectAnalyticsSerializer

class AnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ProjectAnalytics.objects.all()
    serializer_class = ProjectAnalyticsSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Aggregated KPI metrics for the portfolio overview dashboard."""
        projects = Project.objects.all()
        if request.user.is_authenticated:
            projects = projects.filter(user=request.user)

        total_projects = projects.count()
        total_capex = projects.aggregate(Sum('initial_investment'))['initial_investment__sum'] or 0
        total_npv = projects.aggregate(Sum('npv'))['npv__sum'] or 0
        avg_irr = projects.aggregate(Avg('irr'))['irr__avg'] or 0

        return Response({
            'total_projects': total_projects,
            'total_investment': float(total_capex),
            'total_npv': float(total_npv),
            'average_irr': round(float(avg_irr), 2) if avg_irr else 0.0,
        })