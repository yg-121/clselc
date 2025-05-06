import React from "react";
import { FileText, Calendar, MessageSquare, BarChart2, File } from "lucide-react";

const TabsNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: <FileText className="h-4 w-4 mr-2" />,
    },
    {
      id: "documents",
      label: "Documents",
      icon: <File className="h-4 w-4 mr-2" />,
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: <Calendar className="h-4 w-4 mr-2" />,
    },
    {
      id: "notes",
      label: "Notes",
      icon: <MessageSquare className="h-4 w-4 mr-2" />,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart2 className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-md mb-6 overflow-hidden">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-3 text-sm font-medium transition-colors duration-300 ${
              activeTab === tab.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabsNavigation;



