import { useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, PiggyBank, Target, Trash2, TrendingUp, Loader2 } from "lucide-react";
import { useSavingsGoals } from "@/hooks/useSavingsGoals";

const Savings = () => {
  const { goals, isLoading, addGoal, updateGoal, deleteGoal } = useSavingsGoals();
  
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    target: "",
    targetDate: "",
  });

  const [addToGoal, setAddToGoal] = useState<{ id: string; amount: string } | null>(null);

  const handleCreateGoal = () => {
    if (!newGoal.name || !newGoal.target || parseFloat(newGoal.target) <= 0) {
      return;
    }

    addGoal.mutate({
      name: newGoal.name,
      target_amount: parseFloat(newGoal.target),
      current_amount: 0,
      deadline: newGoal.targetDate || null,
    });
    
    setNewGoal({ name: "", target: "", targetDate: "" });
    setShowForm(false);
  };

  const handleAddSavings = (goalId: string, currentAmount: number) => {
    if (!addToGoal || !addToGoal.amount || parseFloat(addToGoal.amount) <= 0) {
      return;
    }

    updateGoal.mutate({
      id: goalId,
      current_amount: currentAmount + parseFloat(addToGoal.amount),
    });
    setAddToGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal.mutate(id);
  };

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);

  if (isLoading) {
    return (
      <UserLayout title="Savings Goals" subtitle="Build your future, one peso at a time">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Savings Goals" subtitle="Build your future, one peso at a time">
      <div className="max-w-4xl mx-auto">

        {/* Summary Card */}
        <div className="rounded-2xl bg-gradient-primary p-6 text-primary-foreground mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white/20">
              <PiggyBank className="h-6 w-6" />
            </div>
            <div>
              <p className="text-primary-foreground/80 text-sm">Total Saved</p>
              <p className="text-3xl font-bold">₱{totalSaved.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary-foreground/70" />
              <span className="text-primary-foreground/80 text-sm">
                Total Target: ₱{totalTarget.toLocaleString()}
              </span>
            </div>
            <span className="text-sm font-medium">
              {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}% complete
            </span>
          </div>
        </div>

        {/* Add Goal Button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="w-full mb-6" variant="cta">
            <Plus className="h-5 w-5 mr-2" />
            Create New Goal
          </Button>
        )}

        {/* Create Goal Form */}
        {showForm && (
          <div className="rounded-2xl border border-border bg-card p-6 mb-6 animate-fade-in">
            <h3 className="font-semibold text-foreground mb-4">New Savings Goal</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Goal Name</label>
                <Input
                  placeholder="e.g., New Phone, Trip, Emergency Fund"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Target Amount (₱)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Target Date (optional)</label>
                <Input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateGoal} 
                  className="flex-1" 
                  variant="cta"
                  disabled={addGoal.isPending}
                >
                  {addGoal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Goal"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No savings goals yet. Create one to get started!</p>
            </div>
          ) : (
            goals.map((goal) => {
              const current = Number(goal.current_amount);
              const target = Number(goal.target_amount);
              const progress = Math.min((current / target) * 100, 100);
              const isComplete = current >= target;

              return (
                <div
                  key={goal.id}
                  className={`rounded-2xl border bg-card p-6 transition-all ${
                    isComplete ? "border-success bg-success/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        {goal.name}
                        {isComplete && (
                          <span className="text-xs bg-success text-white px-2 py-0.5 rounded-full">
                            Complete!
                          </span>
                        )}
                      </h4>
                      {goal.deadline && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Target: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                      disabled={deleteGoal.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Circular Progress */}
                  <div className="flex items-center gap-6 mb-4">
                    <div className="relative w-20 h-20 shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="none"
                          stroke="hsl(var(--muted))"
                          strokeWidth="6"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          fill="none"
                          stroke={isComplete ? "hsl(var(--success))" : "hsl(var(--primary))"}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${progress * 2.136} 213.6`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-foreground">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-2xl font-bold text-foreground">
                        ₱{current.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        of ₱{target.toLocaleString()} goal
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ₱{(target - current).toLocaleString()} to go
                      </p>
                    </div>
                  </div>

                  {/* Add Savings */}
                  {!isComplete && (
                    <>
                      {addToGoal?.id === goal.id ? (
                        <div className="flex gap-2 mt-4">
                          <Input
                            type="number"
                            placeholder="Amount"
                            value={addToGoal.amount}
                            onChange={(e) => setAddToGoal({ ...addToGoal, amount: e.target.value })}
                            className="flex-1"
                            autoFocus
                          />
                          <Button variant="outline" onClick={() => setAddToGoal(null)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => handleAddSavings(goal.id, current)} 
                            variant="cta"
                            disabled={updateGoal.isPending}
                          >
                            {updateGoal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => setAddToGoal({ id: goal.id, amount: "" })}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Add Savings
                        </Button>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default Savings;
