from django.db import models
from django.conf import settings

class Project(models.Model):
    STATUS_CHOICES = [
        ('Draft', 'Draft'),
        ('In Review', 'In Review'),
        ('Approved', 'Approved'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='projects',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='General Feasibility')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Draft')
    initial_investment = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    
    # Pre-calculated financial metrics stored directly or populated by evaluation
    npv = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    irr = models.FloatField(null=True, blank=True, help_text="Percentage value, e.g., 14.5 for 14.5%")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title