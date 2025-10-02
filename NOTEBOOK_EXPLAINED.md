# Multi-Asset Hedging Notebook - Comprehensive Explanation

## 1. Where is the Data?

### Current Data Sources (in the notebook):
The notebook uses **sample/synthetic data** for demonstration purposes:

- **Portfolio Data** (Cell 16): Hardcoded sample portfolio for a $25B pension fund
  - Asset allocation percentages
  - Currency exposures
  - Duration metrics
  - Credit quality breakdowns

- **Liability Structure** (Cell 16): Hardcoded pension liability data
  - Total liabilities: $28.4B
  - Duration: 15.2 years
  - Currency distribution

- **Volatility Scenarios** (Cell 8): **Generated synthetically** using statistical distributions
  - FX volatility: randomly sampled between 5-35% annualized
  - Interest rate volatility: 60-180 bps
  - Credit volatility: 15-75% of spread
  - Correlation regimes: sampled probabilistically

### Potential Real-World Data Sources:

#### Portfolio Data Sources:
1. **Internal Portfolio Management Systems**
   - Bloomberg AIM (Asset and Investment Manager)
   - BlackRock Aladdin
   - SimCorp Dimension
   - Charles River IMS
   - Export portfolio holdings to JSON/CSV → upload to S3 → read into notebook

2. **Custodian Banks**
   - State Street
   - BNY Mellon
   - Northern Trust
   - API integrations or file feeds with positions, market values, exposures

3. **Direct Data Files**
   - Upload CSV/Excel files to S3 with columns:
     - Instrument ID, Asset Class, Notional, Currency, Maturity, Rating, etc.
   - Read from S3 into pandas DataFrame

#### Market Data Sources:
1. **Volatility Surfaces & Market Data**
   - **Bloomberg API**: Real-time FX vols, swaption vols, credit spreads
   - **Refinitiv (Reuters)**: Market data feeds
   - **CME/ICE**: Exchange-traded derivatives data
   - **Markit**: Credit default swap data
   - Integration: API → Lambda → store in S3 → read into notebook

2. **Historical Data for Scenario Generation**
   - Download historical volatility time series
   - Use actual crisis periods (2008, 2020, 2022) to calibrate scenarios
   - Store in S3 as time series data

3. **Numerix Data**
   - **Numerix SDK** can generate scenarios based on:
     - Historical calibration
     - Stochastic models (Heston, SABR for volatility)
     - Economic scenario generators
   - This would replace the synthetic scenario generation in Cell 8

#### Example Data Integration Pattern:
```python
# Instead of hardcoded portfolio, read from S3:
portfolio_s3_key = "portfolios/pension_fund_holdings_20241002.json"
response = s3_client.get_object(Bucket=bucket, Key=portfolio_s3_key)
portfolio_data = json.loads(response['Body'].read())

# Or from Bloomberg API:
import blpapi
# ... connect to Bloomberg and fetch portfolio positions
# ... fetch current market data (FX rates, yield curves, credit spreads)
```

---

## 2. How Are Instruments Defined?

### Current State:
Instruments are **referenced conceptually** but not explicitly defined in the notebook. The original demo document (04-Oct22Demo.md) mentions hedge instruments in detail, but the notebook uses **placeholders**.

### Where Instruments Are Referenced:

#### In the Original Demo (lines 314-320, 428-434, 537-542):
```python
"hedge_instruments": [
    {"type": "forward", "max_tenor": 365, "liquidity": "high"},
    {"type": "vanilla_option", "styles": ["call", "put"], "max_tenor": 180},
    {"type": "risk_reversal", "max_tenor": 180},
    {"type": "seagull", "max_tenor": 180},
    {"type": "currency_swap", "min_tenor": 180, "max_tenor": 1095}
]
```

