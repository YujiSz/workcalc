# WorkCalc — Free Financial Calculators for Freelancers & Solo Businesses

WorkCalc is a fast, responsive, privacy-respecting suite of financial calculation tools and guides engineered specifically for independent contractors, creative freelancers, and service agency founders.

The site is built with **zero external dependencies, zero backend runtimes, and zero trackers**. It works by opening `index.html` locally in any modern browser and is 100% compatible with GitHub Pages hosting.

---

## Features

- **Hourly Rate Calculator**: Calculates sustainable minimum and recommended rates factoring in business overhead, tax withholding buffers, vacation days, and realistic billable ratios (50%–70%).
- **Project Pricing Calculator**: Converts estimated delivery hours into resilient fixed-price quotes with scope-creep buffers, direct expenses, and gateway fee recovery.
- **Profit Margin & Markup Calculator**: Dissects revenue, COGS, and operating expenses to report Gross Margin, Net Margin, and cost Markup.
- **Break-Even Point Calculator**: Models unit contribution margins to identify the exact volume of client retainers needed to cover fixed overhead, complete with margin of safety metrics.
- **Sales Commission Calculator**: Computes variable rates, flat processing cuts, and distributed team payouts.
- **Knowledge Base Guides**: Original, in-depth documentation clarifying non-billable utilization, margin vs. markup mechanics, and contract risk mitigation.
- **Copy to Clipboard**: Quick, native client-side copy with visual toast confirmation.
- **Responsive & Accessible**: Mobile-first architecture tested down to 320px screen widths, featuring semantic HTML5 tags, visible focus states, and ARIA live announcements.

---

## Tech Stack

- **HTML5**: Clean semantic elements (`<main>`, `<section>`, `<article>`, `<aside>`, `<output>`).
- **CSS3**: Native CSS custom properties, Flexbox, and CSS Grid layouts with zero CSS frameworks or preprocessors.
- **Vanilla JavaScript (ES6+)**: Pure computational functions, defensive parsing against `NaN`/`Infinity`, and real-time event binding.

---

## File Structure

