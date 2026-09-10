"use client";

export function getClientId(): string {
  if (typeof window === 'undefined') {
    return 'server-ssr';
  }
  
  let clientId = localStorage.getItem('redflag_client_id');
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem('redflag_client_id', clientId);
  }
  return clientId;
}
