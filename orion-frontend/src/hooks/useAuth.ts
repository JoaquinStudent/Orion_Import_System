"use client";

// La sesión vive en un store global (AuthProvider). Este re-export mantiene el
// import `@/hooks/useAuth` que ya usan layout y páginas.
export { useAuth } from "@/components/providers/AuthProvider";
