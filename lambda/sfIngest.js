const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const sqs = new SQSClient({});

exports.handler = async (event) => {
  console.log("Incoming request:", JSON.stringify(event));

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON" })
    };
  }

  if (!body.tenantId || !body.sfEventId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing tenantId or sfEventId" })
    };
  }

  const message = {
    tenantId: body.tenantId,
    sfEventId: body.sfEventId,
    operation: body.operation || "CREATE",
    source: "SALESFORCE"
  };

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.SYNC_QUEUE_URL,
      MessageBody: JSON.stringify(message)
    })
  );

  return {
    statusCode: 202,
    body: JSON.stringify({ status: "queued" })
  };
};
