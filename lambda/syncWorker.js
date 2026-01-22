exports.handler = async (event) => {
  console.log('Received SQS event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const messageBody = JSON.parse(record.body);
    console.log('Processing message:', messageBody);

    // Simulate processing (real sync logic comes later)
    console.log(
      `Tenant: ${messageBody.tenantId}, SF Event: ${messageBody.sfEventId}, Operation: ${messageBody.operation}`
    );
  }

  // If no error is thrown, Lambda considers messages successfully processed
  return;
};
