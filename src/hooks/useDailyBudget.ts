import { useMemo } from "react";
import { useBudgets } from "./useBudgets";
import { useExpenses } from "./useExpenses";

/**
 * Daily Budget Calculator with Rollover
 * 
 * Logic: Unspent budget from previous days carries over to the next day.
 * 
 * Example:
 * - Monthly allowance: ₱3,000
 * - Daily budget: ₱100 (3000 / 30 days)
 * - Day 1: Budget ₱100, Spent ₱70, Remaining ₱30
 * - Day 2: Budget ₱100 + ₱30 (rollover) = ₱130 available
 * 
 * Formula:
 * - Days passed = current day of month
 * - Expected budget so far = daily_budget × days_passed
 * - Today's available = expected_budget_so_far - total_spent_this_month
 */
export const useDailyBudget = () => {
  const { allowance, isLoading: budgetsLoading } = useBudgets();
  const { expenses, isLoading: expensesLoading } = useExpenses();

  const calculations = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - currentDay + 1; // Including today

    // Daily budget from monthly allowance
    const dailyBudget = allowance > 0 ? Math.round(allowance / daysInMonth) : 0;

    // Expected budget up to today (cumulative)
    const expectedBudgetToday = dailyBudget * currentDay;

    // Filter expenses for current month only
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthlyExpenses = expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    // Total spent this month
    const totalSpentThisMonth = monthlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Today's expenses
    const todayStr = today.toISOString().split("T")[0];
    const todaysExpenses = monthlyExpenses.filter((e) => e.date === todayStr);
    const spentToday = todaysExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // Available today = expected budget so far - total spent (includes rollover)
    const availableToday = expectedBudgetToday - totalSpentThisMonth;

    // Rollover amount (savings from previous days)
    // = (daily_budget × (current_day - 1)) - (total_spent - spent_today)
    const expectedBudgetYesterday = dailyBudget * (currentDay - 1);
    const spentBeforeToday = totalSpentThisMonth - spentToday;
    const rolloverAmount = Math.max(0, expectedBudgetYesterday - spentBeforeToday);

    // Today's base budget + rollover
    const todaysTotalBudget = dailyBudget + rolloverAmount;

    // Remaining for rest of month
    const remainingMonthly = allowance - totalSpentThisMonth;

    // Average daily budget for remaining days
    const avgDailyRemaining = daysRemaining > 0 ? Math.round(remainingMonthly / daysRemaining) : 0;

    return {
      // Core values
      monthlyAllowance: allowance,
      dailyBudget,
      currentDay,
      daysInMonth,
      daysRemaining,
      
      // Today's calculations
      todaysTotalBudget,       // Daily budget + rollover
      spentToday,              // Spent today only
      availableToday,          // What's left today (with rollover)
      rolloverAmount,          // Carried over from previous days
      
      // Monthly calculations
      totalSpentThisMonth,
      remainingMonthly,
      avgDailyRemaining,
      
      // Status indicators
      isOverBudgetToday: availableToday < 0,
      isOverBudgetMonth: remainingMonthly < 0,
    };
  }, [allowance, expenses]);

  return {
    ...calculations,
    isLoading: budgetsLoading || expensesLoading,
  };
};
