import { AuthTabs } from "@/components/auth/auth-tabs";
import { SignInForm } from "./sign-in-form";

export default function AnmeldenPage() {
  return (
    <div>
      <AuthTabs />
      <SignInForm />
    </div>
  );
}
