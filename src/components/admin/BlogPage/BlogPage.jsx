import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Blogpage.css";
import { hostname } from "../../../Utils/api/apiUtils";
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
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/blog`);

      if (!response.ok) {
        throw new Error("Failed to fetch blog");
      }

      const result = await response.json();

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
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) -
              new Date(a.updatedAt || a.createdAt)
          )
          .slice(0, 5);
        setLatestBlogs(latest);
      } else {
        setError("Blog not found");
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      setError("Unable to load blog.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

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

  return (
    <>
      <div className="blog-header">
        <Header />
      </div>

      <main className="tripoFullBlogPage">
        <div className="container">
          <div className="blog-content">
            <div className="blog-left">
              {/* Blog Image */}

              {/* Date */}

              {/* Title */}
              <h1 className="tripoFullBlogTitle">{blog.title}</h1>

              {blog.image && (
                <div className="tripoFullBlogHero">
                  <img
                    src={blog.image}
                    alt={blog.imageAlt || blog.title}
                    className="tripoFullBlogHeroImage"
                  />
                </div>
              )}

              <div className="tripoFullBlogDate">
                <span>Published</span>

                <strong>{formatDate(blog.updatedAt || blog.createdAt)}</strong>
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
                  {latestBlogs.map((latestBlog) => (
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
                            className="tripoLatestBlogImage"
                          />
                        </div>
                      )}

                      <div className="tripoLatestBlogInfo">
                        <h3 className="tripoLatestBlogTitle">
                          {latestBlog.title}
                        </h3>

                        <div className="tripoLatestBlogDate">
                          {formatDate(
                            latestBlog.updatedAt || latestBlog.createdAt
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
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
