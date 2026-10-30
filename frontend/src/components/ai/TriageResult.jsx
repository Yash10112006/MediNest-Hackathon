import React from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
} from "lucide-react";

const TriageResult = ({ result }) => {
  // No result yet
  if (!result) {
    return (
      <div className="triage-result pending">
        <div className="triage-header">
          <Activity size={28} />

          <div>
            <span className="triage-label">
              TRIAGE RESULT
            </span>

            <h2>Assessment not started</h2>
          </div>
        </div>

        <p className="triage-description">
          Describe your symptoms to begin the preliminary
          health assessment.
        </p>
      </div>
    );
  }

  // =========================================================
  // ASSESSMENT STILL IN PROGRESS
  // =========================================================

  if (result.is_complete === false) {
    return (
      <div className="triage-result pending">

        <div className="triage-header">

          <Activity size={28} />

          <div>
            <span className="triage-label">
              TRIAGE RESULT
            </span>

            <h2>Assessment in Progress</h2>
          </div>

        </div>

        <p className="triage-description">
          MediNest is collecting more information before
          providing a preliminary urgency assessment.
        </p>

        {result.next_question && (
          <div className="next-question">
            <strong>Next Question</strong>

            <p>
              {result.next_question}
            </p>
          </div>
        )}

      </div>
    );
  }

  // =========================================================
  // GET TRIAGE LEVEL
  // =========================================================

  const level = (
    result.triage_level ||
    result.level ||
    "green"
  ).toLowerCase();

  // =========================================================
  // CONFIDENCE
  // =========================================================

  const confidence = Math.round(
    (result.confidence ?? 0) * 100
  );

  // =========================================================
  // REASON
  // =========================================================

  const reason =
    result.reason ||
    "No immediate warning signs detected.";

  // =========================================================
  // TRIAGE CONFIGURATION
  // =========================================================

  const config = {

    green: {
      title: "Low Risk",
      icon: CheckCircle,

      description:
        "No immediate warning signs detected. Continue monitoring.",
    },

    yellow: {
      title: "Moderate Risk",
      icon: AlertTriangle,

      description:
        "Medical evaluation may be needed.",
    },

    red: {
      title: "High Risk",
      icon: AlertTriangle,

      description:
        "Urgent medical attention may be required.",
    },

    emergency: {
      title: "Emergency",
      icon: XCircle,

      description:
        "Possible medical emergency. Immediate medical attention is required.",
    },
  };

  const current =
    config[level] || config.green;

  const Icon = current.icon;

  return (
    <div className={`triage-result ${level}`}>

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="triage-header">

        <Icon size={28} />

        <div>

          <span className="triage-label">
            TRIAGE RESULT
          </span>

          <h2>
            {current.title}
          </h2>

        </div>

      </div>

      {/* ===================================================
          DESCRIPTION
      =================================================== */}

      <p className="triage-description">
        {current.description}
      </p>

      {/* ===================================================
          CONFIDENCE
      =================================================== */}

      <div className="confidence-section">

        <div className="confidence-header">

          <strong>
            AI Confidence
          </strong>

          <strong>
            {confidence}%
          </strong>

        </div>

        <div className="confidence-bar">

          <div
            className="confidence-fill"
            style={{
              width: `${confidence}%`,
            }}
          />

        </div>

      </div>

      {/* ===================================================
          REASON
      =================================================== */}

      <div className="reason-section">

        <h4>
          WHY?
        </h4>

        <p>
          {reason}
        </p>

      </div>

      {/* ===================================================
          RECOMMENDED ACTION
      =================================================== */}

      {result.action && (
        <div className="action-section">

          <h4>
            RECOMMENDED ACTION
          </h4>

          <p>
            {result.action}
          </p>

        </div>
      )}

    </div>
  );
};

export default TriageResult;