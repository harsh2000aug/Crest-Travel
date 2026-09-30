import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./Blogpage.css";
import { fetchPublicBlogs, hostname } from "../../../Utils/api/apiUtils";
import Footer from "../../../reuseable-components/Footer";
import Header from "../../../reuseable-components/Header";

const BlogPage = () => {
  const { slug } = useParams();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [latestBlogs, setLatestBlogs] = useState([]);
  const API_BASE_URL = hostname();

  useEffect(() => {
    const controller = new AbortController();
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await fetchPublicBlogs(controller.signal);

        if (result.success) {
          const blogs = Array.isArray(result.data) ? result.data : [];
          const selectedBlog = blogs.find((item) => item.slug === slug);
          if (selectedBlog) {
            setBlog(selectedBlog);
          } else {
            setBlog(null);
            setError("Blog not found");
          }
          const latest = blogs
            .filter((item) => item.slug !== slug)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
          setLatestBlogs(latest);
        } else {
          setError("Blog not found");
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Error fetching blog:", error);
        setError("Unable to load blog.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchBlog();
    return () => controller.abort();
  }, [slug, API_BASE_URL]);

  const formatDate = (dateString) => {
    if (!dateString) return "";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const blogSchema = useMemo(() => {
    if (!blog?.schemaCode) return "";

    const rawSchema = blog.schemaCode
      .replace(/<script[^>]*>/gi, "")
      .replace(/<\/script>/gi, "")
      .trim();

    try {
      JSON.parse(rawSchema);
      return rawSchema;
    } catch (error) {
      console.error("Invalid schemaCode JSON for blog:", blog.slug, error);
      return "";
    }
  }, [blog?.schemaCode, blog?.slug]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="tripoFullBlogPage">
        <div className="tripoFullBlogLoading">
          <div className="tripoFullBlogSpinner"></div>
          <p>Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <>
        <Header />

        <div className="tripoFullBlogPage">
          <div className="tripoFullBlogError">
            <h2>Blog Not Found</h2>

            <p>{error || "The blog you are looking for does not exist."}</p>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  const metaTitle = blog.metaTitle || blog.title || "Crest Travel Club";
  const metaDescription =
    blog.metaDescription ||
    blog.shortDescription ||
    "Discover exclusive travel benefits with Crest Travel Club.";
  const blogUrl = `https://www.cresttravelclub.com/blogs/${blog.slug}`;
  let ogImage = (blog.image || "").replace(/^http:\/\//, "https://");
  if (ogImage && !ogImage.startsWith("https://") && !ogImage.startsWith("blob:")) {
    const cleanPath = ogImage.startsWith("/") ? ogImage.slice(1) : ogImage;
    const cleanBase = API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;
    ogImage = `${cleanBase}/${cleanPath}`;
  }

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={blogUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:url" content={blogUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Crest Travel Club" />
        <meta
          property="og:image:alt"
          content={blog.imageAlt || blog.title || "Crest Travel Club"}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        {blogSchema && (
          <script id="blog-schema" type="application/ld+json">
            {blogSchema}
          </script>
        )}
      </Helmet>

      <div className="blog-header">
        <Header />
      </div>

      <main className="tripoFullBlogPage">
        <div className="container">
          <div className="blog-content">
            <div className="blog-left">
              {/* Title */}
              <h1 className="tripoFullBlogTitle">{blog.title}</h1>

              {blog.image && (
                <div className="tripoFullBlogHero">
                  <img
                    src={blog.image}
                    alt={blog.imageAlt || blog.title}
                    width={660}
                    height={320}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className="tripoFullBlogHeroImage"
                  />
                </div>
              )}

              <div className="tripoFullBlogDate">
                <span>Published</span>

                <strong>{formatDate(blog.createdAt)}</strong>
              </div>

              <div className="tripoFullBlogAuthorBoxContent">
                <span className="tripoFullBlogWrittenBy">Written by</span>

                <h3 className="tripoFullBlogAuthorBoxName">
                  {blog.authorName || "Admin"}
                </h3>

                {blog.instagramLink && (
                  <a
                    href={blog.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tripoFullBlogInstagram"
                  >
                    Instagram
                  </a>
                )}
              </div>

              {/* Description */}
              {blog.shortDescription && (
                <p className="tripoFullBlogDescription">
                  {blog.shortDescription}
                </p>
              )}

              {/* Blog Content */}
              <article className="tripoFullBlogContent">
                <div
                  dangerouslySetInnerHTML={{
                    __html: blog.content || "",
                  }}
                />
              </article>

              {/* Author */}
              <section className="tripoFullBlogAuthorBox">
                {blog.authorImage && (
                  <img
                    src={blog.authorImage}
                    alt={blog.authorName || "Author"}
                    width={80}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    className="tripoFullBlogAuthorBoxImage"
                  />
                )}

                <div className="tripoFullBlogAuthorBoxContent">
                  <span className="tripoFullBlogWrittenBy">Written by</span>

                  <h3 className="tripoFullBlogAuthorBoxName">
                    {blog.authorName || "Admin"}
                  </h3>

                  {blog.authorBio && (
                    <p className="tripoFullBlogAuthorBoxBio">
                      {blog.authorBio}
                    </p>
                  )}

                  {blog.instagramLink && (
                    <a
                      href={blog.instagramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tripoFullBlogInstagram"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </section>
            </div>
            <div className="blog-right">
              <aside className="tripoLatestBlogsSidebar">
                <h2 className="tripoLatestBlogsHeading">Latest Blogs</h2>

                <div className="tripoLatestBlogsList">
                  {latestBlogs.length > 0 ? (
                    latestBlogs.map((latestBlog) => (
                      <Link
                        key={latestBlog._id || latestBlog.id || latestBlog.slug}
                        to={`/blogs/${latestBlog.slug}`}
                        className="tripoLatestBlogCard"
                      >
                        {latestBlog.image && (
                          <div className="tripoLatestBlogImageWrapper">
                            <img
                              src={latestBlog.image}
                              alt={latestBlog.imageAlt || latestBlog.title}
                              width={100}
                              height={75}
                              className="tripoLatestBlogImage"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                        )}

                        <div className="tripoLatestBlogInfo">
                          <h3 className="tripoLatestBlogTitle">
                            {latestBlog.title}
                          </h3>

                          <div className="tripoLatestBlogDate">
                            {formatDate(latestBlog.createdAt)}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="noCurrentBlog">No blogs available.</div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default BlogPage;
