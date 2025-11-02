# Export database from one Mongo to another

This guide explains how to migrate a MongoDB database from one Atlas cluster to another using `mongodump` and `mongorestore`.

## Prerequisites

- MongoDB Database Tools installed on your system
- Access credentials for both source and destination MongoDB Atlas clusters
- Your IP address must be whitelisted in the MongoDB Atlas security settings for both clusters

## Steps

### 1. Export Database (mongodump)

First, export the database from the source MongoDB Atlas cluster:

```bash
mongodump --uri "mongodb+srv://<username>:<password>@<source-cluster>.mongodb.net/<database-name>" --out ./backup/sourceDB
```

**What this does:**
- Connects to the source MongoDB Atlas cluster
- Exports all data from the `fudfarmerDB` database
- Saves the backup to `./backup/sourceDB` directory

### 2. Import Database (mongorestore)

Next, restore the database to the destination MongoDB Atlas cluster:

```bash
mongorestore --uri="mongodb+srv://<username>:<password>@<destination-cluster>.mongodb.net/<database-name>" ./backup/sourceDB/<database-name>
```

**What this does:**
- Connects to the destination MongoDB Atlas cluster
- Restores all records from the specified backup directory
- Imports data into the `fudfarmerDB` database in the destination cluster

## Important Notes

1. **Network Access**: Ensure your IP address is whitelisted in MongoDB Atlas Network Access settings for both clusters
2. **Credentials**: Replace the placeholders in the connection strings:
   - `<username>`: Your MongoDB Atlas username
   - `<password>`: Your MongoDB Atlas password
   - `<source-cluster>`: Source cluster hostname (e.g., `fudfarm.b7du48k`)
   - `<destination-cluster>`: Destination cluster hostname (e.g., `fudfarmer.nbrhtln`)
   - `<database-name>`: Name of your database (e.g., `fudfarmerDB`)
3. **Database Name**: Make sure the database name matches in both source and destination
4. **Backup Directory**: The backup will be created in `./backup/sourceDB/<database-name>`

## Troubleshooting

- If you get connection errors, verify your IP is whitelisted in Atlas
- If authentication fails, check your username and password
- Ensure MongoDB Database Tools are installed: `mongodump --version`
