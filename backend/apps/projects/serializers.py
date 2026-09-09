from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    # Mapping snake_case DB fields to match potential camelCase expectations cleanly
    initialInvestment = serializers.DecimalField(
        source='initial_investment', 
        max_digits=15, 
        decimal_places=2, 
        required=False
    )
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 
            'title', 
            'category', 
            'status', 
            'initial_investment', 
            'initialInvestment',
            'npv', 
            'irr', 
            'created_at',
            'createdAt'
        ]

    def create(self, validated_data):
        # Automatically attach request user if authenticated
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)