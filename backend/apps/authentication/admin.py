from django.contrib import admin
from django.contrib.auth import get_user_model


User = get_user_model()

admin.site.unregister(User)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "is_active",
        "date_joined",
    )

    list_filter = (
        "is_active",
        "is_staff",
        "date_joined",
    )

    search_fields = (
        "username",
        "email",
        "first_name",
        "last_name",
    )

    ordering = (
        "-date_joined",
    )

    readonly_fields = (
        "date_joined",
        "last_login",
    )