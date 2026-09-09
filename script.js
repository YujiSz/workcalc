/**
 * WorkCalc — Pure Vanilla JS Calculation & Utility Engine
 * All calculations are client-side, pure functions with edge-case protection.
 */

(function () {
    'use strict';

    /* ==========================================================================
       Math Utilities & Safe Parsers
       ========================================================================== */

    function parseInput(val, fallback = 0) {
        if (val === null || val === undefined) return fallback;
        const clean = String(val).replace(/,/g, '.').trim();
        if (clean === '') return fallback;
        const num = parseFloat(clean);
        return isNaN(num) ? fallback : num;
    }

    function formatCurrency(amount) {
        if (!isFinite(amount) || isNaN(amount)) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function formatPercent(val) {
        if (!isFinite(val) || isNaN(val)) return '0.0%';
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 2
        }).format(val) + '%';
    }

    function formatNumber(val, decimals = 0) {
        if (!isFinite(val) || isNaN(val)) return '0';
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(val);
    }

    /* ==========================================================================
       Pure Calculation Models
       ========================================================================== */

    // 1. Hourly Rate
    function computeHourlyRate({
        desiredMonthlyIncome,
        weeklyHours,
        vacationWeeks,
        monthlyExpenses,
        taxReservePercent,
        billableRatioPercent
    }) {
        const netMonthlyTarget = Math.max(0, desiredMonthlyIncome) + Math.max(0, monthlyExpenses);
        const netAnnualTarget = netMonthlyTarget * 12;

        const taxRate = Math.min(Math.max(0, taxReservePercent), 99) / 100;
        const grossAnnualTarget = taxRate >= 1 ? 0 : netAnnualTarget / (1 - taxRate);
        const grossMonthlyTarget = grossAnnualTarget / 12;

        const workingWeeks = Math.max(0, 52 - Math.min(Math.max(0, vacationWeeks), 51.9));
        const safeWeeklyHours = Math.max(0, weeklyHours);
        const totalWorkingHoursYear = workingWeeks * safeWeeklyHours;

        const billableRatio = Math.min(Math.max(1, billableRatioPercent), 100) / 100;
        const billableHoursYear = totalWorkingHoursYear * billableRatio;

        let recommendedHourlyRate = 0;
        let minimumHourlyRate = 0;

        if (billableHoursYear > 0) {
            recommendedHourlyRate = grossAnnualTarget / billableHoursYear;
        }
        if (totalWorkingHoursYear > 0) {
            minimumHourlyRate = grossAnnualTarget / totalWorkingHoursYear;
        }

        const effectiveYieldRate = totalWorkingHoursYear > 0 ? grossAnnualTarget / totalWorkingHoursYear : 0;

        return {
            recommendedHourlyRate,
            minimumHourlyRate,
            grossMonthlyTarget,
            grossAnnualTarget,
            effectiveYieldRate,
            billableHoursYear,
            totalWorkingHoursYear
        };
    }

    // 2. Project Pricing
    function computeProjectPrice({
        estimatedHours,
        hourlyRate,
        additionalExpenses,
        contingencyPercent,
        platformFeePercent,
        discountPercent
    }) {
        const safeHours = Math.max(0, estimatedHours);
        const safeRate = Math.max(0, hourlyRate);
        const safeExpenses = Math.max(0, additionalExpenses);
        const safeContingency = Math.max(0, contingencyPercent);
        const safeDiscount = Math.min(Math.max(0, discountPercent), 100);
        const safeFee = Math.min(Math.max(0, platformFeePercent), 99);

        const baseLaborCost = safeHours * safeRate;
        const contingencyAmount = baseLaborCost * (safeContingency / 100);
        const subtotalWithContingency = baseLaborCost + contingencyAmount + safeExpenses;

        const discountAmount = subtotalWithContingency * (safeDiscount / 100);
        const netTarget = Math.max(0, subtotalWithContingency - discountAmount);

        const feeRatio = safeFee / 100;
        const finalProjectQuote = feeRatio >= 1 ? netTarget : netTarget / (1 - feeRatio);
        const platformFeeAmount = finalProjectQuote - netTarget;

        return {
            baseLaborCost,
            contingencyAmount,
            costWithExpenses: subtotalWithContingency,
            discountAmount,
            platformFeeAmount,
            finalProjectQuote
        };
    }

    // 3. Profit Margin
    function computeProfitMargin({ revenue, cogs, operatingExpenses }) {
        const safeRev = Math.max(0, revenue);
        const safeCogs = Math.max(0, cogs);
        const safeOpex = Math.max(0, operatingExpenses);

        const grossProfit = safeRev - safeCogs;
        const netProfit = grossProfit - safeOpex;

        const grossMarginPercent = safeRev > 0 ? (grossProfit / safeRev) * 100 : 0;
        const netMarginPercent = safeRev > 0 ? (netProfit / safeRev) * 100 : 0;
        const markupPercent = safeCogs > 0 ? (grossProfit / safeCogs) * 100 : 0;

        return {
            grossProfit,
            netProfit,
            grossMarginPercent,
            netMarginPercent,
            markupPercent
        };
    }

    // 4. Break-even
    function computeBreakEven({ fixedCosts, unitPrice, variableCostPerUnit, actualUnitsSold }) {
        const safeFixed = Math.max(0, fixedCosts);
        const safePrice = Math.max(0, unitPrice);
        const safeVar = Math.max(0, variableCostPerUnit);
        const safeActual = Math.max(0, actualUnitsSold);

        const contributionMargin = safePrice - safeVar;
        const contributionMarginRatio = safePrice > 0 ? (contributionMargin / safePrice) * 100 : 0;

        let breakEvenUnits = 0;
        let breakEvenRevenue = 0;
        let isAttainable = true;

        if (contributionMargin <= 0 && safeFixed > 0) {
            isAttainable = false;
        } else if (contributionMargin > 0) {
            breakEvenUnits = Math.ceil(safeFixed / contributionMargin);
            breakEvenRevenue = breakEvenUnits * safePrice;
        }

        let marginOfSafetyUnits = 0;
        let marginOfSafetyPercent = 0;
        if (safeActual > 0 && isAttainable) {
            marginOfSafetyUnits = safeActual - breakEvenUnits;
            marginOfSafetyPercent = (marginOfSafetyUnits / safeActual) * 100;
        }

        return {
            contributionMargin,
            contributionMarginRatio,
            breakEvenUnits,
            breakEvenRevenue,
            marginOfSafetyUnits,
            marginOfSafetyPercent,
            isAttainable
        };
    }

    // 5. Commission
    function computeCommission({ dealAmount, commissionRate, flatFee, participantsCount }) {
        const safeDeal = Math.max(0, dealAmount);
        const safeRate = Math.max(0, commissionRate);
        const safeFlat = Math.max(0, flatFee);
        const safeParticipants = Math.max(1, Math.floor(participantsCount) || 1);

        const percentCommission = safeDeal * (safeRate / 100);
        const totalCommission = percentCommission + safeFlat;
        const netAmount = Math.max(0, safeDeal - totalCommission);
        const commissionPerPerson = totalCommission / safeParticipants;
        const effectiveRate = safeDeal > 0 ? (totalCommission / safeDeal) * 100 : 0;

        return {
            totalCommission,
            netAmount,
            commissionPerPerson,
            effectiveRate
        };
    }

    /* ==========================================================================
       DOM Binders & Event Handlers
       ========================================================================== */

    function setupClipboardButtons() {
        document.querySelectorAll('[data-copy-target]').forEach(button => {
            button.addEventListener('click', function () {
                const targetId = this.getAttribute('data-copy-target');
                const targetEl = document.getElementById(targetId);
                const toastEl = this.nextElementSibling;
                if (!targetEl) return;

                const textToCopy = targetEl.innerText.trim();
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(textToCopy).then(() => showToast(toastEl));
                } else {
                    const textarea = document.createElement('textarea');
                    textarea.value = textToCopy;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    try {
                        document.execCommand('copy');
                        showToast(toastEl);
                    } catch (err) {
                        console.error('Copy fallback failed', err);
                    }
                    document.body.removeChild(textarea);
                }
            });
        });
    }

    function showToast(el) {
        if (!el) return;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 2000);
    }

    function setupMobileNav() {
        const toggleBtn = document.querySelector('.mobile-nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        if (!toggleBtn || !navMenu) return;

        toggleBtn.addEventListener('click', () => {
            const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
            toggleBtn.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('open');
        });
    }

    function initHourlyRateCalc() {
        const form = document.getElementById('hourly-calc-form');
        if (!form) return;

        const alertBox = document.getElementById('calc-alert');

        function run() {
            const desiredMonthlyIncome = parseInput(document.getElementById('monthly-income').value);
            const weeklyHours = parseInput(document.getElementById('weekly-hours').value);
            const vacationWeeks = parseInput(document.getElementById('vacation-weeks').value);
            const monthlyExpenses = parseInput(document.getElementById('monthly-expenses').value);
            const taxReservePercent = parseInput(document.getElementById('tax-reserve').value);
            const billableRatioPercent = parseInput(document.getElementById('billable-ratio').value);

            if (vacationWeeks >= 52) {
                alertBox.textContent = 'Vacation weeks cannot be 52 or higher (no working time left).';
                alertBox.classList.add('visible');
            } else if (taxReservePercent >= 100) {
                alertBox.textContent = 'Tax and reserve rate cannot be 100% or greater.';
                alertBox.classList.add('visible');
            } else {
                alertBox.classList.remove('visible');
            }

            const res = computeHourlyRate({
                desiredMonthlyIncome,
                weeklyHours,
                vacationWeeks,
                monthlyExpenses,
                taxReservePercent,
                billableRatioPercent
            });

            document.getElementById('res-recommended-rate').textContent = formatCurrency(res.recommendedHourlyRate) + ' / hr';
            document.getElementById('res-min-rate').textContent = formatCurrency(res.minimumHourlyRate) + ' / hr';
            document.getElementById('res-gross-monthly').textContent = formatCurrency(res.grossMonthlyTarget);
            document.getElementById('res-gross-annual').textContent = formatCurrency(res.grossAnnualTarget);
            document.getElementById('res-effective-yield').textContent = formatCurrency(res.effectiveYieldRate) + ' / hr';
            document.getElementById('res-billable-hours').textContent = formatNumber(res.billableHoursYear) + ' hrs';
        }

        form.addEventListener('input', run);
        form.addEventListener('reset', () => setTimeout(run, 10));
        run();
    }

    function initProjectPricingCalc() {
        const form = document.getElementById('project-pricing-form');
        if (!form) return;

        const alertBox = document.getElementById('calc-alert');

        function run() {
            const estimatedHours = parseInput(document.getElementById('proj-hours').value);
            const hourlyRate = parseInput(document.getElementById('proj-rate').value);
            const additionalExpenses = parseInput(document.getElementById('proj-expenses').value);
            const contingencyPercent = parseInput(document.getElementById('proj-contingency').value);
            const platformFeePercent = parseInput(document.getElementById('proj-fee').value);
            const discountPercent = parseInput(document.getElementById('proj-discount').value);

            if (platformFeePercent >= 100) {
                alertBox.textContent = 'Platform fee cannot equal or exceed 100%.';
                alertBox.classList.add('visible');
            } else {
                alertBox.classList.remove('visible');
            }

            const res = computeProjectPrice({
                estimatedHours,
                hourlyRate,
                additionalExpenses,
                contingencyPercent,
                platformFeePercent,
                discountPercent
            });

            document.getElementById('res-final-price').textContent = formatCurrency(res.finalProjectQuote);
            document.getElementById('res-base-labor').textContent = formatCurrency(res.baseLaborCost);
            document.getElementById('res-contingency').textContent = formatCurrency(res.contingencyAmount);
            document.getElementById('res-platform-fee').textContent = formatCurrency(res.platformFeeAmount);
            document.getElementById('res-discount').textContent = formatCurrency(res.discountAmount);
        }

        form.addEventListener('input', run);
        form.addEventListener('reset', () => setTimeout(run, 10));
        run();
    }

    function initProfitMarginCalc() {
        const form = document.getElementById('profit-margin-form');
        if (!form) return;

        const alertBox = document.getElementById('calc-alert');

        function run() {
            const revenue = parseInput(document.getElementById('margin-revenue').value);
            const cogs = parseInput(document.getElementById('margin-cogs').value);
            const operatingExpenses = parseInput(document.getElementById('margin-opex').value);

            if (cogs > revenue && revenue > 0) {
                alertBox.textContent = 'Direct cost (COGS) exceeds total revenue. Gross profit is negative.';
                alertBox.classList.add('visible');
            } else {
                alertBox.classList.remove('visible');
            }

            const res = computeProfitMargin({ revenue, cogs, operatingExpenses });

            const netEl = document.getElementById('res-net-profit');
            netEl.textContent = formatCurrency(res.netProfit);
            netEl.className = 'metric-value ' + (res.netProfit >= 0 ? 'positive' : 'negative');

            document.getElementById('res-gross-profit').textContent = formatCurrency(res.grossProfit);
            document.getElementById('res-gross-margin').textContent = formatPercent(res.grossMarginPercent);
            document.getElementById('res-net-margin').textContent = formatPercent(res.netMarginPercent);
            document.getElementById('res-markup').textContent = formatPercent(res.markupPercent);
        }

        form.addEventListener('input', run);
        form.addEventListener('reset', () => setTimeout(run, 10));
        run();
    }

    function initBreakEvenCalc() {
        const form = document.getElementById('break-even-form');
        if (!form) return;

        const alertBox = document.getElementById('calc-alert');

        function run() {
            const fixedCosts = parseInput(document.getElementById('be-fixed').value);
            const unitPrice = parseInput(document.getElementById('be-price').value);
            const variableCostPerUnit = parseInput(document.getElementById('be-variable').value);
            const actualUnitsSold = parseInput(document.getElementById('be-actual-units').value);

            const res = computeBreakEven({
                fixedCosts,
                unitPrice,
                variableCostPerUnit,
                actualUnitsSold
            });

            if (!res.isAttainable) {
                alertBox.textContent = 'Variable cost per unit is greater than or equal to selling price. Break-even cannot be reached.';
                alertBox.classList.add('visible');
            } else {
                alertBox.classList.remove('visible');
            }

            document.getElementById('res-be-units').textContent = formatNumber(res.breakEvenUnits) + ' units';
            document.getElementById('res-be-revenue').textContent = formatCurrency(res.breakEvenRevenue);
            document.getElementById('res-contribution-margin').textContent = formatCurrency(res.contributionMargin);
            document.getElementById('res-contribution-ratio').textContent = formatPercent(res.contributionMarginRatio);

            const safetyEl = document.getElementById('res-margin-safety');
            if (actualUnitsSold > 0 && res.isAttainable) {
                safetyEl.textContent = `${formatNumber(res.marginOfSafetyUnits)} units (${formatPercent(res.marginOfSafetyPercent)})`;
            } else {
                safetyEl.textContent = 'Enter actual units sold to view';
            }
        }

        form.addEventListener('input', run);
        form.addEventListener('reset', () => setTimeout(run, 10));
        run();
    }

    function initCommissionCalc() {
        const form = document.getElementById('commission-form');
        if (!form) return;

        const alertBox = document.getElementById('calc-alert');

        function run() {
            const dealAmount = parseInput(document.getElementById('comm-deal').value);
            const commissionRate = parseInput(document.getElementById('comm-rate').value);
            const flatFee = parseInput(document.getElementById('comm-flat').value);
            const participantsCount = parseInput(document.getElementById('comm-participants').value, 1);

            const res = computeCommission({
                dealAmount,
                commissionRate,
                flatFee,
                participantsCount
            });

            if (res.totalCommission > dealAmount && dealAmount > 0) {
                alertBox.textContent = 'Total commission fees exceed total deal size. Net payout is zero.';
                alertBox.classList.add('visible');
            } else {
                alertBox.classList.remove('visible');
            }

            document.getElementById('res-comm-total').textContent = formatCurrency(res.totalCommission);
            document.getElementById('res-comm-net').textContent = formatCurrency(res.netAmount);
            document.getElementById('res-comm-per-person').textContent = formatCurrency(res.commissionPerPerson);
            document.getElementById('res-comm-effective-rate').textContent = formatPercent(res.effectiveRate);
        }

        form.addEventListener('input', run);
        form.addEventListener('reset', () => setTimeout(run, 10));
        run();
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupMobileNav();
        setupClipboardButtons();

        initHourlyRateCalc();
        initProjectPricingCalc();
        initProfitMarginCalc();
        initBreakEvenCalc();
        initCommissionCalc();
    });
})();