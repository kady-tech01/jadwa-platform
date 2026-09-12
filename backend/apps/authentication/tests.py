from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


class AuthenticationTests(APITestCase):

    def test_user_can_register(self):

        data = {
            "username": "jadwa_user",
            "email": "user@example.com",
            "first_name": "Jadwa",
            "last_name": "User",
            "password": "StrongPassword123!",
            "password_confirm": "StrongPassword123!",
        }

        response = self.client.post(
            "/api/auth/register/",
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        user = User.objects.get(
            username="jadwa_user"
        )

        self.assertTrue(
            user.check_password(
                "StrongPassword123!"
            )
        )

    def test_password_is_not_stored_as_plain_text(self):

        user = User.objects.create_user(
            username="testuser",
            password="StrongPassword123!",
        )

        self.assertNotEqual(
            user.password,
            "StrongPassword123!",
        )

    def test_duplicate_username_is_rejected(self):

        User.objects.create_user(
            username="existing",
            password="StrongPassword123!",
        )

        data = {
            "username": "existing",
            "email": "new@example.com",
            "password": "StrongPassword123!",
            "password_confirm": "StrongPassword123!",
        }

        response = self.client.post(
            "/api/auth/register/",
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_password_confirmation_is_required(self):

        data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "StrongPassword123!",
            "password_confirm": "DifferentPassword123!",
        }

        response = self.client.post(
            "/api/auth/register/",
            data,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_profile_requires_authentication(self):

        response = self.client.get(
            "/api/auth/profile/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_access_profile(self):

        user = User.objects.create_user(
            username="profileuser",
            email="profile@example.com",
            password="StrongPassword123!",
        )

        self.client.force_authenticate(
            user=user
        )

        response = self.client.get(
            "/api/auth/profile/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["username"],
            "profileuser",
        )

    def test_user_can_update_profile(self):

        user = User.objects.create_user(
            username="updateuser",
            email="old@example.com",
            password="StrongPassword123!",
        )

        self.client.force_authenticate(
            user=user
        )

        response = self.client.patch(
            "/api/auth/profile/",
            {
                "first_name": "Updated",
                "last_name": "User",
                "email": "new@example.com",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        user.refresh_from_db()

        self.assertEqual(
            user.first_name,
            "Updated",
        )

        self.assertEqual(
            user.email,
            "new@example.com",
        )