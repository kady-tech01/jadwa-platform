from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from .models import Project, CapexItem, OpexItem, RevenueStream


User = get_user_model()


class ProjectAPITests(APITestCase):

    def setUp(self):

        self.user1 = User.objects.create_user(
            username="user1",
            password="TestPassword123"
        )

        self.user2 = User.objects.create_user(
            username="user2",
            password="TestPassword123"
        )

        self.project1 = Project.objects.create(
            user=self.user1,
            title="Project One",
            category="Technology",
            currency="DZD",
            initial_investment=100000,
            annual_revenue=50000,
            annual_opex=20000,
        )

        self.project2 = Project.objects.create(
            user=self.user2,
            title="Project Two",
            category="Retail",
            currency="DZD",
            initial_investment=200000,
            annual_revenue=80000,
            annual_opex=30000,
        )

    def test_user_can_see_only_own_projects(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            reverse("project-list")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            len(response.data),
            1
        )

        self.assertEqual(
            response.data[0]["title"],
            "Project One"
        )

    def test_user_cannot_access_other_user_project(self):

        self.client.force_authenticate(
            user=self.user1
        )

        response = self.client.get(
            reverse(
                "project-detail",
                kwargs={"pk": self.project2.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )

    def test_user_can_create_project(self):

        self.client.force_authenticate(
            user=self.user1
        )

        data = {
            "title": "New Project",
            "category": "Technology",
            "currency": "DZD",
            "project_duration_years": 5,
            "discount_rate": 10,
            "tax_rate": 19,
            "initial_investment": 500000,
            "annual_revenue": 200000,
            "annual_opex": 80000,
            "description": "Test project",
        }

        response = self.client.post(
            reverse("project-list"),
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        project = Project.objects.get(
            title="New Project"
        )

        self.assertEqual(
            project.user,
            self.user1
        )

    def test_project_items_belong_to_project(self):

        capex = CapexItem.objects.create(
            project=self.project1,
            name="Equipment",
            amount=100000,
            year=0,
        )

        opex = OpexItem.objects.create(
            project=self.project1,
            name="Rent",
            annual_amount=50000,
        )

        revenue = RevenueStream.objects.create(
            project=self.project1,
            name="Product Sales",
            annual_amount=200000,
        )

        self.assertEqual(
            capex.project,
            self.project1
        )

        self.assertEqual(
            opex.project,
            self.project1
        )

        self.assertEqual(
            revenue.project,
            self.project1
        )