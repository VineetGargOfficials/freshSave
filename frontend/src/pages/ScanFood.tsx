import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Camera, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Mock food detection results for demo
const MOCK_DETECTIONS = [
  { label: "Apple", confidence: 0.95 },
  { label: "Milk Carton", confidence: 0.88 },
  { label: "Eggs", confidence: 0.92 },
  { label: "Bread", confidence: 0.85 },
  { label: "Tomato", confidence: 0.91 },
  { label: "Cheese", confidence: 0.78 },
];

export default function ScanFood() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detections, setDetections] = useState<{ label: string; confidence: number }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setDetections([]);
  };

  const handleDetect = () => {
    setDetecting(true);
    // Simulate AI detection
    setTimeout(() => {
      const count = 2 + Math.floor(Math.random() * 4);
      const shuffled = [...MOCK_DETECTIONS].sort(() => Math.random() - 0.5).slice(0, count);
      setDetections(shuffled);
      setDetecting(false);
      toast.success(`Detected ${shuffled.length} food items!`);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Scan Food</h1>
        <p className="text-muted-foreground mt-1">Upload a fridge photo to detect items</p>
      </motion.div>

      <Card className="glass-card p-6">
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileRef} onChange={handleFile} />

        {!imageUrl ? (
          <div
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <Camera className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">Take a photo or upload</p>
            <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden">
              <img src={imageUrl} alt="Food" className="w-full h-64 object-cover" />
              {detecting && (
                <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDetect} disabled={detecting} className="flex-1 gradient-primary text-primary-foreground hover:opacity-90">
                {detecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                {detecting ? "Detecting..." : "Detect Food Items"}
              </Button>
              <Button variant="outline" onClick={() => { setImageUrl(null); setDetections([]); }}>Reset</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Detection results */}
      {detections.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card p-5">
            <p className="text-sm font-medium text-muted-foreground mb-3">Detected Items</p>
            <div className="space-y-2">
              {detections.map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between rounded-lg bg-accent/50 px-4 py-2.5"
                >
                  <span className="font-medium text-foreground">{d.label}</span>
                  <Badge variant="outline" className="text-xs">{(d.confidence * 100).toFixed(0)}%</Badge>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              🔬 Demo mode — connect YOLOv8 backend for real detection
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
