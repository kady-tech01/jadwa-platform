from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'user',
        'category',
        'currency',
        'initial_investment',
        'annual_revenue',
        'annual_opex',
        'npv',
        'irr',
        'created_at',
    )
    list_filter = ('category', 'created_at', 'user', 'status')
    search_fields = ('title', 'user__username', 'category')
    ordering = ('-created_at',)