import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addFoodItem } from "@/lib/storage";
import { FOOD_CATEGORIES } from "@/types/food";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AddFood() {
  const navigate = useNavigate();
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition();

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("Other");
  const [expiryDate, setExpiryDate] = useState("");

  // Parse voice input
  useEffect(() => {
    if (transcript && !isListening) {
      // Simple parsing: try to extract food name from transcript
      setName(transcript.trim());
      toast.info(`Heard: "${transcript}"`);
    }
  }, [transcript, isListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !expiryDate) {
      toast.error("Please fill in name and expiry date");
      return;
    }
    addFoodItem({ name, quantity: quantity || "1", category, expiryDate });
    toast.success(`${name} added!`);
    navigate("/");
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
          <Card className="glass-card p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-3">Voice Input</p>
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={cn(
                "mx-auto flex h-16 w-16 items-center justify-center rounded-full transition-all",
                isListening
                  ? "gradient-urgent animate-pulse shadow-lg shadow-urgent/30"
                  : "gradient-primary hover:shadow-lg hover:shadow-primary/30"
              )}
            >
              {isListening ? <MicOff className="h-7 w-7 text-primary-foreground" /> : <Mic className="h-7 w-7 text-primary-foreground" />}
            </button>
            <p className="mt-3 text-sm text-muted-foreground">
              {isListening ? "Listening... say a food item" : "Tap to speak"}
            </p>
            {transcript && (
              <p className="mt-2 text-sm font-medium text-foreground">"{transcript}"</p>
            )}
          </Card>
        </motion.div>
      )}

      {/* Manual form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Food Name</Label>
              <Input id="name" placeholder="e.g. Bananas" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" placeholder="e.g. 6 pieces" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FOOD_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input id="expiry" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
