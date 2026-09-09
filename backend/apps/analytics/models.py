from django.db import models
from apps.projects.models import Project

class ProjectAnalytics(models.Model):
    project = models.OneToOneField(
        Project, 
        on_delete=models.CASCADE, 
        related_name='analytics'
    )
    payback_period_years = models.FloatField(null=True, blank=True)
    profitability_index = models.FloatField(null=True, blank=True)
    risk_score = models.CharField(max_length=50, default='Medium')
    last_computed = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Analytics for {self.project.title}"