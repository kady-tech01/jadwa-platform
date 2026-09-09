from rest_framework import viewsets, permissions
from .models import Transaction
from .serializers import TransactionSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.all()
        project_id = self.request.query_params.get('project')
        
        # Filter transactions specifically by the project query parameter
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        return queryset