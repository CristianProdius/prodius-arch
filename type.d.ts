interface Material {
  id: string;
  name: string;
  thumbnail: string;
  type: "color" | "texture";
  category: "floor" | "wall" | "furniture";
}

interface RenderHistoryEntry {
  id: string;
  renderedImage: string;
  timestamp: number;
  style?: string;
}

type StylePreset = "modern" | "classic" | "minimalist" | "industrial" | "scandinavian";
type LightingOption = "daylight" | "evening" | "studio" | "dramatic";
type QualityLevel = "draft" | "standard" | "high";

interface RenderOptions {
  style: StylePreset;
  lighting: LightingOption;
  quality: QualityLevel;
}

interface UserSettings {
  theme: "light" | "dark" | "system";
  defaultStyle: StylePreset;
  defaultQuality: QualityLevel;
}

interface DesignHistoryItem {
  id: string;
  name?: string | null;
  sourceImage: string;
  sourcePath?: string | null;
  renderedImage?: string | null;
  renderedPath?: string | null;
  publicPath?: string | null;
  timestamp: number;
  ownerId?: string | null;
  sharedBy?: string | null;
  sharedAt?: string | null;
  isPublic?: boolean;
  tags?: string[];
  renderHistory?: RenderHistoryEntry[];
}

interface DesignConfig {
  floor: string;
  walls: string;
  style: string;
}

enum AppStatus {
  IDLE = "IDLE",
  UPLOADING = "UPLOADING",
  PROCESSING = "PROCESSING",
  READY = "READY",
}

type RenderCompletePayload = {
  renderedImage: string;
  renderedPath?: string;
};

type VisualizerLocationState = {
  initialImage?: string;
  initialRender?: string | null;
  ownerId?: string | null;
  name?: string | null;
  sharedBy?: string | null;
};

interface VisualizerProps {
  onBack: () => void;
  initialImage: string | null;
  onRenderComplete?: (payload: RenderCompletePayload) => void;
  onShare?: (image: string) => Promise<void> | void;
  onUnshare?: (image: string) => Promise<void> | void;
  onRename?: (name: string) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
  onDuplicate?: () => Promise<void> | void;
  projectName?: string;
  projectId?: string;
  initialRender?: string | null;
  isPublic?: boolean;
  sharedBy?: string | null;
  canUnshare?: boolean;
  renderHistory?: RenderHistoryEntry[];
  onRenderHistoryUpdate?: (history: RenderHistoryEntry[]) => void;
}

interface UploadProps {
  onComplete: (base64File: string) => Promise<boolean | void> | boolean | void;
  className?: string;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

type AuthContext = {
  isSignedIn: boolean;
  userName: string | null;
  userId: string | null;
  refreshAuth: () => Promise<boolean>;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<boolean>;
  settings: UserSettings;
  updateSettings: (s: Partial<UserSettings>) => Promise<void>;
};

type AuthRequiredModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
};

type ShareAction = "share" | "unshare";
type ShareStatus = "idle" | "saving" | "done";

interface StoreHostedImageParams {
  hosting: HostingConfig | null;
  url: string;
  projectId: string;
  label: "source" | "rendered";
}
