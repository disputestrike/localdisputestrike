import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import Markdown from "react-markdown";

export default function BlogPost() {
  const [content, setContent] = useState("");
  const [match, params] = useRoute("/blog/:slug");

  useEffect(() => {
    if (params?.slug) {
      const fetchPost = async () => {
        const response = await fetch(`/blog/${params.slug}.md`);
        const text = await response.text();
        setContent(text);
      };

      fetchPost();
    }
  }, [params?.slug]);

  return (
    <div className="p-8">
      <Markdown>{content}</Markdown>
    </div>
  );
}
