from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'user',
        'category',
        'initial_investment',
        'npv',
        'irr',
        'created_at',
    )
    list_filter = ('category', 'created_at', 'user')
    search_fields = ('title', 'user__username', 'category')
    ordering = ('-created_at',)