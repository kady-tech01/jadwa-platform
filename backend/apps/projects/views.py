from rest_framework import viewsets, permissions
from .models import Project
from .serializers import ProjectSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]  # Adjust to IsAuthenticated for production auth

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return Project.objects.filter(user=user)
        return Project.objects.all()