#### In the Notebook (Cell 12 - Action Group Schema):
The Numerix Analytics API includes endpoints like:
- `/generate_hedging_strategies` - expects `hedge_instruments` parameter
- `/evaluate_hedge_effectiveness` - expects `hedging_strategy` parameter
- `/calculate_hedging_costs` - expects `hedging_strategy` parameter

### How Instruments SHOULD Be Defined:

#### Option 1: Static Instrument Library
```python
HEDGE_INSTRUMENTS_LIBRARY = {
    "fx_hedging": [
        {
            "instrument_type": "fx_forward",
            "currency_pair": "EURUSD",
            "tenors": [30, 60, 90, 180, 360],
            "liquidity": "high",
            "pricing_source": "bloomberg_bgn"
        },
        {
            "instrument_type": "fx_vanilla_call",
            "currency_pair": "GBPUSD",
            "strike_types": ["atm", "25_delta", "10_delta"],
            "tenors": [30, 60, 90, 180],
            "pricing_model": "black_scholes"
        }
    ],
    "interest_rate_hedging": [
        {
            "instrument_type": "interest_rate_swap",
            "currency": "USD",
            "fixed_payer": True,
            "tenors": [2, 3, 5, 7, 10, 20, 30],
            "pricing_model": "multi_curve_bootstrap"
        },
        {
            "instrument_type": "swaption",
            "option_type": "payer",
            "expiries": [1, 2, 3, 5],
            "swap_tenors": [5, 10, 20],
            "pricing_model": "sabr"
        }
    ]
}
```

#### Option 2: Numerix SDK Instrument Definitions
```python
# Using Numerix SDK to define instruments
import numerix_sdk as nx

# Define FX forward hedge
fx_forward = nx.Instrument(
    instrument_type="FXForward",
    currency_pair="EURUSD",
    notional=3200000000,  # €3.2B exposure
    maturity_date="2025-04-02",
    forward_rate=1.0850,
    settlement_type="physical"
)

# Define interest rate swap
ir_swap = nx.Instrument(
    instrument_type="InterestRateSwap",
    currency="USD",
    notional=10000000000,  # $10B
    fixed_rate=0.0425,
    floating_index="USD-LIBOR-3M",
    maturity_years=10,
    pay_fixed=True,
    swap_type="vanilla"
)

# Price with Numerix
hedge_value = nx.price_instrument(ir_swap, market_data=current_market_data)
greeks = nx.calculate_greeks(ir_swap, market_data=current_market_data)
```

#### Option 3: Dynamic from Market Data
```python
# Query available instruments from market data provider
available_swaps = bloomberg_api.get_available_swaps(currency="USD")
# Returns list of tradable swap tenors, current mid-market rates, liquidity indicators

# Agents select from available universe based on:
# - Liquidity (bid-ask spread)
# - Tenor match to liability duration
# - Cost efficiency
```

---

## 3. Customer Goals - Where Are They?

### ✅ Customer Goals ARE Defined - Here's Where:

#### Primary Location: Cell 16 - `risk_objectives` dictionary
```python
risk_objectives = {
    "primary_objectives": {
        "maintain_funding_ratio_above": 0.85,      # Keep pension funded >85%
        "limit_annual_volatility_below": 0.08,     # Max 8% annual volatility
        "reduce_tail_risk_by": 0.35                # Cut tail losses by 35%
    },
    "cost_constraints": {
        "maximum_annual_hedging_cost_bps": 25,     # Max 25 bps annual cost
        "prefer_capital_efficient_structures": True
    },
    "scenario_robustness": {
        "evaluate_across_all_scenarios": True,
        "minimize_worst_case_outcome": True,
        "target_robust_efficiency": 0.80           # 80% effectiveness maintained
    }
}
```

#### How Goals Flow Through the System:

