import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import { getBlogPost } from "../data";

interface BlogPostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { id } = await params;
  const post = getBlogPost(id);
  
  if (!post) {
    return {
      title: "Wpis nie znaleziony - Fryzjerpremium.pl",
    };
  }

  return {
    title: `${post.title} - Fryzjerpremium.pl`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  const post = getBlogPost(id);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="blog-single-page-container">
        <div className="blog-single-header">
          <div className="blog-single-meta">
            <span className="blog-single-date">{post.date}</span>
            <span className="blog-single-author">Autor: {post.author}</span>
          </div>
          <h1 className="blog-single-title">{post.title}</h1>
          <div className="blog-single-tags">
            {post.category.map((tag, index) => (
              <span key={index} className="blog-single-tag">{tag}</span>
            ))}
          </div>
        </div>

        <div className="blog-single-hero-image">
          <SafeImage
            src={post.heroImage}
            alt={post.title}
            width={1200}
            height={600}
            className="blog-single-hero-img"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1000px"
            priority
          />
        </div>

        <div className="blog-single-content">
          <div className="blog-single-introduction">
            <h2 className="blog-single-section-title">Wprowadzenie</h2>
            <p className="blog-single-text">{post.content.introduction}</p>
          </div>

          {post.content.sections.map((section, index) => (
            <div key={index} className="blog-single-section">
              <h2 className="blog-single-section-title">{section.title}</h2>
              <p className="blog-single-text">{section.content}</p>
              {section.points && section.points.length > 0 && (
                <ul className="blog-single-list">
                  {section.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="blog-single-list-item">
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {post.content.conclusion && (
            <div className="blog-single-conclusion">
              <h2 className="blog-single-section-title">Podsumowanie</h2>
              <p className="blog-single-text">{post.content.conclusion}</p>
            </div>
          )}

          <div className="blog-single-back">
            <Link href="/blog" className="blog-single-back-link">
              ← Powrót do bloga
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

