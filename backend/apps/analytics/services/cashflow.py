import pandas as pd
import numpy as np
import numpy_financial as npf


class FinancialEngine:
    """
    Pandas & NumPy powered financial calculation engine for Feasibility Studies.
    """
    def __init__(self, project):
        self.project = project
        self.duration = int(getattr(project, 'project_duration_years', 5))
        self.discount_rate = float(getattr(project, 'discount_rate', 10.0)) / 100.0
        self.tax_rate = float(getattr(project, 'tax_rate', 19.0)) / 100.0

    def get_initial_investment(self):
        """Calculates total CAPEX (Initial Investment) or reads direct field."""
        if hasattr(self.project, 'capex_items') and self.project.capex_items.exists():
            return sum(float(item.amount) for item in self.project.capex_items.all())
        return float(getattr(self.project, 'initial_investment', 0.0))

    def generate_cash_flow_table(self):
        """
        Generates year-by-year cash flow projections using Pandas DataFrame.
        """
        years = list(range(1, self.duration + 1))
        
        # Safely extract revenue and opex items if relationships exist
        revenue_items = list(self.project.revenue_streams.values()) if hasattr(self.project, 'revenue_streams') else []
        opex_items = list(self.project.opex_items.values()) if hasattr(self.project, 'opex_items') else []

        revenue_df = pd.DataFrame(revenue_items) if revenue_items else pd.DataFrame()
        opex_df = pd.DataFrame(opex_items) if opex_items else pd.DataFrame()

        records = []
        for year in years:
            # Calculate Revenue for Year
            if not revenue_df.empty and 'yearly_revenue' in revenue_df.columns:
                growth = revenue_df['growth_rate'].astype(float) / 100.0 if 'growth_rate' in revenue_df.columns else 0.0
                rev_year = (revenue_df['yearly_revenue'].astype(float) * ((1 + growth) ** (year - 1))).sum()
            else:
                # Default linear growth estimate from initial investment if no stream defined
                rev_year = float(getattr(self.project, 'initial_investment', 0.0)) * 0.35 * (1.05 ** (year - 1))

            # Calculate OPEX for Year
            if not opex_df.empty and 'yearly_cost' in opex_df.columns:
                growth = opex_df['growth_rate'].astype(float) / 100.0 if 'growth_rate' in opex_df.columns else 0.0
                opex_year = (opex_df['yearly_cost'].astype(float) * ((1 + growth) ** (year - 1))).sum()
            else:
                opex_year = rev_year * 0.40  # Estimate 40% opex ratio as default benchmark

            ebit = rev_year - opex_year
            tax = max(0.0, ebit * self.tax_rate)
            net_cash_flow = ebit - tax

            records.append({
                'year': year,
                'revenue': round(rev_year, 2),
                'opex': round(opex_year, 2),
                'ebit': round(ebit, 2),
                'tax': round(tax, 2),
                'net_cash_flow': round(net_cash_flow, 2)
            })

        return pd.DataFrame(records)

    def calculate_metrics(self):
        """
        Calculates NPV, IRR, Payback Period, and ROI using NumPy-Financial.
        """
        initial_investment = self.get_initial_investment()
        df = self.generate_cash_flow_table()

        if df.empty or initial_investment == 0:
            return {
                'initial_investment': round(initial_investment, 2),
                'npv': 0.0,
                'irr': None,
                'payback_period_years': None,
                'roi': 0.0,
                'cash_flows': []
            }

        cash_flows = df['net_cash_flow'].tolist()
        flow_series = [-initial_investment] + cash_flows

        # Financial Calculations using numpy-financial
        npv_value = npf.npv(self.discount_rate, flow_series)
        
        try:
            irr_raw = npf.irr(flow_series)
            irr_value = round(float(irr_raw) * 100, 2) if irr_raw is not None and not np.isnan(irr_raw) else None
        except Exception:
            irr_value = None

        # Payback Period Calculation (Exact with linear interpolation)
        cumulative_cf = np.cumsum(flow_series)
        payback_years = None
        for i in range(1, len(cumulative_cf)):
            if cumulative_cf[i] >= 0:
                prev_cum = cumulative_cf[i - 1]
                curr_cf = cash_flows[i - 1]
                fraction = abs(prev_cum) / curr_cf if curr_cf != 0 else 0
                payback_years = round((i - 1) + fraction, 2)
                break

        # Return on Investment (ROI)
        total_net_return = sum(cash_flows) - initial_investment
        roi = (total_net_return / initial_investment) * 100 if initial_investment > 0 else 0.0

        return {
            'initial_investment': round(initial_investment, 2),
            'npv': round(float(npv_value), 2),
            'irr': irr_value,
            'payback_period_years': payback_years,
            'roi': round(roi, 2),
            'cash_flows': df.to_dict(orient='records')
        }