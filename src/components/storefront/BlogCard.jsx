import Link from 'next/link';

export default function BlogCard({ post, horizontal = true }) {
  const excerpt = post.metaDescription || (post.content ? post.content.replace(/<[^>]+>/g, '').slice(0, 150) + '...' : '');
  const date = new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (!horizontal) {
    return (
      <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/50 dark:hover:shadow-lg dark:hover:shadow-slate-900/30">
        <Link href={`/blogs/${post.slug}`} className="block overflow-hidden">
          {post.bannerImage ? (
            <img src={post.bannerImage} alt={post.title} className="h-48 w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-500">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {post.category && (
               <Link href={`/blogs/category/${post.category.slug}`} className="font-medium text-[#2f0f6b] hover:underline dark:text-[#a78bfa]">{post.category.title}</Link>
            )}
            <span>&middot;</span>
            <time dateTime={post.createdAt}>{date}</time>
            {post.category?.authorName && (
              <><span>&middot;</span><span>{post.category.authorName}</span></>
            )}
          </div>
          <Link href={`/blogs/${post.slug}`} className="mt-2 block">
            <h2 className="text-lg font-semibold text-slate-900 line-clamp-2 group-hover:text-[#2f0f6b] transition-colors dark:text-white dark:group-hover:text-[#a78bfa]">{post.title}</h2>
          </Link>
          <p className="mt-2 text-sm text-slate-500 line-clamp-3 dark:text-slate-400">{excerpt}</p>
          <div className="mt-4 flex items-center gap-2">
            {post.tags && post.tags.split(',').slice(0, 3).map((tag) => (
              <span key={tag.trim()} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">{tag.trim()}</span>
            ))}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/50 dark:hover:shadow-lg dark:hover:shadow-slate-900/30 md:flex-row">
      <Link href={`/blogs/${post.slug}`} className="block w-full shrink-0 overflow-hidden md:w-72">
        {post.bannerImage ? (
          <img src={post.bannerImage} alt={post.title} className="h-48 w-full object-cover transition duration-300 group-hover:scale-105 md:h-full" loading="lazy" />
        ) : (
          <div className="flex h-48 items-center justify-center bg-slate-100 text-slate-300 dark:bg-slate-700 dark:text-slate-500 md:h-full">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col justify-center p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          {post.category && (
            <Link href={`/blogs/category/${post.category.slug}`} className="font-medium text-[#2f0f6b] hover:underline dark:text-[#a78bfa]">{post.category.title}</Link>
          )}
          <span>&middot;</span>
          <time dateTime={post.createdAt}>{date}</time>
        </div>
        <Link href={`/blogs/${post.slug}`} className="mt-2 block">
          <h2 className="text-base md:text-xl font-semibold text-slate-900 line-clamp-2 group-hover:text-[#2f0f6b] transition-colors dark:text-white dark:group-hover:text-[#a78bfa]">
            {post.title}
          </h2>
        </Link>
        <p className="mt-2 text-sm text-slate-500 line-clamp-2 dark:text-slate-400">{excerpt}</p>
        <div className="mt-3 hidden md:flex items-center gap-2">
          {post.tags && post.tags.split(',').slice(0, 3).map((tag) => (
            <span key={tag.trim()} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">{tag.trim()}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
