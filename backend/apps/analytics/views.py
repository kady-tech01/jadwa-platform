from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.projects.models import Project
from .services.cashflow import FinancialEngine
from .services.sensitivity import SensitivityEngine
from .services.export import ExcelExportEngine


class ProjectAnalyticsView(APIView):
    """
    API endpoint returning comprehensive Pandas/NumPy financial analytics for a project.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)

        financial_engine = FinancialEngine(project)
        sensitivity_engine = SensitivityEngine(project)

        metrics = financial_engine.calculate_metrics()
        sensitivity = sensitivity_engine.run_sensitivity_analysis()

        return Response({
            'project_id': project.id,
            'project_title': project.title,
            'currency': getattr(project, 'currency', 'DZD'),
            'financial_metrics': metrics,
            'sensitivity_analysis': sensitivity
        }, status=status.HTTP_200_OK)


class ProjectAnalyticsExportView(APIView):
    """
    API endpoint to export financial feasibility reports as an Excel (.xlsx) file.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({"error": "Project not found"}, status=status.HTTP_404_NOT_FOUND)

        exporter = ExcelExportEngine(project)
        excel_buffer = exporter.generate_excel_report()

        filename = f"feasibility_study_{project.id}.xlsx"
        response = HttpResponse(
            excel_buffer,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response