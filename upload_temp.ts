import { objectStorageClient } from "./server/objectStorage";
import fs from "fs";
import path from "path";

async function main() {
  const privateDir = process.env.PRIVATE_OBJECT_DIR || "";
  if (!privateDir) {
    console.error("PRIVATE_OBJECT_DIR not set");
    process.exit(1);
  }

  const filePath = path.join(process.cwd(), "attached_assets/designarena_image_njh02j9f_(1)_1771458950639.png");
  const fileBuffer = fs.readFileSync(filePath);
  
  const objectName = "uploads/ialongo-photo.png";
  const fullPath = `${privateDir}/${objectName}`;
  
  const parts = fullPath.split("/");
  const bucketName = parts[0];
  const objName = parts.slice(1).join("/");
  
  const bucket = objectStorageClient.bucket(bucketName);
  const file = bucket.file(objName);
  
  await file.save(fileBuffer, {
    contentType: "image/png",
  });
  
  console.log("Uploaded to /objects/" + objectName);
}

main().catch(e => { console.error(e); process.exit(1); });
