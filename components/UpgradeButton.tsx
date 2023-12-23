"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useMutation } from "react-query";

const UpgradeButton = () => {
  const { mutate: createStripeSession } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/create-stripe-session");
      const { url } = await res.json();
      return url;
    },
    onSuccess: (url) => {
      window.location.href = url ?? "/dashboard/billing";
    },
  });

  return (
    <Button onClick={() => createStripeSession()} className="w-full">
      Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />
    </Button>
  );
};

export default UpgradeButton;
