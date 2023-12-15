"use client";

interface Props {
  isCurrentPlan: boolean;
}

const Subscribe = ({ isCurrentPlan }: Props) => {
  const handleSubscribe = async () => {
    const res = await fetch("/api/create-stripe-session", {
      method: "GET",
    });

    const { url } = await res.json();
    window.location.href = url;
  };

  return (
    <button
      onClick={handleSubscribe}
      className="bg-blue-600 text-white p-3 disabled:opacity-70"
    >
      {isCurrentPlan ? "Manage" : "Subscribe"}
    </button>
  );
};

export default Subscribe;
