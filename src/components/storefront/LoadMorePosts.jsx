'use client';

import { useState } from 'react';
import { getBlogPosts } from '../../../src/actions/blog';
import BlogCard from './BlogCard';

export default function LoadMorePosts({ initialPosts, total, perPage, categoryId }) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const hasMore = posts.length < total;

  const loadMore = async () => {
    setLoading(true);
    try {
      const result = await getBlogPosts({
        page: page + 1,
        perPage,
        categoryId,
      });
      setPosts((prev) => [...prev, ...result.posts]);
      setPage((prev) => prev + 1);
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} horizontal />
      ))}
      {hasMore && (
        <div className="pt-4 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-[#2f0f6b]/30 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </>
            ) : (
              <>Load More ({posts.length} of {total})</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
