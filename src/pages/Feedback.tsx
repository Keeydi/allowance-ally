import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Send, MessageSquare, ThumbsUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserLayout } from "@/components/layout/UserLayout";
import { useToast } from "@/hooks/use-toast";

interface RatingCategory {
  id: string;
  label: string;
  description: string;
  rating: number;
}

const Feedback = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [categories, setCategories] = useState<RatingCategory[]>([
    { id: "usability", label: "Usability", description: "How easy is Budget Buddy to use?", rating: 0 },
    { id: "usefulness", label: "Usefulness", description: "How helpful is it for managing your allowance?", rating: 0 },
    { id: "visual", label: "Visual Clarity", description: "How clear and appealing is the design?", rating: 0 },
    { id: "accessibility", label: "Accessibility", description: "How accessible is the app for all users?", rating: 0 },
  ]);
  const [challenges, setChallenges] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);

  const handleRating = (categoryId: string, rating: number) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, rating } : cat
    ));
  };

  const handleSubmit = () => {
    const allRated = categories.every(cat => cat.rating > 0);
    
    if (!allRated) {
      toast({
        title: "Please complete all ratings",
        description: "Rate all categories before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Simulate submission
    setSubmitted(true);
    toast({
      title: "Thank you for your feedback! 🎉",
      description: "Your response helps us improve Budget Buddy.",
    });
  };

  const averageRating = categories.reduce((sum, cat) => sum + cat.rating, 0) / categories.length;

  if (submitted) {
    return (
      <UserLayout title="User Feedback" subtitle="Help us improve Budget Buddy">
        <Card className="max-w-2xl mx-auto animate-fade-in">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your feedback has been submitted successfully. We appreciate your time in helping us improve Budget Buddy.
            </p>
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">Your average rating</p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(averageRating)
                        ? "text-warning fill-warning"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
                <span className="text-lg font-semibold text-foreground ml-2">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            </div>
            <Link to="/dashboard">
              <Button variant="default">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="User Feedback" subtitle="Help us improve Budget Buddy">
      <div className="max-w-3xl mx-auto space-y-6">
          {/* Introduction */}
          <Card className="animate-fade-in bg-gradient-to-br from-primary/5 to-success/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">We Value Your Opinion!</h3>
                  <p className="text-sm text-muted-foreground">
                    This feedback form is part of our research to evaluate Budget Buddy's effectiveness 
                    in helping Grade 11 students manage their allowance. Your honest responses will help 
                    us understand what works well and what needs improvement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Categories */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                Rate Your Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {categories.map((category, index) => (
                <div 
                  key={category.id}
                  className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-foreground">{category.label}</h4>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(category.id, star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              star <= category.rating
                                ? "text-warning fill-warning"
                                : "text-muted-foreground/30 hover:text-warning/50"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Would Recommend */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-success" />
                Would you recommend Budget Buddy?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={wouldRecommend === true ? "default" : "outline"}
                  className="flex-1 h-16"
                  onClick={() => setWouldRecommend(true)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">👍</span>
                    <span>Yes, definitely!</span>
                  </div>
                </Button>
                <Button
                  variant={wouldRecommend === false ? "default" : "outline"}
                  className="flex-1 h-16"
                  onClick={() => setWouldRecommend(false)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl">🤔</span>
                    <span>Maybe / Not sure</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Open Feedback */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <CardHeader>
              <CardTitle>Tell Us More</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="challenges">
                  Challenges Encountered
                  <span className="text-muted-foreground font-normal ml-2">(Optional)</span>
                </Label>
                <Textarea
                  id="challenges"
                  placeholder="What difficulties did you face while using Budget Buddy? Were there any features that were confusing or hard to use?"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suggestions">
                  Suggestions for Improvement
                  <span className="text-muted-foreground font-normal ml-2">(Optional)</span>
                </Label>
                <Textarea
                  id="suggestions"
                  placeholder="What features would you like to see added? How can we make Budget Buddy better for students like you?"
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSubmit}
            size="lg"
            className="w-full sm:w-auto px-12"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Feedback
          </Button>
        </div>

        {/* Privacy Note */}
        <p className="text-center text-xs text-muted-foreground">
          Your feedback is anonymous and will only be used for research purposes. 
          Thank you for helping us improve Budget Buddy!
        </p>
      </div>
    </UserLayout>
  );
};

export default Feedback;
