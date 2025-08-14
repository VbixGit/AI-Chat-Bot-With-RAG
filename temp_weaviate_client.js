
const weaviate = require('weaviate-ts-client');

async function getSchema() {
  const client = weaviate.default.client({
    scheme: 'https',
    host: process.env.WEAVIATE_ENDPOINT,
    apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY),
  });

  try {
    const schema = await client.schema.getter().do();
    console.log(JSON.stringify(schema, null, 2));
  } catch (err) {
    console.error(err);
  }
}

getSchema();
