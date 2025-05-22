import React from "react";
import StaticPageLayout from "../../components/layout/StaticPageLayout";
import { Shield, Gavel, Users, Building, HomeIcon, Briefcase } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: <Building className="h-8 w-8 text-blue-600" />,
      title: "Business Law",
      description: "Expert guidance on business registration, contracts, commercial disputes, and corporate compliance in Ethiopia."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Family Law",
      description: "Compassionate legal assistance for marriage, divorce, child custody, and inheritance matters."
    },
    {
      icon: <Gavel className="h-8 w-8 text-blue-600" />,
      title: "Criminal Law",
      description: "Strong defense representation for criminal cases, investigations, and appeals."
    },
    {
      icon: <HomeIcon className="h-8 w-8 text-blue-600" />,
      title: "Property Law",
      description: "Comprehensive legal services for land rights, real estate transactions, and property disputes."
    },
    {
      icon: <Briefcase className="h-8 w-8 text-blue-600" />,
      title: "Labor Law",
      description: "Protection of rights in employment contracts, workplace disputes, and compensation claims."
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Intellectual Property",
      description: "Safeguarding your creative works through patents, trademarks, copyrights, and IP protection strategies."
    }
  ];

  return (
    <StaticPageLayout title="Our Services">
      <p className="text-lg text-gray-700 mb-8">
        LegalConnect Ethiopia offers a wide range of legal services through our network of qualified and experienced lawyers. Whatever your legal needs, we can connect you with the right professional.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        {services.map((service, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                {service.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg mt-12">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">Need a Custom Service?</h3>
        <p className="text-gray-700 mb-4">
          If you don't see the specific legal service you need, you can still post your case on our platform and receive bids from qualified lawyers.
        </p>
        <a href="/client/cases/post" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Post Your Case
        </a>
      </div>
    </StaticPageLayout>
  );
}