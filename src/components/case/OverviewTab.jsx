import {
  Calendar,
  Tag,
  DollarSign,
  User,
  MapPin,
  Phone,
  FileText,
  Mail,
} from "lucide-react";

const OverviewTab = ({ caseDetail, formatDate, formatCurrency, isOverdue }) => {
  return (
    <div className="space-y-6">
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
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Deadline</p>
                <p
                  className={`font-medium ${
                    isOverdue(caseDetail.deadline) ? "text-red-600" : ""
                  }`}
                >
                  {formatDate(caseDetail.deadline || new Date().toISOString())}
                  {isOverdue(caseDetail.deadline) && (
                    <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                      Overdue
                    </span>
                  )}
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
          <div className="space-y-3">
            <div className="flex items-start">
              <User className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Client</p>
                <p className="font-medium">
                  {caseDetail.client?.username || "Unknown Client"}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Client Location</p>
                <p className="font-medium">
                  {caseDetail.client?.location || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Client Phone</p>
                <p className="font-medium">
                  {caseDetail.client?.phone || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Client Email</p>
                <p className="font-medium">
                  {caseDetail.client?.email || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
