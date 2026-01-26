import { Link } from "wouter";
import { useEffect, useState } from "react";

interface Post {
  slug: string;
  title: string;
  date: string;
  author: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch("/blog/posts.json");
      const data = await response.json();
      setPosts(data);
    };

    fetchPosts();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}>
            <a className="block p-4 border rounded-lg hover:bg-gray-100">
              <h2 className="text-xl font-bold">{post.title}</h2>
              <p className="text-gray-500">{post.date} by {post.author}</p>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
