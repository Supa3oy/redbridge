import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TimeAgo } from "@/components/ui/time-ago";
import type { ToolkitResult } from "@/types/database";

interface ToolkitCardProps {
  id: string;
  brandName: string;
  result: ToolkitResult;
  createdAt: string;
}

export function ToolkitCard({ id, brandName, result, createdAt }: ToolkitCardProps) {
  return (
    <Link href={`/saved/${id}`}>
    <Card className="hover:border-[#2a2a2a] transition-colors cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{brandName}</CardTitle>
          <TimeAgo dateStr={createdAt} className="font-mono text-xs text-[#6b7280]" />
        </div>
        <CardDescription>
          {result.posts?.length ?? 0} posts · {result.keywords?.length ?? 0} keywords · {result.captions?.length ?? 0} captions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {result.keywords?.slice(0, 4).map((kw) => (
            <Badge key={kw.id} variant="secondary">
              {kw.chinese}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
