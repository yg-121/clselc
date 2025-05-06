import OverviewTab from "./OverviewTab";
import DocumentsTab from "./DocumentsTab";
import NotesTab from "./NotesTab";
import AppointmentsTab from "./AppointmentsTab";
import AnalyticsTab from './AnalyticsTab';
import { useState } from "react";
import { File, Download, Eye, Calendar, Clock, User, MapPin, MessageSquare, Plus } from "lucide-react";

const TabContent = ({
  activeTab,
  caseDetail,
  isDocsOpen,
  toggleDocs,
  appointments,
  appointmentsLoading,
  appointmentsError,
  formatDate,
  formatCurrency,
  isOverdue,
  onAddNote,
  onAddAppointment,
  onRescheduleAppointment,
  onConfirmAppointment,
  onCancelAppointment,
  onCompleteAppointment,
  downloadICSFile,
  showAppointmentActions,
  setShowAppointmentActions,
  appointmentActionsRef,
  selectedAppointment,
  setSelectedAppointment,
  isRescheduleModalOpen, // Add this prop
  setIsRescheduleModalOpen,
  addNoteLoading,
  addNoteError,
  addNoteSuccess,
  addAppointmentLoading,
  addAppointmentError,
  addAppointmentSuccess,
  rescheduleLoading,
  rescheduleError,
  rescheduleSuccess,
  appointmentActionLoading,
  appointmentActionError,
  appointmentActionSuccess,
  refreshCaseDetails,
  setActiveTab,
}) => {
  return (
    <div>
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Case Info */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Case Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Client</p>
                <p className="font-medium flex items-center">
                  <User className="h-4 w-4 mr-2 text-primary" />
                  {caseDetail.client?.username || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Category</p>
                <p className="font-medium">
                  {caseDetail.category || "Uncategorized"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p className="font-medium">{caseDetail.status || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Deadline</p>
                <p className="font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  {caseDetail.deadline
                    ? new Date(caseDetail.deadline).toLocaleDateString()
                    : "No deadline"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Case Description</h2>
            <p className="text-foreground whitespace-pre-wrap">
              {caseDetail.description || "No description provided."}
            </p>
          </div>
        </div>
      )}
      {activeTab === "documents" && (
        <DocumentsTab
          caseDetail={caseDetail}
          isDocsOpen={isDocsOpen}
          toggleDocs={toggleDocs}
          refreshCaseDetails={refreshCaseDetails}
          setActiveTab={setActiveTab}
        />
      )}
      {activeTab === "notes" && (
        <NotesTab
          caseDetail={caseDetail}
          formatDate={formatDate}
          onAddNote={onAddNote}
          addNoteLoading={addNoteLoading}
          addNoteError={addNoteError}
          addNoteSuccess={addNoteSuccess}
          caseId={caseDetail._id}
        />
      )}
      {activeTab === "appointments" && (
        <AppointmentsTab
          appointments={appointments}
          appointmentsLoading={appointmentsLoading}
          appointmentsError={appointmentsError}
          formatDate={formatDate}
          onRescheduleAppointment={onRescheduleAppointment}
          onConfirmAppointment={onConfirmAppointment}
          onCancelAppointment={onCancelAppointment}
          onCompleteAppointment={onCompleteAppointment}
          downloadICSFile={downloadICSFile}
          showAppointmentActions={showAppointmentActions}
          setShowAppointmentActions={setShowAppointmentActions}
          appointmentActionsRef={appointmentActionsRef}
          selectedAppointment={selectedAppointment}
          setSelectedAppointment={setSelectedAppointment}
          isRescheduleModalOpen={isRescheduleModalOpen}
          setIsRescheduleModalOpen={setIsRescheduleModalOpen}
          rescheduleLoading={rescheduleLoading}
          rescheduleError={rescheduleError}
          rescheduleSuccess={rescheduleSuccess}
          appointmentActionLoading={appointmentActionLoading}
          appointmentActionError={appointmentActionError}
          appointmentActionSuccess={appointmentActionSuccess}
          caseDetail={caseDetail}
          refreshCaseDetails={refreshCaseDetails}
        />
      )}
      {activeTab === "analytics" && (
        <AnalyticsTab caseId={caseDetail?._id} />
      )}
    </div>
  );
};

export default TabContent;
