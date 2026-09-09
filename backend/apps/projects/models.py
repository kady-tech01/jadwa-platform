from django.db import models
from django.conf import settings


class Project(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='Technology')
    status = models.CharField(max_length=50, default='Draft')
    currency = models.CharField(max_length=10, default='USD')
    
    initial_investment = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    annual_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    annual_opex = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    
    npv = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    irr = models.DecimalField(max_digits=7, decimal_places=2, default=0.00)
    payback_period = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.user.username})"