import React from "react";
import StaticPageLayout from "../../components/layout/StaticPageLayout";
import { Calendar, User, Tag } from "lucide-react";

export default function Blog() {
  const blogPosts = [
    {
      title: "Understanding Ethiopian Property Law: A Guide for Homeowners",
      excerpt: "Property ownership in Ethiopia has unique characteristics. This guide explains the key aspects of Ethiopian property law that every homeowner should know.",
      date: "June 15, 2023",
      author: "Abebe Kebede",
      category: "Property Law",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80"
    },
    {
      title: "Business Registration in Ethiopia: Step-by-Step Process",
      excerpt: "Starting a business in Ethiopia requires navigating specific legal procedures. Learn about the registration process, required documents, and common pitfalls to avoid.",
      date: "May 22, 2023",
      author: "Sara Mohammed",
      category: "Business Law",
      image: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      title: "Family Law Updates: Recent Changes in Ethiopian Divorce Proceedings",
      excerpt: "Recent amendments to Ethiopian family law have changed how divorce cases are handled. This article explains the key changes and their implications.",
      date: "April 10, 2023",
      author: "Tigist Haile",
      category: "Family Law",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80"
    }
  ];

  return (
    <StaticPageLayout title="Legal Blog">
      <p className="text-lg text-gray-700 mb-8">
        Stay informed about Ethiopian legal matters with our regularly updated blog. Our articles are written by experienced legal professionals to help you understand complex legal topics.
      </p>
      
      <div className="space-y-10 mt-8">
        {blogPosts.map((post, index) => (
          <div key={index} className="border-b border-gray-200 pb-8 last:border-0">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <div className="md:w-2/3">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {post.title}
                </h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    <span>{post.category}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  {post.excerpt}
                </p>
                <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                  Read more →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg mt-12">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">Subscribe to Our Newsletter</h3>
        <p className="text-gray-700 mb-4">
          Get the latest legal updates and articles delivered directly to your inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            type="email" 
            placeholder="Your email address" 
            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </StaticPageLayout>
  );
}