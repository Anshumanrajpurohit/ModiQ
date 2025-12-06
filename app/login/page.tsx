import { redirect } from "next/navigation";

export default function LoginPage() {
  redirect("/sign-in?redirect_url=/auth/complete");
}
