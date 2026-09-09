from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Project
        fields = [
            'id',
            'user',
            'title',
            'category',
            'status',
            'currency',
            'initial_investment',
            'annual_revenue',
            'annual_opex',
            'npv',
            'irr',
            'payback_period',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']