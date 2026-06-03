import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Caption } from "@/types/database";

interface CaptionsPanelProps {
  captions: Caption[];
}

export function CaptionsPanel({ captions }: CaptionsPanelProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-mono text-xs uppercase tracking-widest text-[#6b7280]">
        Captions — {captions.length} localized
      </h2>
      <div className="space-y-4">
        {captions.map((caption) => (
          <Card key={caption.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#ff2d55] uppercase tracking-widest">
                  {caption.context}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="font-mono text-xs uppercase tracking-widest text-[#4a4a4a]">English</p>
                  <p className="text-sm leading-relaxed text-white">{caption.english}</p>
                </div>
                <div className="space-y-1 border-t border-[#1a1a1a] pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0">
                  <p className="font-mono text-xs uppercase tracking-widest text-[#4a4a4a]">小红书 Chinese</p>
                  <p className="text-sm leading-relaxed text-white">{caption.chinese}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
