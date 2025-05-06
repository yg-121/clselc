import { Briefcase, X } from "lucide-react";
import { getStatusBadge } from "./Utils.jsx";

const CaseHeader = ({ caseDetail, onCloseCase, closeLoading }) => {
  return (
    <div className="bg-card text-card-foreground rounded-xl shadow-md p-6 mb-6 border-l-4 border-primary">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              {caseDetail.category || "Untitled Case"}
            </h1>
            {getStatusBadge(caseDetail.status)}
          </div>
          <p className="text-muted-foreground italic ml-9">
            {caseDetail.description || "No description provided"}
          </p>
        </div>
        {caseDetail.status === "assigned" && (
          <button
            onClick={onCloseCase}
            disabled={closeLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-300 flex items-center"
          >
            {closeLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <X className="h-4 w-4 mr-2" />
            )}
            Close Case
          </button>
        )}
      </div>
    </div>
  );
};

export default CaseHeader;




