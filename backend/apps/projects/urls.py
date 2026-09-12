from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ProjectViewSet,
    CapexItemViewSet,
    OpexItemViewSet,
    RevenueStreamViewSet,
)


router = DefaultRouter()

router.register(
    r"",
    ProjectViewSet,
    basename="project"
)

router.register(
    r"capex",
    CapexItemViewSet,
    basename="capex"
)

router.register(
    r"opex",
    OpexItemViewSet,
    basename="opex"
)

router.register(
    r"revenues",
    RevenueStreamViewSet,
    basename="revenue"
)


urlpatterns = [
    path(
        "",
        include(router.urls)
    ),
]