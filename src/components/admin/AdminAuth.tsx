import { useEffect, useState } from "react";
import { Navigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export default function AdminAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  if (!loggedIn) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}