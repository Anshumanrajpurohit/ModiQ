import { redirect } from "next/navigation";

export default function RegisterPage() {
  redirect("/sign-up?redirect_url=/auth/complete");
}
