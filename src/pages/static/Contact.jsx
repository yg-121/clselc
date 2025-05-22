import React, { useState } from "react";
import StaticPageLayout from "../../components/layout/StaticPageLayout";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage({
        type: "success",
        text: "Thank you for your message! We'll get back to you soon."
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitMessage(null);
      }, 5000);
    }, 1500);
  };

  return (
    <StaticPageLayout title="Contact Us">
      <p className="text-lg text-gray-700 mb-8">
        Have questions or feedback? We'd love to hear from you. Use the form below or reach out through our contact information.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">Email Us</h3>
                <p className="text-gray-600">
                  <a href="mailto:info@legalconnect-ethiopia.com" className="hover:text-blue-600">
                    info@legalconnect-ethiopia.com
                  </a>
                </p>
                <p className="text-gray-600">
                  <a href="mailto:support@legalconnect-ethiopia.com" className="hover:text-blue-600">
                    support@legalconnect-ethiopia.com
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">Call Us</h3>
                <p className="text-gray-600">
                  <a href="tel:+251911234567" className="hover:text-blue-600">
                    +251 911 234 567
                  </a>
                </p>
                <p className="text-gray-600">
                  <a href="tel:+251911234568" className="hover:text-blue-600">
                    +251 911 234 568
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">Visit Us</h3>
                <p className="text-gray-600">
                  Bole Road, Friendship Building<br />
                  4th Floor, Office 405<br />
                  Addis Ababa, Ethiopia
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Send Us a Message</h2>
            
            {submitMessage && (
              <div className={`p-4 mb-4 rounded-lg ${submitMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {submitMessage.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="mt-12">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Location</h3>
        <div className="h-80 bg-gray-200 rounded-lg">
          {/* Replace with actual map component or iframe */}
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <p>Map will be displayed here</p>
          </div>
        </div>
      </div>
    </StaticPageLayout>
  );
}