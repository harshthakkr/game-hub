import { googleSignIn } from "@/app/actions/auth";
import Image from "next/image";
import { Button } from "@/components/ui";

export const SignIn = ({
  label = "SIGN UP WITH GOOGLE",
  callbackUrl = "/games",
}: {
  label?: string;
  callbackUrl?: string;
}) => {
  return (
    <form action={googleSignIn.bind(null, callbackUrl)}>
      <Button type="submit" variant="primary" size="lg">
        <Image
          width={20}
          height={20}
          src="/google-logo.svg"
          alt=""
          className="size-5 shrink-0"
        />
        {label}
      </Button>
    </form>
  );
};
