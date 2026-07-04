import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listBlogs, listCategories, listTags } from '@/api/blogs'
import { listAllComments } from '@/api/comments'
import { listFriendLinks, listGuestbook } from '@/api/social'

interface Stats {
  blogs: number
  categories: number
  tags: number
  comments: number
  guestbook: number
  friendLinks: number
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    blogs: 0,
    categories: 0,
    tags: 0,
    comments: 0,
    guestbook: 0,
    friendLinks: 0,
  })

  useEffect(() => {
    Promise.all([
      listBlogs({ page: 1, page_size: 1 })
        .then((d) => d.total)
        .catch(() => 0),
      listCategories()
        .then((d) => d.length)
        .catch(() => 0),
      listTags()
        .then((d) => d.length)
        .catch(() => 0),
      listAllComments(1, 1)
        .then((d) => d.total)
        .catch(() => 0),
      listGuestbook(1, 1)
        .then((d) => d.total)
        .catch(() => 0),
      listFriendLinks()
        .then((d) => d.length)
        .catch(() => 0),
    ]).then(([blogs, categories, tags, comments, guestbook, friendLinks]) => {
      setStats({ blogs, categories, tags, comments, guestbook, friendLinks })
    })
  }, [])

  const items = [
    { label: '文章', value: stats.blogs, to: '/admin/blogs' },
    { label: '分类', value: stats.categories, to: '/admin/categories' },
    { label: '标签', value: stats.tags, to: '/admin/tags' },
    { label: '评论', value: stats.comments, to: '/admin/comments' },
    { label: '留言', value: stats.guestbook, to: '/admin/guestbook' },
    { label: '友链', value: stats.friendLinks, to: '/admin/friend-links' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          className="rounded-2xl bg-white p-5 outline outline-1 outline-gray-950/5 transition-colors hover:bg-gray-950/2.5 dark:bg-gray-950 dark:outline-white/10 dark:hover:bg-white/2.5"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
          <p className="mt-2 text-3xl font-medium text-gray-950 tabular-nums dark:text-white">
            {item.value}
          </p>
        </Link>
      ))}
    </div>
  )
}
