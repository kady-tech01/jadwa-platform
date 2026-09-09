import io
import pandas as pd
from .cashflow import FinancialEngine
from .sensitivity import SensitivityEngine


class ExcelExportEngine:
    """
    Generates downloadable Excel spreadsheets for project feasibility analytics.
    """
    def __init__(self, project):
        self.project = project

    def generate_excel_report(self):
        """
        Creates an in-memory Excel file (.xlsx) with Cash Flow and Sensitivity sheets.
        Returns raw bytes suitable for Django HttpResponse.
        """
        financial_engine = FinancialEngine(self.project)
        metrics = financial_engine.calculate_metrics()
        
        sensitivity_engine = SensitivityEngine(self.project)
        sensitivity = sensitivity_engine.run_sensitivity_analysis()

        output = io.BytesIO()

        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            # 1. Executive Summary Sheet
            summary_data = {
                'Metric': ['Project Title', 'Initial Investment', 'NPV', 'IRR (%)', 'Payback Period (Years)', 'ROI (%)'],
                'Value': [
                    getattr(self.project, 'title', 'N/A'),
                    metrics.get('initial_investment', 0),
                    metrics.get('npv', 0),
                    metrics.get('irr', 'N/A') if metrics.get('irr') is not None else 'N/A',
                    metrics.get('payback_period_years', 'N/A') if metrics.get('payback_period_years') is not None else 'N/A',
                    metrics.get('roi', 0)
                ]
            }
            pd.DataFrame(summary_data).to_excel(writer, sheet_name='Summary', index=False)

            # 2. Cash Flow Projections Sheet
            if metrics.get('cash_flows'):
                cf_df = pd.DataFrame(metrics['cash_flows'])
                cf_df.to_excel(writer, sheet_name='Cash Flow Projections', index=False)

            # 3. Sensitivity Analysis Sheet
            if sensitivity.get('revenue_sensitivity'):
                rev_sens = pd.DataFrame(list(sensitivity['revenue_sensitivity'].items()), columns=['Variation', 'NPV'])
                rev_sens.to_excel(writer, sheet_name='Revenue Sensitivity', index=False)

            if sensitivity.get('opex_sensitivity'):
                opex_sens = pd.DataFrame(list(sensitivity['opex_sensitivity'].items()), columns=['Variation', 'NPV'])
                opex_sens.to_excel(writer, sheet_name='OPEX Sensitivity', index=False)

        output.seek(0)
        return output.getvalue()