```text
workcalc/
├── index.html
├── styles.css
├── script.js
├── robots.txt
├── sitemap.xml
├── 404.html
├── README.md
├── assets/
│   └── favicon.svg
├── calculators/
│   ├── hourly-rate-calculator.html
│   ├── project-pricing-calculator.html
│   ├── profit-margin-calculator.html
│   ├── break-even-calculator.html
│   └── commission-calculator.html
└── guides/
    ├── how-to-calculate-hourly-rate.html
    ├── how-to-price-a-freelance-project.html
    ├── profit-margin-explained.html
    └── break-even-point-explained.html

    Manual Test Cases & Edge Cases
Below is the verified test battery used to validate the calculation logic.
1. Hourly Rate Calculator
Standard Profile:
Desired Net Monthly: $5,000
Weekly Hours: 40
Vacation Weeks: 4 (Working Weeks = 48)
Monthly Expenses: $600
Tax & Reserve: 25%
Billable Ratio: 60%
Expected Calculations:
Net Annual Target = ($5,000 + $600) * 12 = $67,200
Gross Annual Target = $67,200 / (1 - 0.25) = $89,600.00
Gross Monthly Target = $89,600 / 12 = $7,466.67
Total Working Hours/Year = 48 * 40 = 1,920 hrs
Billable Hours/Year = 1,920 * 0.60 = 1,152 hrs
Recommended Rate = $89,600 / 1,152 = $77.78 / hr
Minimum Baseline Rate = $89,600 / 1,920 = $46.67 / hr
Edge Cases:
Vacation >= 52 weeks: Warns user that no working hours remain; gracefully clamps calculations.
Tax Rate = 100%: Warns user; limits divisor from hitting 0 (taxRate capped at 99%) preventing Infinity.
Empty/Zero Fields: Cleanly yields $0.00 / hr without throwing browser console errors.
2. Project Pricing Calculator
Standard Profile:
Estimated Hours: 35
Hourly Rate: $65
Additional Expenses: $150
Revisions / Buffer: 15%
Platform Fee: 3.5%
Discount: 0%
Expected Calculations:
Base Labor = 35 * $65 = $2,275.00
Contingency Buffer = $2,275 * 0.15 = $341.25
Net Subtotal = $2,275 + $341.25 + $150 = $2,766.25
Fee Calculation = $2,766.25 / (1 - 0.035) = $2,866.58
Platform Fee Amount = $2,866.58 - $2,766.25 = $100.33
3. Profit Margin Calculator
Standard Profile:
Revenue: $12,000
COGS: $4,500
Operating Expenses: $2,500
Expected Calculations:
Gross Profit = $12,000 - $4,500 = $7,500.00
Net Profit = $7,500 - $2,500 = $5,000.00
Gross Margin = ($7,500 / $12,000) * 100 = 62.5%
Net Margin = ($5,000 / $12,000) * 100 = 41.67%
Markup = ($7,500 / $4,500) * 100 = 166.67%
Edge Cases:
Zero Revenue: Returns 0.0% margin without NaN.
COGS > Revenue: Displays negative profit highlighted in red and presents an alert warning the user that unit economics are underwater.
4. Break-Even Calculator
Standard Profile:
Fixed Monthly Overhead: $3,200
Selling Price / Unit: $800
Variable Cost / Unit: $150
Actual Units Sold: 7
Expected Calculations:
Unit Contribution Margin = $800 - $150 = $650.00
Contribution Margin Ratio = ($650 / $800) * 100 = 81.25%
Break-Even Units = ceil($3,200 / $650) = 5 units
Break-Even Revenue = 5 * $800 = $4,000.00
Margin of Safety Units = 7 - 5 = 2 units
Margin of Safety % = (2 / 7) * 100 = 28.57%
Edge Cases:
Variable Cost >= Unit Price: Triggers an alert noting that break-even cannot be reached because unit contribution is negative.
5. Commission Calculator
Standard Profile:
Deal Size: $8,500
Commission: 10%
Flat Fee: $50
Participants: 2
Expected Calculations:
Total Commission = ($8,500 * 0.10) + $50 = $900.00
Net to Seller = $8,500 - $900 = $7,600.00
Payout Per Participant = $900 / 2 = $450.00
Effective Fee Rate = ($900 / $8,500) * 100 = 10.59%
How to Run Locally
Because WorkCalc uses standard web technologies without external dependencies:
Clone or download the repository to your computer.
Double-click index.html to open it in Google Chrome, Mozilla Firefox, Safari, or Microsoft Edge.
Alternatively, launch a lightweight static development server:
code
Bash
# Using Python 3:
python3 -m http.server 8080

# Or using Node.js npx:
npx serve .
Navigate to http://localhost:8080.

How to Publish to GitHub Pages
Create a new GitHub repository named workcalc.
Push your project files to the main branch:
code
Bash
git init
git add .
git commit -m "feat: Initial WorkCalc release"
git branch -M main
git remote add origin https://github.com/<your-username>/workcalc.git
git push -u origin main
Open your repository on GitHub and click Settings.
In the left navigation, select Pages.
Under Build and deployment > Branch, select main and root directory /(root).
Click Save. Within 1–2 minutes, GitHub will publish your site at:
https://<your-username>.github.io/workcalc/
Search Engine Optimization (SEO) & Search Console
1. Update Domain & Path Placeholders
Before production indexing, search and replace the placeholder repository URL in sitemap.xml and robots.txt:
Find: https://username.github.io/workcalc
Replace with: https://<your-username>.github.io/workcalc (or your custom domain like https://workcalc.io).
2. Adding to Google Search Console
Visit Google Search Console.
Choose URL Prefix property type and enter your site URL (e.g., https://<your-username>.github.io/workcalc/).
Verify ownership via HTML file upload or by adding the Google verification meta tag to the <head> of index.html.
Once verified, click Sitemaps in the sidebar.
Enter sitemap.xml and click Submit. Google will crawl and index your calculator and guide pages.
Project Limitations & Future Roadmap
Current Limitations
No Currency Conversion: Rates are rendered in standard currency units (USD default).
Tax Model Generality: Tax withholdings are modeled as user-defined percentages rather than factoring in specific national tax brackets or VAT rules.

Future Roadmap
LocalStorage persistence to save user configurations across browser sessions.
Direct PDF report generation for sending project estimates to clients.
Multi-currency switcher with manual exchange multipliers.