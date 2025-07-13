import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

import sp500 from "@/data/sp500-with-logos.json";
import nasdaq from "@/data/nasdaq100-with-logos.json";

interface Prediction {
  date: string;
  predicted_price: number;
}
interface Company {
  symbol: string;
  logo: string;
}

export default function Home() {
  const [index, setIndex] = useState("sp500");
  const [companies, setCompanies] = useState<Company[]>(sp500);
  const [symbol, setSymbol] = useState(sp500[0].symbol);
  const [days, setDays] = useState(365);
  const [buyPrice, setBuyPrice] = useState(100);
  const [shareCount, setShareCount] = useState(10);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const data = index === "sp500" ? sp500 : nasdaq;
    setCompanies(data);
    setSymbol(data[0].symbol);
  }, [index]);

  const fetchPredictions = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, days: 365 })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setPredictions([]);
      } else {
        setPredictions(data.predictions);
      }
    } catch {
      setError("API error");
      setPredictions([]);
    }
    setLoading(false);
  };

  const lastPrice = predictions.at(-1)?.predicted_price || 0;
  const price6Months = predictions[180]?.predicted_price || 0;
  const price1Year = predictions[364]?.predicted_price || 0;

  const total = buyPrice * shareCount;
  const profit = lastPrice * shareCount - total;

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-900 to-black text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl space-y-10">
        <h1 className="text-4xl font-bold text-center">📈 AI Stock Predictor</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-sm">Select Index</label>
              <Select onValueChange={setIndex} defaultValue="sp500">
                <SelectTrigger className="w-full bg-white text-black">
                  <SelectValue placeholder="Select Index" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sp500">S&P 500</SelectItem>
                  <SelectItem value="nasdaq100">Nasdaq 100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm">Select Company</label>
              <Select onValueChange={setSymbol} value={symbol}>
                <SelectTrigger className="w-full bg-white text-black">
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(({ symbol, logo }) => (
                    <SelectItem key={symbol} value={symbol}>
                      <div className="flex items-center gap-2">
                        <img src={logo} alt={symbol} className="w-5 h-5 rounded-full" />
                        {symbol}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm">Buy Price ($)</label>
              <Input
                type="number"
                value={buyPrice}
                onChange={(e) => setBuyPrice(Number(e.target.value))}
                className="bg-white text-black"
              />
            </div>

            <div>
              <label className="text-sm">Number of Shares</label>
              <Input
                type="number"
                value={shareCount}
                onChange={(e) => setShareCount(Number(e.target.value))}
                className="bg-white text-black"
              />
            </div>

            <div>
              <label className="text-sm">Days to Predict</label>
              <Input
                type="number"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="bg-white text-black"
              />
            </div>

            <Button onClick={fetchPredictions} className="w-full mt-2">
              {loading ? "Predicting..." : "Predict"}
            </Button>

            {error && <p className="text-red-500">{error}</p>}
          </div>

          <Card className="bg-white/5 backdrop-blur border border-white/10">
            <CardContent className="p-6 space-y-3 text-white">
              <h2 className="text-xl font-semibold">Prediction Result</h2>
              <p>📅 6 Months Price: <b>${price6Months.toFixed(2)}</b></p>
              <p>📅 1 Year Price: <b>${price1Year.toFixed(2)}</b></p>
              <p>📌 Estimated future price: <b>${lastPrice.toFixed(2)}</b></p>
              <p>💰 Total investment: <b>${total.toFixed(2)}</b></p>
              <p className={profit >= 0 ? "text-green-400" : "text-red-400"}>
                Profit / Loss: <b>{profit >= 0 ? "+" : ""}${profit.toFixed(2)}</b>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Grafik */}
        {predictions.length > 0 && (
          <div className="w-full h-[300px] bg-zinc-800 p-4 rounded-lg shadow">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictions.slice(0, 30)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, "Predicted"]}
                  labelFormatter={(label) => `📅 ${label}`}
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #4F46E5",
                    borderRadius: "0.5rem",
                    color: "#fff"
                  }}
                  labelStyle={{ color: "#ccc" }}
                  itemStyle={{ color: "#93c5fd" }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted_price"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </main>
  );
}
