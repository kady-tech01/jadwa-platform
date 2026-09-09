from rest_framework import serializers
from .models import ProjectAnalytics
from apps.projects.serializers import ProjectSerializer
from apps.projects.models import Project

class ProjectAnalyticsSerializer(serializers.ModelSerializer):
    project_details = ProjectSerializer(source='project', read_only=True)

    class Meta:
        model = ProjectAnalytics
        fields = [
            'id', 
            'project', 
            'project_details', 
            'payback_period_years', 
            'profitability_index', 
            'risk_score', 
            'last_computed'
        ]