import React from "react";

export default function StaticPageLayout({ title, children, bgColor = "bg-white" }) {
  return (
    <div className={`${bgColor} py-12`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 pb-2 border-b border-gray-200">
          {title}
        </h1>
        <div className="prose prose-blue max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}