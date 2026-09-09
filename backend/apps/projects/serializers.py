from rest_framework import serializers
from .models import Project

class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    initialInvestment = serializers.DecimalField(
        source='initial_investment', 
        max_digits=15, 
        decimal_places=2, 
        required=False
    )
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    # Financial indicators calculated on the fly or stored
    npv = serializers.SerializerMethodField()
    irr = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            'id', 
            'owner', 
            'title', 
            'category', 
            'status', 
            'initial_investment', 
            'initialInvestment',
            'discount_rate', 
            'npv', 
            'irr', 
            'created_at', 
            'createdAt'
        ]

    def get_npv(self, obj):
        # Placeholder or link to your actual cash flow calculation logic
        # Negative NPV for demo / calculation step if needed
        return 0.00

    def get_irr(self, obj):
        return "N/A"