import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),
  route("visualizer/:id", "./routes/visualizer.$id.tsx"),
  route("profile", "./routes/profile.tsx"),
  route("settings", "./routes/settings.tsx"),
  route("*", "./routes/404.tsx"),
] satisfies RouteConfig;
