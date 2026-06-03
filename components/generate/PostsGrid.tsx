import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PostIdea } from "@/types/database";

interface PostsGridProps {
  posts: PostIdea[];
}

export function PostsGrid({ posts }: PostsGridProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-mono text-xs uppercase tracking-widest text-[#6b7280]">
        Post Ideas — {posts.length} generated
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {posts.map((post) => (
          <Card key={post.id} className="hover:border-[#2a2a2a] transition-colors">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-snug">{post.title}</p>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {post.format}
                </Badge>
              </div>
              <p className="text-xs text-[#6b7280] leading-relaxed">{post.hook}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                {post.tags.map((tag) => (
                  <span key={tag} className="font-mono text-xs text-[#ff2d55]">
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
