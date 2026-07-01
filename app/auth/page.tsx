import { redirect } from "next/navigation";
import { normalizeAuthNext } from "@/lib/auth/auth-flow";

type AuthPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    next?: string | string[];
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const loginParams = new URLSearchParams();
  const next = Array.isArray(params.next) ? params.next[0] : params.next;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  loginParams.set("next", normalizeAuthNext(next));
  if (error) loginParams.set("error", error);

  redirect(`/login?${loginParams.toString()}`);
}
