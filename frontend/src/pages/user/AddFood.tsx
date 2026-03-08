import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Plus, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addFoodItem } from "@/lib/storage";
import { FOOD_CATEGORIES } from "@/types/food";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { parseVoiceInput } from "@/lib/voiceParser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AddFood() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("Other");
  const [expiryDate, setExpiryDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse voice input when transcript changes and listening stops
  useEffect(() => {
    if (transcript && !isListening) {
      const parsed = parseVoiceInput(transcript);
      
      setName(parsed.name);
      setQuantity(parsed.quantity);
      setCategory(parsed.category);
      setExpiryDate(parsed.expiryDate);
      
      toast.success("Voice input parsed!", {
        description: `${parsed.name} - ${parsed.quantity}`
      });
    }
  }, [transcript, isListening]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!name || !expiryDate) {
    toast.error("Please provide at least name and expiry date");
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await axios.post(
      `${API_URL}/food`,
      {
        name,
        quantity: quantity || "1",
        category,
        expiryDate,
        addedVia: transcript ? 'voice' : 'manual'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.data.success) {
      toast.success(`${name} added successfully!`, {
        description: "Redirecting to dashboard..."
      });
      
      // Reset form
      setName("");
      setQuantity("");
      setCategory("Other");
      setExpiryDate("");
      resetTranscript();
      
      // Navigate to dashboard (this will auto-refresh the list)
      setTimeout(() => {
        navigate("/");
      }, 500);
    }
  } catch (error: any) {
    console.error('Add food error:', error);
    toast.error(error.response?.data?.message || "Failed to add food item");
  } finally {
    setIsSubmitting(false);
  }
};

  const speakInstructions = () => {
    const utterance = new SpeechSynthesisUtterance(
      "Say: Item name, quantity, category, expiring on date. For example: Banana, 6 pieces, fruits, expiring on 12 Jan 2025"
    );
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Add Food</h1>
        <p className="text-muted-foreground mt-1">Track what's in your kitchen</p>
      </motion.div>

      {/* Voice input */}
      {isSupported && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card p-6">
            <div className="text-center">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Voice Input</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={speakInstructions}
                  className="text-xs"
                >
                  <Volume2 className="h-3 w-3 mr-1" />
                  Help
                </Button>
              </div>

              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={cn(
                  "mx-auto flex h-20 w-20 items-center justify-center rounded-full transition-all shadow-lg",
                  isListening
                    ? "gradient-urgent animate-pulse shadow-urgent/30"
                    : "gradient-primary hover:shadow-primary/30"
                )}
              >
                {isListening ? (
                  <MicOff className="h-8 w-8 text-primary-foreground" />
                ) : (
                  <Mic className="h-8 w-8 text-primary-foreground" />
                )}
              </button>

              <p className="mt-4 text-sm text-muted-foreground">
                {isListening ? "Listening... speak now" : "Tap microphone to speak"}
              </p>

              {/* Example instructions */}
              <div className="mt-4 p-3 bg-accent/20 rounded-lg text-left">
                <p className="text-xs font-medium text-foreground mb-1">Example:</p>
                <p className="text-xs text-muted-foreground">
                  "Banana quantity 6 pieces category fruits expiring on 12 Jan 2025"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Or simply: "Milk 2 liters dairy expires tomorrow"
                </p>
              </div>

              {transcript && (
                <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Heard:</p>
                  <p className="text-sm font-medium text-foreground">"{transcript}"</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Manual form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Food Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Bananas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  placeholder="e.g. 6 pieces"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date *</Label>
              <Input
                id="expiry"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gradient-primary text-primary-foreground hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </>
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}