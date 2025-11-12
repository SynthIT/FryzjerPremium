import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SafeImage from "@/components/SafeImage";
import Link from "next/link";
import "@/app/globals.css";
import { getAllBlogPosts } from "./data";

export const metadata = {
  title: "Blog - Fryzjerpremium.pl",
  description: "Najnowsze artykuły i porady z branży fryzjerskiej",
};

export default function BlogPage() {
  const blogPosts = getAllBlogPosts();

  return (
    <>
      <Header />
      <main className="blog-page-container">
        <div className="blog-header">
          <h1 className="blog-main-title">Blog</h1>
          <p className="blog-description">
            Zapraszamy do naszego bloga, gdzie znajdziesz najnowsze trendy w branży fryzjerskiej, 
            porady ekspertów oraz inspiracje do stworzenia wyjątkowych fryzur.
          </p>
        </div>
        
        <div className="blog-posts-grid">
          {blogPosts.map((post) => (
            <article key={post.id} className="blog-post-card">
              <div className="blog-post-image-wrapper">
                <SafeImage
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={250}
                  className="blog-post-image"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                  loading="lazy"
                />
              </div>
              <div className="blog-post-content">
                <div className="blog-post-date">{post.date}</div>
                <h2 className="blog-post-title">{post.title}</h2>
                <p className="blog-post-excerpt">{post.excerpt}</p>
                <div className="blog-post-tags">
                  {post.category.map((tag, index) => (
                    <span key={index} className="blog-post-tag">{tag}</span>
                  ))}
                </div>
                <Link href={`/blog/${post.id}`} className="blog-post-read-more">
                  Czytaj więcej →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

