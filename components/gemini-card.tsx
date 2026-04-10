"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface GeminiCardProps {
  amenities: string[];
}

export function GeminiCard({ amenities }: GeminiCardProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (amenities.length > 0) {
      const fetchDescription = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `/api/gemini?amenities=${amenities.join(",")}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch description");
          }
          const data = await response.json();
          let i = 0;
          const txt = data.description;
          const speed = 50;

          function typeWriter() {
            if (i < txt.length) {
              setDescription((prev) => prev + txt.charAt(i));
              i++;
              setTimeout(typeWriter, speed);
            } else {
              setLoading(false);
            }
          }
          typeWriter();
        } catch (error) {
          console.error(error);
          setLoading(false);
        }
      };
      fetchDescription();
    }
  }, [amenities]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">
          AI-Powered Summary
        </CardTitle>
        <Sparkles className="h-6 w-6 text-yellow-400" />
      </CardHeader>
      <CardContent>
        {loading && !description && <p>Generating description...</p>}
        <p className="text-lg text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}