import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Plus, 
  Trash2,
  Utensils,
  Bus,
  BookOpen,
  PiggyBank,
  ShoppingBag,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";

interface Expense {
  id: number;
  category: string;
  amount: number;
  date: string;
  note: string;
}

const categories = [
  { name: "Food", icon: Utensils, color: "bg-orange-100 text-orange-600" },
  { name: "Transportation", icon: Bus, color: "bg-blue-100 text-blue-600" },
  { name: "School", icon: BookOpen, color: "bg-purple-100 text-purple-600" },
  { name: "Savings", icon: PiggyBank, color: "bg-success-light text-success" },
  { name: "Wants", icon: ShoppingBag, color: "bg-pink-100 text-pink-600" },
  { name: "Others", icon: MoreHorizontal, color: "bg-muted text-muted-foreground" },
];

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 1, category: "Food", amount: 150, date: "2025-01-06", note: "Lunch" },
    { id: 2, category: "Transportation", amount: 80, date: "2025-01-05", note: "Jeep fare" },
    { id: 3, category: "School", amount: 250, date: "2025-01-04", note: "School supplies" },
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "Food",
    amount: "",
    note: "",
  });

  const handleAddExpense = () => {
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const expense: Expense = {
      id: Date.now(),
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      date: new Date().toISOString().split('T')[0],
      note: newExpense.note || "",
    };

    setExpenses([expense, ...expenses]);
    setNewExpense({ category: "Food", amount: "", note: "" });
    setShowForm(false);
    toast.success("Expense added successfully!");
  };

  const handleDeleteExpense = (id: number) => {
    setExpenses(expenses.filter((e) => e.id !== id));
    toast.success("Expense deleted");
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const getCategoryIcon = (categoryName: string) => {
    const cat = categories.find((c) => c.name === categoryName);
    return cat || categories[5];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Expense Tracking</h1>
            <p className="text-muted-foreground text-sm">Track where your money goes</p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="rounded-2xl bg-gradient-warning p-6 text-white mb-6">
          <p className="text-white/80 text-sm mb-1">Total Expenses</p>
          <p className="text-3xl font-bold">₱{totalExpenses.toLocaleString()}</p>
          <p className="text-white/70 text-sm mt-1">{expenses.length} transactions</p>
        </div>

        {/* Add Expense Button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="w-full mb-6" variant="cta">
            <Plus className="h-5 w-5 mr-2" />
            Add New Expense
          </Button>
        )}

        {/* Add Expense Form */}
        {showForm && (
          <div className="rounded-2xl border border-border bg-card p-6 mb-6 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-4">Add Expense</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setNewExpense({ ...newExpense, category: cat.name })}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                        newExpense.category === cat.name
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${cat.color}`}>
                        <cat.icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Amount (₱)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="text-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Note (optional)</label>
                <Input
                  placeholder="What was this for?"
                  value={newExpense.note}
                  onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddExpense} className="flex-1" variant="cta">
                  Add Expense
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Expense List */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Expense History</h3>
          
          {expenses.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No expenses yet. Start tracking!</p>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => {
                const cat = getCategoryIcon(expense.category);
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${cat.color}`}>
                        <cat.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{expense.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.note || expense.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-foreground">-₱{expense.amount}</span>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Expenses;