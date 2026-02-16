import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),
  route("visualizer/:id", "./routes/visualizer.$id.tsx"),
  route("profile", "./routes/profile.tsx"),
  route("settings", "./routes/settings.tsx"),
  route("auth/signin", "./routes/auth.signin.tsx"),
  route("auth/signup", "./routes/auth.signup.tsx"),
  route("api/auth/*", "./routes/api.auth.$.ts"),
  route("api/projects/*", "./routes/api.projects.$.ts"),
  route("api/settings", "./routes/api.settings.ts"),
  route("api/render", "./routes/api.render.ts"),
  route("api/upload", "./routes/api.upload.ts"),
  route("*", "./routes/404.tsx"),
] satisfies RouteConfig;
