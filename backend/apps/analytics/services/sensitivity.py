import numpy_financial as npf
from .cashflow import FinancialEngine


class SensitivityEngine:
    """
    Evaluates scenario stress tests (variations in Revenue or OPEX).
    """
    def __init__(self, project):
        self.project = project

    def run_sensitivity_analysis(self):
        engine = FinancialEngine(self.project)
        base_df = engine.generate_cash_flow_table()
        initial_inv = engine.get_initial_investment()
        discount_rate = engine.discount_rate

        if base_df.empty or initial_inv == 0:
            return {
                'revenue_sensitivity': {},
                'opex_sensitivity': {}
            }

        variations = [-0.20, -0.10, 0.0, 0.10, 0.20]
        results = {
            'revenue_sensitivity': {},
            'opex_sensitivity': {}
        }

        # Revenue Sensitivity Analysis
        for var in variations:
            varied_cf = []
            for _, row in base_df.iterrows():
                rev_adjusted = row['revenue'] * (1 + var)
                ebit_adj = rev_adjusted - row['opex']
                tax_adj = max(0.0, ebit_adj * engine.tax_rate)
                varied_cf.append(ebit_adj - tax_adj)

            npv_val = npf.npv(discount_rate, [-initial_inv] + varied_cf)
            results['revenue_sensitivity'][f"{int(var * 100):+d}%"] = round(float(npv_val), 2)

        # OPEX Sensitivity Analysis
        for var in variations:
            varied_cf = []
            for _, row in base_df.iterrows():
                opex_adjusted = row['opex'] * (1 + var)
                ebit_adj = row['revenue'] - opex_adjusted
                tax_adj = max(0.0, ebit_adj * engine.tax_rate)
                varied_cf.append(ebit_adj - tax_adj)

            npv_val = npf.npv(discount_rate, [-initial_inv] + varied_cf)
            results['opex_sensitivity'][f"{int(var * 100):+d}%"] = round(float(npv_val), 2)

        return results