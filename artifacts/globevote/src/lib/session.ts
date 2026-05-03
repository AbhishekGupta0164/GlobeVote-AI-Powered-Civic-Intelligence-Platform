export function getSessionId(): string {
  let sessionId = localStorage.getItem("gv_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    localStorage.setItem("gv_session_id", sessionId);
  }
  return sessionId;
}
