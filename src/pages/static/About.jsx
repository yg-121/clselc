import React from "react";
import StaticPageLayout from "../../components/layout/StaticPageLayout";

export default function About() {
  return (
    <StaticPageLayout title="About Us">
      <p className="text-lg text-gray-700 mb-6">
        LegalConnect Ethiopia is a pioneering platform that bridges the gap between clients and legal professionals across Ethiopia.
      </p>
      
      <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Our Mission</h2>
      <p className="text-gray-700 mb-6">
        Our mission is to make legal services accessible, transparent, and efficient for all Ethiopians. We believe that everyone deserves access to quality legal representation regardless of their location or background.
      </p>
      
      <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Our Vision</h2>
      <p className="text-gray-700 mb-6">
        We envision a future where legal services in Ethiopia are easily accessible, where the process of finding and engaging with legal professionals is streamlined, and where the legal system works efficiently for all citizens.
      </p>
      
      <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Our Team</h2>
      <p className="text-gray-700 mb-6">
        LegalConnect Ethiopia was founded by a team of legal professionals and technology experts who recognized the challenges faced by both clients seeking legal help and lawyers looking to expand their practice.
      </p>
      
      <div className="bg-blue-50 p-6 rounded-lg mt-8">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">Join Our Community</h3>
        <p className="text-gray-700">
          Whether you're a client seeking legal assistance or a lawyer looking to grow your practice, LegalConnect Ethiopia provides the platform you need to succeed.
        </p>
      </div>
    </StaticPageLayout>
  );
}