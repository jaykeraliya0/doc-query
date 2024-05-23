import converter from "@/lib/converter";
import React from "react";

const TempPage = () => {
  return (
    <div>
      <form action={converter}>
        <input type="file" name="file" />
        <button type="submit">submit</button>
      </form>
    </div>
  );
};

export default TempPage;
