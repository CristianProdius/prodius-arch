import { useNavigate } from "react-router";
import { Button } from "@/components/ui/Button";

export const meta = () => [
  { title: "404 — Page Not Found | Roomify" },
  { name: "description", content: "The page you're looking for doesn't exist." },
];

export default function NotFoundRoute() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <span className="not-found-code">404</span>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Button onClick={() => navigate("/")} className="not-found-cta">
        Back to Home
      </Button>
    </div>
  );
}
