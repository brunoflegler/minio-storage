require("dotenv").config();

const aws = require("aws-sdk");
const { promisify } = require("util");
const fs = require("fs");

const storage = new aws.S3({
  endpoint: `http://${process.env.STORAGE_HOST}:${process.env.STORAGE_PORT}`,
  s3ForcePathStyle: true, // needed with minio?
  signatureVersion: "v4",
  accessKeyId: process.env.STORAGE_ACCESS_KEY,
  secretAccessKey: process.env.STORAGE_SECRET_KEY,
  useSSL: false
});

const getFileDir = async file => {
  const read = promisify(fs.readFile).bind(fs);
  const data = await read(file);
  //console.log("data", data);
  return data;
};

const getBuckets = async () => {
  const listBuckets = promisify(storage.listBuckets).bind(storage);
  const buckets = await listBuckets();
  console.log(buckets);
};

//getBuckets();

const getObject = async params => {
  const fGetObject = promisify(storage.getObject).bind(storage);
  const file = await fGetObject(params);

  console.log(file);
};

//getObject({ Bucket: "bucket", Key: "index.js" });

const putObject = async (params, path) => {
  console.log(params);
  const putObject = promisify(storage.putObject).bind(storage);
  await putObject({
    ...params,
    Body: await getFileDir(`${path}/${params.Key}`)
  });
};

putObject(
  {
    Bucket: "bucket",
    Key: "file.js",
    Tagging: "key1=value1&key2=value2"
  },
  "./tmp"
);

/**
 * https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
 */
