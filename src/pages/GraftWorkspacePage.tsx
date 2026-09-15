import { Navigate } from "react-router-dom";

/** Session reconstructions stay on /graft. A /graft/:id URL is not stored. */
export function GraftWorkspacePage() {
  return <Navigate to="/graft" replace />;
}
