import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, RefreshCw, Save, Sparkles, Upload, History, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { FOOD_CATEGORIES } from "@/types/food";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type ScanItem = {
  _id: string;
  name: string;
  quantity: string;
  category: string;
  expiryDate: string;
  confidenceScore?: number;
  expirySource?: string;
  status?: string;
  notes?: string;
};

type ScanHistoryItem = {
  _id: string;
  createdAt: string;
  totalItemsDetected: number;
  scanStatus: string;
  processingTimeMs?: number;
};

const sourceLabel: Record<string, string> = {
  ocr_detected: "Label detected",
  ai_predicted: "AI predicted",
  manual: "Manual",
  user_input: "Edited"
};

export default function ScanFood() {
  const { token } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scanItems, setScanItems] = useState<ScanItem[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [rawText, setRawText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [savingIds, setSavingIds] = useState<string[]>([]);

  useEffect(() => {
    fetchScanHistory();
  }, []);

  const fetchScanHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await axios.get(`${API_URL}/food/scan-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setScanHistory(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load scan history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const stats = useMemo(() => ({
    total: scanItems.length,
    predicted: scanItems.filter((item) => item.expirySource === "ai_predicted").length,
    detected: scanItems.filter((item) => item.expirySource === "ocr_detected").length
  }), [scanItems]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setScanItems([]);
    setRawText("");
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleScan = async () => {
    if (!file) {
      toast.error("Choose a fridge image first");
      return;
    }

    try {
      setIsScanning(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(`${API_URL}/food/scan`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      const data = response.data.data;
      setScanItems(data.items || []);
      setRawText(data.rawText || "");
      toast.success(`Detected ${data.totalDetected} item(s) from your fridge`);
      fetchScanHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  const updateScanItem = (id: string, key: keyof ScanItem, value: string) => {
    setScanItems((items) =>
      items.map((item) =>
        item._id === id
          ? {
              ...item,
              [key]: value,
              expirySource: key === "expiryDate" ? "user_input" : item.expirySource
            }
          : item
      )
    );
  };

  const saveItemChanges = async (item: ScanItem) => {
    try {
      setSavingIds((ids) => [...ids, item._id]);
      const response = await axios.put(
        `${API_URL}/food/${item._id}`,
        {
          name: item.name,
          quantity: item.quantity,
          category: item.category,
          expiryDate: item.expiryDate,
          notes: item.notes,
          expirySource: item.expirySource
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const saved = response.data.data;
        setScanItems((items) => items.map((entry) => (entry._id === saved._id ? saved : entry)));
        toast.success(`${saved.name} updated`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save item");
    } finally {
      setSavingIds((ids) => ids.filter((id) => id !== item._id));
    }
  };

  const resetScanner = () => {
    setFile(null);
    setPreviewUrl(null);
    setScanItems([]);
    setRawText("");
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center">
            <Camera className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Smart Fridge Scan</h1>
            <p className="text-muted-foreground mt-1">
              Upload a fridge photo, detect food items, and review the saved inventory.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <Card className="glass-card p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Capture or Upload</p>
              <p className="text-xs text-muted-foreground mt-1">
                Mobile browsers can open the rear camera directly from this picker.
              </p>
            </div>
            <Button variant="outline" onClick={resetScanner}>
              Reset
            </Button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />

          {!previewUrl ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-border bg-muted/20 px-6 py-16 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-primary" />
              <p className="font-medium text-foreground">Choose a fridge photo</p>
              <p className="text-sm text-muted-foreground mt-1">JPG, PNG, WEBP up to 5MB</p>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl border bg-muted/20">
                <img src={previewUrl} alt="Fridge preview" className="h-[320px] w-full object-cover" />
                {isScanning && (
                  <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                      <p className="text-sm text-foreground">Analyzing fridge image...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleScan} disabled={isScanning} className="gradient-primary text-primary-foreground hover:opacity-90">
                  {isScanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {isScanning ? "Scanning..." : "Detect Items"}
                </Button>
                <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={isScanning}>
                  Choose Another Photo
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 bg-muted/20 border-border/60">
              <p className="text-xs text-muted-foreground">Detected</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{stats.total}</p>
            </Card>
            <Card className="p-4 bg-muted/20 border-border/60">
              <p className="text-xs text-muted-foreground">Label Dates</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{stats.detected}</p>
            </Card>
            <Card className="p-4 bg-muted/20 border-border/60">
              <p className="text-xs text-muted-foreground">Predicted</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{stats.predicted}</p>
            </Card>
          </div>
        </Card>

        <Card className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Recent Scan History</p>
            </div>
            <Button variant="ghost" size="icon" onClick={fetchScanHistory}>
              <RefreshCw className={`h-4 w-4 ${isLoadingHistory ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {isLoadingHistory ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Loading scans...
            </div>
          ) : scanHistory.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Your fridge scans will show up here after the first upload.
            </div>
          ) : (
            <div className="space-y-3">
              {scanHistory.map((entry) => (
                <div key={entry._id} className="rounded-xl border border-border/60 p-3 bg-muted/20">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{entry.totalItemsDetected} item(s) detected</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {entry.scanStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Processing time: {entry.processingTimeMs || 0} ms
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {scanItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Review Detected Items</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Items are already saved. Review and edit anything the scan got wrong.
                </p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Auto-saved
              </Badge>
            </div>

            <div className="grid gap-4">
              {scanItems.map((item) => {
                const isSaving = savingIds.includes(item._id);

                return (
                  <div key={item._id} className="rounded-2xl border border-border/60 p-4 bg-background/70 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {item.confidenceScore ? `${Math.round(item.confidenceScore * 100)}% confidence` : "Detected"}
                      </Badge>
                      <Badge variant="outline">
                        {sourceLabel[item.expirySource || "manual"] || "Detected"}
                      </Badge>
                      {item.status && <Badge variant="outline" className="capitalize">{item.status}</Badge>}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={item.name} onChange={(e) => updateScanItem(item._id, "name", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input value={item.quantity} onChange={(e) => updateScanItem(item._id, "quantity", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <select
                          value={item.category}
                          onChange={(e) => updateScanItem(item._id, "category", e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {FOOD_CATEGORIES.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input
                          type="date"
                          value={item.expiryDate ? item.expiryDate.slice(0, 10) : ""}
                          onChange={(e) => updateScanItem(item._id, "expiryDate", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        value={item.notes || ""}
                        onChange={(e) => updateScanItem(item._id, "notes", e.target.value)}
                        placeholder="Optional corrections or storage notes"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={() => saveItemChanges(item)} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {rawText && (
        <Card className="glass-card p-6">
          <h3 className="text-sm font-medium text-foreground mb-2">OCR Extracted Text</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rawText}</p>
        </Card>
      )}
    </div>
  );
}
