from django.contrib import admin
from .models import Project

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'category', 'status', 'initial_investment', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('title', 'owner__username', 'category')