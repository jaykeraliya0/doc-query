"use client";

interface Props {
  fileId: string;
}

const ChatWrapper = ({ fileId }: Props) => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = new FormData(e.currentTarget).get("message");

    const res = await fetch("/api/message", {
      method: "POST",
      body: JSON.stringify({
        fileId,
        message,
      }),
    });
    console.log(res);
    const resp = await res.text();
    console.log(resp);
  };

  return (
    <form
      className="flex flex-col justify-between h-full"
      onSubmit={handleSubmit}
    >
      <div>
        <textarea
          name="message"
          id="message"
          className="border border-gray-300 p-2"
        />
      </div>
      <div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          type="submit"
        >
          Send
        </button>
      </div>
    </form>
  );
};

export default ChatWrapper;
