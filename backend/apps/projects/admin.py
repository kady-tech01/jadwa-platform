from django.contrib import admin

from .models import (
    Project,
    CapexItem,
    OpexItem,
    RevenueStream,
)


class CapexItemInline(admin.TabularInline):
    model = CapexItem
    extra = 0


class OpexItemInline(admin.TabularInline):
    model = OpexItem
    extra = 0


class RevenueStreamInline(admin.TabularInline):
    model = RevenueStream
    extra = 0


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "user",
        "category",
        "status",
        "currency",
        "initial_investment",
        "created_at",
    )

    list_filter = (
        "status",
        "category",
        "currency",
        "created_at",
    )

    search_fields = (
        "title",
        "user__username",
        "category",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    inlines = [
        CapexItemInline,
        OpexItemInline,
        RevenueStreamInline,
    ]


@admin.register(CapexItem)
class CapexItemAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "project",
        "amount",
        "year",
    )

    list_filter = (
        "year",
    )

    search_fields = (
        "name",
        "project__title",
    )


@admin.register(OpexItem)
class OpexItemAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "project",
        "annual_amount",
        "growth_rate",
    )

    search_fields = (
        "name",
        "project__title",
    )


@admin.register(RevenueStream)
class RevenueStreamAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "project",
        "annual_amount",
        "growth_rate",
    )

    search_fields = (
        "name",
        "project__title",
    )