1. **Input to Agents** (Cell 14 - `execute_hedging_orchestration` method):
   ```python
   context = f"""
   Risk Objectives:
   {json.dumps(risk_objectives, indent=2)}

   INSTRUCTIONS:
   1. Portfolio Risk Manager: Analyze exposures across scenarios
   2. Currency Specialist: Develop FX hedging maintaining 85%+ effectiveness
   3. Interest Rate Strategist: Design IR hedging maintaining duration match
   ...
   """
   ```

2. **Agent Backstories Include Goals** (Cell 14):
   - Portfolio Risk Manager: "Focuses on balancing hedging costs against unhedged exposures"
   - Currency Specialist: "Maintain effectiveness above 85%..."
   - Each agent has goals baked into their instructions

3. **Evaluation Against Goals** (Cell 26 - Executive Summary):
   ```python
   Risk Objectives:
   - Maintain funding ratio above 85%
   - Limit annual volatility below 8%
   - Reduce tail risk by 35%
   - Maximum hedging cost: 25 basis points annually
   ```

### How to Make Goals More Prominent:

```python
# Cell 16 - Make customer goals explicit
CUSTOMER_GOALS = {
    "customer_name": "Global Pension Trust",
    "decision_maker": "Investment Committee",

    "strategic_goals": {
        "description": "Maintain pension funding stability while minimizing hedging costs",
        "funding_ratio_target": 0.85,
        "funding_ratio_current": 0.88,
        "participant_count": 180000,
        "time_horizon_years": 10
    },

    "risk_tolerance": {
        "annual_volatility_limit": 0.08,
        "tail_risk_reduction_target": 0.35,
        "acceptable_downside_scenarios": 0.05  # Accept 5% of scenarios can breach limits
    },

    "cost_budget": {
        "maximum_annual_hedging_cost_bps": 25,
        "total_cost_budget_millions": 62.5,  # 25 bps of $25B
        "prefer_upfront_vs_ongoing": "balanced"
    },

    "implementation_constraints": {
        "maximum_counterparties": 12,
        "minimum_trade_size_millions": 10,
        "prohibited_instruments": [],
        "esg_constraints": False
    }
}
```

---

## 4. Why 1,000+ Scenarios? Is That Necessary?

### Short Answer:
**For a real production system: No, you're right - a few dozen (20-50) well-chosen scenarios would suffice.**

### Why the Demo Uses 1,000:

#### 1. **Demonstrate Cloud Scalability** (Marketing/Demo Purpose)
- Original demo emphasizes "cloud-scale computational resources"
- Shows ability to parallelize across AWS infrastructure
- "1,000+ scenarios within minutes" sounds impressive to stakeholders
- Highlights Numerix + AWS + AI integration capability

#### 2. **Monte Carlo Coverage Argument** (Technical Justification)
From original demo (lines 145-150):
```python
sampling_method="latin_hypercube",  # Ensures good coverage of parameter space
```
- Latin Hypercube Sampling with 1,000 points provides comprehensive coverage
- Captures tail events (crisis scenarios) that might be missed with fewer scenarios
- Statistical validity: more scenarios = tighter confidence intervals

#### 3. **Robustness Testing** (Original Demo Line 262)
```python
"target_robust_efficiency": 0.80  # 80% of optimal performance maintained across scenarios
```
- Testing hedge effectiveness across wide volatility range
- Want strategies that work in 95%+ of scenarios
- More scenarios = better validation of robustness

### Why Fewer Scenarios Work Better:

#### Practical Approach: 20-50 Scenarios
```python
# Replace 1,000 random scenarios with structured scenario design
SCENARIO_LIBRARY = {
    "base_case": 1,  # Current market conditions

    "parallel_shifts": 4,  # ±100bp, ±200bp yield curve shifts

    "curve_twists": 6,  # Steepening, flattening at different magnitudes

    "volatility_regimes": 4,  # Low (VIX 12), Normal (VIX 18), Stressed (VIX 30), Crisis (VIX 60)

    "fx_stress": 6,  # Major currency moves (EUR ±10%, GBP ±15%, etc.)

    "credit_stress": 4,  # IG spreads +50bp, +150bp, HY +200bp, +500bp

    "correlation_breaks": 3,  # Normal, stress, crisis correlation matrices

    "historical_replays": 5,  # 2008 crisis, 2020 COVID, 2022 rates shock, etc.

    "custom_scenarios": 5   # Client-specific fears (e.g., "Brexit 2.0")
}
# Total: ~38 scenarios
```

