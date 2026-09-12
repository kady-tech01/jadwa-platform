from rest_framework import serializers

from .models import (
    Project,
    CapexItem,
    OpexItem,
    RevenueStream,
)


class CapexItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = CapexItem
        fields = [
            "id",
            "name",
            "amount",
            "year",
            "description",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]


class OpexItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = OpexItem
        fields = [
            "id",
            "name",
            "annual_amount",
            "growth_rate",
            "description",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]


class RevenueStreamSerializer(serializers.ModelSerializer):

    class Meta:
        model = RevenueStream
        fields = [
            "id",
            "name",
            "annual_amount",
            "growth_rate",
            "description",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]


class ProjectSerializer(serializers.ModelSerializer):

    user = serializers.ReadOnlyField(
        source="user.username"
    )

    capex_items = CapexItemSerializer(
        many=True,
        required=False
    )

    opex_items = OpexItemSerializer(
        many=True,
        required=False
    )

    revenue_streams = RevenueStreamSerializer(
        many=True,
        required=False
    )

    class Meta:
        model = Project

        fields = [
            "id",
            "user",
            "title",
            "category",
            "status",
            "currency",
            "description",

            "project_duration_years",
            "discount_rate",
            "tax_rate",

            "initial_investment",
            "annual_revenue",
            "annual_opex",

            "capex_items",
            "opex_items",
            "revenue_streams",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "created_at",
            "updated_at",
        ]

    def validate_project_duration_years(self, value):
        if value < 1:
            raise serializers.ValidationError(
                "Project duration must be at least 1 year."
            )

        if value > 50:
            raise serializers.ValidationError(
                "Project duration cannot exceed 50 years."
            )

        return value

    def validate_discount_rate(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Discount rate must be between 0 and 100."
            )

        return value

    def validate_tax_rate(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Tax rate must be between 0 and 100."
            )

        return value

    def create(self, validated_data):

        capex_data = validated_data.pop(
            "capex_items",
            []
        )

        opex_data = validated_data.pop(
            "opex_items",
            []
        )

        revenue_data = validated_data.pop(
            "revenue_streams",
            []
        )

        project = Project.objects.create(
            user=self.context["request"].user,
            **validated_data
        )

        CapexItem.objects.bulk_create([
            CapexItem(
                project=project,
                **item
            )
            for item in capex_data
        ])

        OpexItem.objects.bulk_create([
            OpexItem(
                project=project,
                **item
            )
            for item in opex_data
        ])

        RevenueStream.objects.bulk_create([
            RevenueStream(
                project=project,
                **item
            )
            for item in revenue_data
        ])

        return project

    def update(self, instance, validated_data):

        capex_data = validated_data.pop(
            "capex_items",
            None
        )

        opex_data = validated_data.pop(
            "opex_items",
            None
        )

        revenue_data = validated_data.pop(
            "revenue_streams",
            None
        )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if capex_data is not None:
            instance.capex_items.all().delete()

            CapexItem.objects.bulk_create([
                CapexItem(
                    project=instance,
                    **item
                )
                for item in capex_data
            ])

        if opex_data is not None:
            instance.opex_items.all().delete()

            OpexItem.objects.bulk_create([
                OpexItem(
                    project=instance,
                    **item
                )
                for item in opex_data
            ])

        if revenue_data is not None:
            instance.revenue_streams.all().delete()

            RevenueStream.objects.bulk_create([
                RevenueStream(
                    project=instance,
                    **item
                )
                for item in revenue_data
            ])

        return instance