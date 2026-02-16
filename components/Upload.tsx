import { useEffect, useRef, useState } from "react";
import {
  Upload as UploadIcon,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { useOutletContext } from "react-router";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const Upload = ({ onComplete, className = "" }: UploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user } = useOutletContext<AuthContext>();
  const isSignedIn = !!user;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isSignedIn) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0])
      processFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) {
      e.currentTarget.value = "";
      return;
    }

    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  const processFile = (selectedFile: File) => {
    setError(null);

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File exceeds the 50 MB size limit.");
      return;
    }

    setFile(selectedFile);
    setProgress(0);

    // Convert to Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;

      // Simulate analysis progress
      let completed = false;
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = Math.min(prev + 15, 100);

          if (next === 100 && !completed) {
            completed = true;
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            const timeout = setTimeout(() => {
              (async () => {
                try {
                  const outcome = await onComplete(result);
                  if (outcome === false) {
                    setFile(null);
                    setProgress(0);
                  }
                } catch (error) {
                  console.error("Upload failed:", error);
                  setFile(null);
                  setProgress(0);
                }
              })();
            }, 600);
            timeoutRef.current = timeout;
          }

          return next;
        });
      }, 100);
      intervalRef.current = interval;
    };

    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className={`upload ${className}`}>
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`dropzone ${isDragging ? "is-dragging" : ""}`}
        >
          <input
            type="file"
            className="drop-input"
            onChange={handleFileSelect}
            accept=".jpg,.jpeg,.png"
            disabled={!isSignedIn}
          />

          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Click to upload or drag and drop"
                : "Sign in to upload"}
            </p>
            <p className="help">Maximum file size 50 MB.</p>
            {error && <p className="help" style={{ color: "#ef4444" }}>{error}</p>}
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>

            <h3>{file.name}</h3>

            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
            </div>

            <p className="status-text">
              {progress < 100 ? "Analyzing Floor Plan..." : "Redirecting..."}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Upload;
