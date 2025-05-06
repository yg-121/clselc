import React from "react";
import { Calendar, Clock, Tag, DollarSign } from "lucide-react";
import { formatDate, isOverdue, formatCurrency } from "../../utils/helpers";

const CaseDetailsCard = ({ caseDetail }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800">
        <FileText className="mr-2 h-5 w-5 text-blue-500" /> Case Details
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-start">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Started</p>
              <p className="font-medium">
                {formatDate(caseDetail.createdAt || new Date().toISOString())}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Deadline</p>
              <p className={`font-medium ${
                isOverdue(caseDetail.deadline) ? "text-red-600" : ""
              }`}>
                {formatDate(caseDetail.deadline)}
                {isOverdue(caseDetail.deadline) && " (Overdue)"}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <Tag className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Client</p>
              <p className="font-medium">
                {caseDetail.client?.username || "Unknown Client"}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-start">
            <DollarSign className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Bid Amount</p>
              <p className="font-medium">
                {formatCurrency(caseDetail.winning_bid?.amount || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailsCard;