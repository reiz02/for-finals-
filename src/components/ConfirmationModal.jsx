import React from "react";
import "./ConfirmationModal.css";
import { FiAlertCircle } from "react-icons/fi";

/**
 * Reusable Confirmation Modal Component
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {string} props.title - Modal title (default: "Confirm Action")
 * @param {string} props.message - Modal message/description
 * @param {string} props.employeeName - Employee name/details to display in confirmation
 * @param {string} props.actionType - Type of action ("deactivate", "reactivate", or "update")
 * @param {function} props.onConfirm - Callback when Confirm button is clicked
 * @param {function} props.onCancel - Callback when Cancel button is clicked
 * @param {boolean} props.isLoading - Show loading state on confirm button
 */
function ConfirmationModal({
  isOpen,
  title = "Confirm Action",
  message,
  employeeName,
  actionType = "deactivate",
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  if (!isOpen) return null;

  const isDeactivate = actionType === "deactivate";
  const isDelete = actionType === "delete";
  const isUpdate = actionType === "update";
  
  // Determine button colors based on action type
  let confirmButtonColor = "#d62828"; // Default red for deactivate/delete
  let confirmButtonHoverColor = "#b81c1c";
  let confirmButtonClass = "deactivate";
  let confirmButtonLabel = "Delete";
  
  if (isUpdate) {
    confirmButtonColor = "#57bc90"; // Green for update
    confirmButtonHoverColor = "#46a67e";
    confirmButtonClass = "update";
    confirmButtonLabel = "Update";
  } else if (isDeactivate) {
    confirmButtonLabel = "Deactivate";
  } else if (actionType === "reactivate") {
    confirmButtonColor = "#16a34a"; // Green for reactivate
    confirmButtonHoverColor = "#15803d";
    confirmButtonClass = "reactivate";
    confirmButtonLabel = "Reactivate";
  } else if (isDelete) {
    confirmButtonLabel = "Delete";
    confirmButtonClass = "delete";
  }

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal-content">
        {/* Header with Icon */}
        <div className="modal-header">
          <div className={`modal-icon ${actionType}`}>
            <FiAlertCircle size={28} />
          </div>
          <h2 className="modal-title">{title}</h2>
        </div>

        {/* Body with Employee Name */}
        <div className="modal-body">
          <p className="modal-message">{message}</p>
          {employeeName && (
            <div className="employee-name-box">
              <span className="employee-label">{isUpdate ? "Details:" : "Employee:"}</span>
              <span className="employee-name">{employeeName}</span>
            </div>
          )}
        </div>

        {/* Footer with Buttons */}
        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={`btn-confirm ${confirmButtonClass}`}
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              backgroundColor: confirmButtonColor,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = confirmButtonHoverColor;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = confirmButtonColor;
            }}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              confirmButtonLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
