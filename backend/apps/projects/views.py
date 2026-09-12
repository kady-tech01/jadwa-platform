from django.db.models import Prefetch

from rest_framework import permissions, viewsets

from .models import (
    Project,
    CapexItem,
    OpexItem,
    RevenueStream,
)

from .serializers import (
    ProjectSerializer,
    CapexItemSerializer,
    OpexItemSerializer,
    RevenueStreamSerializer,
)


class ProjectViewSet(viewsets.ModelViewSet):

    serializer_class = ProjectSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):

        return (
            Project.objects
            .filter(user=self.request.user)
            .prefetch_related(
                "capex_items",
                "opex_items",
                "revenue_streams",
            )
        )

    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )


class CapexItemViewSet(viewsets.ModelViewSet):

    serializer_class = CapexItemSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):

        return CapexItem.objects.filter(
            project__user=self.request.user
        )

    def perform_create(self, serializer):

        project_id = self.request.data.get(
            "project"
        )

        if not project_id:
            raise ValueError(
                "Project is required."
            )

        project = Project.objects.filter(
            id=project_id,
            user=self.request.user
        ).first()

        if not project:
            from rest_framework.exceptions import (
                PermissionDenied
            )

            raise PermissionDenied(
                "You do not have access to this project."
            )

        serializer.save(
            project=project
        )


class OpexItemViewSet(viewsets.ModelViewSet):

    serializer_class = OpexItemSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):

        return OpexItem.objects.filter(
            project__user=self.request.user
        )

    def perform_create(self, serializer):

        project_id = self.request.data.get(
            "project"
        )

        if not project_id:
            raise ValueError(
                "Project is required."
            )

        project = Project.objects.filter(
            id=project_id,
            user=self.request.user
        ).first()

        if not project:
            from rest_framework.exceptions import (
                PermissionDenied
            )

            raise PermissionDenied(
                "You do not have access to this project."
            )

        serializer.save(
            project=project
        )


class RevenueStreamViewSet(viewsets.ModelViewSet):

    serializer_class = RevenueStreamSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):

        return RevenueStream.objects.filter(
            project__user=self.request.user
        )

    def perform_create(self, serializer):

        project_id = self.request.data.get(
            "project"
        )

        if not project_id:
            raise ValueError(
                "Project is required."
            )

        project = Project.objects.filter(
            id=project_id,
            user=self.request.user
        ).first()

        if not project:
            from rest_framework.exceptions import (
                PermissionDenied
            )

            raise PermissionDenied(
                "You do not have access to this project."
            )

        serializer.save(
            project=project
        )