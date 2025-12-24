import { DatabaseConfig } from '../../src/interfaces/databaseConfig';
import { config } from '../../src/config';
import { Ad } from '../../src/interfaces/ad';

const dbConfig: DatabaseConfig = {
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    host: config.DB_HOST,
    port: config.DB_PORT,
    dbName: config.DB_NAME
};

async function run() {

    const findResponse = await fetch(`http://${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}/_find`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${dbConfig.user}:${dbConfig.password}`).toString('base64')}`
        },
        body: JSON.stringify({
            selector: {
                Portal: {
                    $type: 'string'
                }
            }
        })
    });

    const findData = await findResponse.json();
    const docs = findData.docs;

    if (docs.length === 0) {
        console.log('No documents found');
        return;
    }

    console.log(`Found ${docs.length} documents`);

    const updatedDocs = docs.map((doc: Ad) => ({
        ...doc,
        Portal: {
            Type: doc.Portal,
            Url: ''
        }
    }));

    const bulkResponse = await fetch(`http://${dbConfig.host}:${dbConfig.port}/${dbConfig.dbName}/_bulk_docs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${dbConfig.user}:${dbConfig.password}`).toString('base64')}`
        },
        body: JSON.stringify({ docs: updatedDocs })
    });

    const bulkResult = await bulkResponse.json();

    const errors = bulkResult.filter((r: any) => r.error);
    if (errors.length) {
        console.error("Errores en la actualización:", errors);
    } else {
        console.log("Successful updated");
    }

}

run().catch(console.error);