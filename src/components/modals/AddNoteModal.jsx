import React from "react";
import { X, RefreshCw } from "lucide-react";

const AddNoteModal = ({ 
  isOpen, 
  onClose, 
  noteForm, 
  setNoteForm, 
  onSubmit, 
  loading, 
  error, 
  success 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4">Add Note</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray