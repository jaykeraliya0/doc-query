import * as libre from "libreoffice-convert";

const acceptedFiles = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default async function converter(formData: FormData) {
  "use server";
  console.log("In action");

  const file = formData.get("file") as File;

  if (!file || !acceptedFiles.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a .docx file.");
  }

  const extend = "pdf";

  const fileBuffer = await file
    .arrayBuffer()
    .then((buffer) => Buffer.from(buffer));

  const pdfBuffer = libre.convert(
    fileBuffer,
    extend,
    undefined,
    (err, done) => {
      if (err) {
        console.log(`Error converting file: ${err}`);
      }

      const buffer = Buffer.from(done);
      console.log("File converted successfully");
      console.log(buffer);
      return buffer;
    }
  );
}
