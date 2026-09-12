from django.conf import settings
from django.db import models


class Project(models.Model):

    class Status(models.TextChoices):
        DRAFT = "Draft", "Draft"
        IN_PROGRESS = "In Progress", "In Progress"
        COMPLETED = "Completed", "Completed"

    class Currency(models.TextChoices):
        DZD = "DZD", "Algerian Dinar"
        USD = "USD", "US Dollar"
        EUR = "EUR", "Euro"
        GBP = "GBP", "British Pound"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects",
    )

    title = models.CharField(
        max_length=255
    )

    category = models.CharField(
        max_length=100,
        default="Technology"
    )

    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    currency = models.CharField(
        max_length=10,
        choices=Currency.choices,
        default=Currency.DZD,
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    # Financial assumptions

    project_duration_years = models.PositiveIntegerField(
        default=5
    )

    discount_rate = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=10.00,
        help_text="Discount rate in percentage.",
    )

    tax_rate = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=19.00,
        help_text="Tax rate in percentage.",
    )

    initial_investment = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0.00,
    )

    annual_revenue = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0.00,
    )

    annual_opex = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0.00,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class CapexItem(models.Model):
    """
    Capital expenditure item belonging to a project.
    """

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="capex_items",
    )

    name = models.CharField(
        max_length=255
    )

    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0.00,
    )

    year = models.PositiveIntegerField(
        default=0,
        help_text="0 means initial investment.",
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["year", "id"]

    def __str__(self):
        return f"{self.name} - {self.amount}"


class OpexItem(models.Model):
    """
    Operating expense item belonging to a project.
    """

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="opex_items",
    )

    name = models.CharField(
        max_length=255
    )

    annual_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0.00,
    )

    growth_rate = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0.00,
        help_text="Annual growth rate in percentage.",
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.name} - {self.annual_amount}"


class RevenueStream(models.Model):
    """
    Revenue source belonging to a project.
    """

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="revenue_streams",
    )

    name = models.CharField(
        max_length=255
    )

    annual_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0.00,
    )

    growth_rate = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0.00,
        help_text="Annual growth rate in percentage.",
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.name} - {self.annual_amount}"