#### Benefits of Fewer, Better Scenarios:

1. **Explainability**: Investment committee understands "2008 crisis scenario" vs "scenario_0742"

2. **Faster Iteration**: 38 scenarios run in seconds, not minutes
   - Try multiple hedge strategies quickly
   - Interactive analysis possible

3. **Focused Analysis**: Each scenario has economic meaning
   - "If rates spike 200bp while credit spreads widen 500bp..."
   - Easier to communicate to stakeholders

4. **Lower Costs**:
   - Fewer SageMaker compute hours
   - Fewer Numerix pricing calls
   - Faster agent reasoning (less data to synthesize)

### Recommendation for Production:

```python
# Hybrid Approach
class ScenarioGenerator:
    def generate_scenarios(self, approach="structured"):
        if approach == "structured":
            # 30-50 carefully designed scenarios
            return self._generate_structured_scenarios()

        elif approach == "monte_carlo":
            # 1,000+ for initial validation/calibration
            return self._generate_monte_carlo_scenarios(num=1000)

        elif approach == "stress_test":
            # 10-15 extreme scenarios for regulatory reporting
            return self._generate_stress_scenarios()
```

---

## 5. Data Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA SOURCES                             │
├─────────────────────────────────────────────────────────────┤
│  Portfolio Holdings (S3/Bloomberg/Internal System)           │
│  Market Data (Bloomberg API/Refinitiv)                       │
│  Historical Volatility (Time Series Data)                    │
│  Customer Goals (Input Parameters)                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              SCENARIO GENERATION (Cell 8)                    │
├─────────────────────────────────────────────────────────────┤
│  → Option A: 1,000 Monte Carlo (current)                     │
│  → Option B: 30-50 Structured (recommended)                  │
│  → Store in S3 for distributed processing                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         DISTRIBUTED PROCESSING (Cell 19-21)                  │
├─────────────────────────────────────────────────────────────┤
│  SageMaker Processing Jobs (5 instances)                     │
│  → Each instance: Numerix SDK pricing                        │
│  → Calculate VaR, CVaR, exposure metrics                     │
│  → Results stored in S3                                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            AGENT ORCHESTRATION (Cell 14)                     │
├─────────────────────────────────────────────────────────────┤
│  Portfolio Risk Manager ← reads customer goals               │
│     ↓ delegates to specialists                               │
│  FX / IR / Credit / Execution Agents                         │
│     ↓ use Numerix tools (Action Groups)                      │
│  Synthesize integrated hedging strategy                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            EXECUTIVE SUMMARY (Cell 26)                       │
├─────────────────────────────────────────────────────────────┤
│  Bedrock Claude generates report                             │
│  → Recommendations vs. customer goals                        │
│  → Specific instruments, hedge ratios, costs                 │
│  → Implementation roadmap                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

1. **Data**: Currently synthetic; need to integrate real portfolio data from custodians/Bloomberg/internal systems

2. **Instruments**: Referenced conceptually; need explicit definition via Numerix SDK or instrument library

3. **Customer Goals**: ✅ Already defined in `risk_objectives`; could be made more prominent with dedicated structure

4. **1,000 Scenarios**: Demo/marketing choice; **30-50 structured scenarios recommended for production**

5. **Integration Needed**:
   - Replace synthetic portfolio → real data from S3/APIs
   - Add Numerix SDK instrument definitions
   - Implement actual pricing (not random simulations)
   - Consider scenario reduction to 30-50 meaningful cases
