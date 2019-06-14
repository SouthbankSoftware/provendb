# MongoDB World 2019 Builder Fest demo

## Setup

1. Make sure you have a MongoDB shell in your path -version 3.6 or higher
2. Download the ProvenDB Shell helpers from https://rebrand.ly/g5jtok
3. Unpack shell helpers and copy files into your path
4. Set an environment variable for your URI

    On Unix/Linux:
    ```
        export BID=NN # Where NN is your builder ID (01, 02, ...)
        
        export PDB_DB=tst_f$BID
        export PDB_URI=mongodb://fest:fest@provendb_tst_f$BID.provendb.io/$PDB_DB?ssl=true
  	```
           
    On Windows:
    

    
	```
        REM Where NN is your builder ID (01, 02, ...)
        
        set BID=NN
        set PDB_DB=tst_f%BID%
        set PDB_URI=mongodb://fest:fest@provendb_tst_f%BID%.provendb.io/%PDB_DB%?ssl=true
	```


5. Connect to your service:
    *   On Windows
            ```provendbShell %PDB_URI%```
    *   On Mac/Linux:   
            ```provendbShell.sh $PDB_URI```
            OR
            ```./provendbShell.sh $PDB_URI```            

## Exploring ProvenDB

There is sample data installed which you can examine.  The following examples use the mongo commands.  See [here](https://github.com/SouthbankSoftware/provendb/blob/master/builderFestDemo/builderFestDemo.md) for a version using the provendbShell. 

Take a look at the accounts collection:

```javascript
> db.accounts.find({},{transactions:0})
{ "_id" : ObjectId("5d009971ccfe48e1d252fd5d"), "name" : "Guy", "balance" : 8500 }
{ "_id" : ObjectId("5d009971ccfe48e1d252fd5e"), "name" : "Mike", "balance" : 11500 }
> db.accounts.find({name:'Guy'}).pretty()
{
        "_id" : ObjectId("5d009971ccfe48e1d252fd5d"),
        "name" : "Guy",
        "balance" : 8500,
        "transactions" : [
                {
                        "timestamp" : ISODate("2019-06-12T06:19:30.380Z"),
                        "to" : "Mike",
                        "amount" : 5000,
                        "comment" : "loan"
                },
                {
                        "timestamp" : ISODate("2019-06-12T06:19:35.110Z"),
                        "from" : "Mike",
                        "amount" : 2500,
                        "comment" : "repayment"
                },
                {
                        "timestamp" : ISODate("2019-06-12T06:19:36.765Z"),
                        "from" : "Mike",
                        "amount" : 1000,
                        "comment" : "repayment"
                }
```

ProvenDB is versioned database.  You can see the current version as follows:

```javascript
> db.runCommand({getVersion:1})
{
        "ok" : 1,
        "response" : "The version is set to: 'current'",
        "version" : NumberLong(12),
        "status" : "current"
}
```
Lets look at the last few versions
```javascript
> db.runCommand({listVersions:{limit:3}})
{
	"ok" : 1,
	"versions" : [
		{
			"version" : NumberLong(18),
			"status" : "Ended",
			"effectiveDate" : ISODate("2019-06-14T03:39:34Z")
		},
		{
			"version" : NumberLong(17),
			"status" : "Ended",
			"effectiveDate" : ISODate("2019-06-14T03:39:34Z")
		},
		{
			"version" : NumberLong(16),
			"status" : "Ended",
			"effectiveDate" : ISODate("2019-06-14T02:24:46Z")
		}
	]
}

```
Set the version to an older version 
```javascript
> db.runCommand({setVersion:4})
{
	"ok" : 1,
	"response" : "The version has been set to: '4'",
	"version" : NumberLong(4),
	"status" : "userDefined"
}
```
See database at this point
```javascript
> db.accounts.findOne({name:'Guy'});
{
        "_id" : ObjectId("5d009971ccfe48e1d252fd5d"),
        "name" : "Guy",
        "balance" : 5000,
        "transactions" : [
                {
                        "timestamp" : ISODate("2019-06-12T06:19:30.380Z"),
                        "to" : "Mike",
                        "amount" : 5000,
                        "comment" : "loan"
                }
        ]
}
```
 Try to change history 
 ```javascript
> db.accounts.update({name:'Guy'},{balance:10000});
WriteCommandError({
        "ok" : 0,
        "n" : 0,
        "nModified" : 0,
        "writeErrors" : [
                {
                        "index" : 0,
                        "code" : 50000,
                        "errmsg" : "Session not current"
                }
        ]
})
```
See the blockchain proof for whole database 
```javascript
> db.runCommand({getProof:4,format:'binary'})
{
	"ok" : 1,
	"proofs" : [
		{
			"proofId" : "0bfc8b10-8cda-11e9-a57b-01ae91ab539e",
			"version" : NumberLong(4),
			"submitted" : ISODate("2019-06-12T06:19:34Z"),
			"hash" : "81043696bf38b57feb6a417328c12d5816085e7b3765523d01a1016b8ccdf39d",
			"scope" : "database",
			"status" : "Valid",
			"details" : {
				"protocol" : {
					"name" : "chainpoint",
					"uri" : "http://35.235.91.33",
					"hashIdNode" : "0bfc8b10-8cda-11e9-a57b-01ae91ab539e",
					"chainpointLocation" : "https://c.chainpoint.org/calendar/3364152/data"
				},
				"btcTxn" : "647e9cf991e1a2187d284f929707ad16ee8cfbb0c26a64410925007536c75546",
				"btcTxnReceived" : "2019-06-12T07:00:01.933Z",
				"btcTxnConfirmed" : "2019-06-12T07:09:08Z",
				"btcBlock" : "580353"
			},
			"proof" : BinData(0,"eJytVs1uZUcRhlfgGbKM .... 0sqPWlZqavk0bGf/BQI9M9k=")
		}

```
Get a  proof for a single document
```javascript
> db.runCommand({getDocumentProof:{collection:'accounts',filter:{name:'Guy'},version:4,format:'binary'}})
{
	"ok" : 1,
	"proofs" : [
		{
			"collection" : "accounts",
			"version" : NumberLong(4),
			"provenDbId" : ObjectId("5d009971ccfe48e1d252fd5d"),
			"documentId" : ObjectId("5d009971ccfe48e1d252fd5d"),
			"versionProofId" : "0bfc8b10-8cda-11e9-a57b-01ae91ab539e",
			"status" : "Valid",
			"btcTransaction" : "647e9cf991e1a2187d284f929707ad16ee8cfbb0c26a64410925007536c75546",
			"btcBlockNumber" : "580353",
			"documentHash" : "5877270c9049226f5787b94e61d6617154cb5cea73106b2ac22b0915427f04a2",
			"versionHash" : "81043696bf38b57feb6a417328c12d5816085e7b3765523d01a1016b8ccdf39d",
			"proof" : BinData(0,"eJysV8+u3slRhVfgGbIcj6u6urqq7soS...2j/+DH/NEx9+9IdME/8dAAD//xE9WD4=")
		}
	]
}
>
```
Verify the proof agains the blockchain:
```javascript
> db.runCommand({getProof:4,format:'binary'})
{
	"ok" : 1,
	"proofs" : [
		{
			"proofId" : "0bfc8b10-8cda-11e9-a57b-01ae91ab539e",
			"version" : NumberLong(4),
			"submitted" : ISODate("2019-06-12T06:19:34Z"),
			"hash" : "81043696bf38b57feb6a417328c12d5816085e7b3765523d01a1016b8ccdf39d",
			"scope" : "database",
			"status" : "Valid",
			"details" : {
				"protocol" : {
					"name" : "chainpoint",
					"uri" : "http://35.235.91.33",
					"hashIdNode" : "0bfc8b10-8cda-11e9-a57b-01ae91ab539e",
					"chainpointLocation" : "https://c.chainpoint.org/calendar/3364152/data"
				},
				"btcTxn" : "647e9cf991e1a2187d284f929707ad16ee8cfbb0c26a64410925007536c75546",
				"btcTxnReceived" : "2019-06-12T07:00:01.933Z",
				"btcTxnConfirmed" : "2019-06-12T07:09:08Z",
				"btcBlock" : "580353"
			},
			"proof" : BinData(0,"eJytVs1uZUcRhlfgGb ... PWlZqavk0bGf/BQI9M9k=")
		}
	]
}
> db.runCommand({verifyProof:"0bfc8b10-8cda-11e9-a57b-01ae91ab539e",format:'binary'})
{
	"ok" : 1,
	"version" : NumberLong(4),
	"dateTime" : ISODate("2019-06-14T04:16:52.829Z"),
	"hash" : "81043696bf38b57feb6a417328c12d5816085e7b3765523d01a1016b8ccdf39d",
	"proofId" : "0bfc8b10-8cda-11e9-a57b-01ae91ab539e",
	"proofStatus" : "Valid",
	"btcTransaction" : "647e9cf991e1a2187d284f929707ad16ee8cfbb0c26a64410925007536c75546",
	"btcBlockNumber" : "580353",
	"proof" : BinData(0,"eJytVs1uZUcRhlfgGbKMx9V/...PWlZqavk0bGf/BQI9M9k=")
}
```

## Load up some files

Lets use mongofiles to load something into the database:

In Mac or Linux:

```
$ mongofiles --sslAllowInvalidCertificates  --uri=$PDB_URI --db=$PDB_DB  put provendbShell.js
2019-06-13T09:19:56.880+1000    connected to: localhost
2019-06-13T09:19:56.881+1000    added file: provendbShell.js
```
On Windows:

```
C:\Users\guy\Downloads>mongofiles --sslAllowInvalidCertificates  --uri=%PDB_URI% --db=%PDB_DB%  put provendbShell.js
2019-06-14T13:39:33.315+1000    connected to: localhost
2019-06-14T13:39:33.316+1000    added file: provendbShell.js
```

(Use --sslAllowInvalidCertificates if you get an "error dialing" - its a mongofiles error)

Connect to your service

On Windows

	
	provendbShell %PDB_URI%



    
            
            
On Mac/Linux:  
``` 
    
    provendbShell.sh $PDB_URI
OR
   ./provendbShell.sh $PDB_URI    
```        


See that the data is inserted: 

```javascript
>  db.fs.files.find({},{filename:1})
{ "_id" : ObjectId("5d01889c038db4dfe9037037"), "filename" : "provendbShell.js" }
```
Submit a proof - your file is now on the blockchain!

```javascript
> db.runCommand({setVersion:'current'})
{
	"ok" : 1,
	"response" : "The version has been set to: 'current'",
	"version" : NumberLong(18),
	"status" : "current"
}
> db.runCommand({submitProof:18})
{
	"ok" : 1,
	"version" : NumberLong(18),
	"dateTime" : ISODate("2019-06-14T04:18:29Z"),
	"hash" : "d4b0b30d7674b27811a0d66185e7069fa06dca7779d9ba11b934ffc4a92f54ed",
	"proofId" : "7664dac0-8e5b-11e9-a57b-0141c9984a62",
	"status" : "Pending"
}
```





