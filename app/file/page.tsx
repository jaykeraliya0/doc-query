"use client";

const Page = () => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/upload-pdf", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit} className="h-screen w-screen">
      <div>
        <label htmlFor="pdf">Upload PDF: </label>
        <input
          type="file"
          id="pdf"
          accept="application/pdf"
          name="pdf"
          className="border border-gray-200 p-2 bg-gray-50 w-fit"
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white p-2 rounded-md">
        Upload
      </button>
    </form>
  );
};

export default Page;
