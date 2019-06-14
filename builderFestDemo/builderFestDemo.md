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

There is sample data installed which you can examine.  The following examples use the shell helper commands.  If you are connecting directly with the mongo shell see [here](https://github.com/SouthbankSoftware/provendb/blob/master/builderFestDemo/builderFestDemoNoShell.md):

Take a look at the accounts collection:

```javascript
ProvenDB v12 (current)> db.accounts.find({},{transactions:0})
{ "_id" : ObjectId("5d009971ccfe48e1d252fd5d"), "name" : "Guy", "balance" : 8500 }
{ "_id" : ObjectId("5d009971ccfe48e1d252fd5e"), "name" : "Mike", "balance" : 11500 }
ProvenDB v12 (current)> db.accounts.find({name:'Guy'}).pretty()
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
ProvenDB v12 (current)> db.getVersion();
{
        "ok" : 1,
        "response" : "The version is set to: 'current'",
        "version" : NumberLong(12),
        "status" : "current"
}
```
Lets look at the last few versions
```javascript
ProvenDB v12 (current)> db.listVersions(3);
{
        "ok" : 1,
        "versions" : [
                {
                        "version" : NumberLong(12),
                        "status" : "Ended",
                        "effectiveDate" : ISODate("2019-06-12T11:58:49Z")
                },
                {
                        "version" : NumberLong(11),
                        "status" : "Ended",
                        "effectiveDate" : ISODate("2019-06-12T11:58:49Z")
                },
                {
                        "version" : NumberLong(10),
                        "status" : "Ended",
                        "effectiveDate" : ISODate("2019-06-12T08:58:46Z")
                }
        ]
}
```
Set the version to an older version 
```javascript
ProvenDB v12 (current)> db.setVersion(4);
{
        "ok" : 1,
        "response" : "The version has been set to: '4'",
        "version" : NumberLong(4),
        "status" : "userDefined"
}
```
See database at this point
```javascript
ProvenDB v4 (history)> db.accounts.findOne({name:'Guy'});
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
ProvenDB v4 (history)> db.accounts.update({name:'Guy'},{balance:10000});
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
ProvenDB v4 (history)> db.getProof(4);
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
                        "proof" : BinData(0,"eJytVs1uZUcRhlfgGbKMx9V/1VVeWWKHWLLKxqrq6saWBtuyb0JYDmzYZs ... BQI9M9k=")
                }
        ]
}
```
Get a  proof for a single document
```javascript
ProvenDB v4 (history)> db.getDocumentProof('accounts',{name:'Guy'},4);
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
                        "proof" : BinData(0,"eJysV8+u...E/8dAAD//xE9WD4=")
                }
        ]
}
```
Verify the proof agains the blockchain:
```javascript
ProvenDB v4 (history)> db.verifyProof(4)
{
        "ok" : 1,
        "version" : NumberLong(4),
        "dateTime" : ISODate("2019-06-12T23:08:27.263Z"),
        "hash" : "81043696bf38b57feb6a417328c12d5816085e7b3765523d01a1016b8ccdf39d",
        "proofId" : "0bfc8b10-8cda-11e9-a57b-01ae91ab539e",
        "proofStatus" : "Valid",
        "btcTransaction" : "647e9cf991e1a2187d284f929707ad16ee8cfbb0c26a64410925007536c75546",
        "btcBlockNumber" : "580353",
        "proof" : BinData(0,"eJytVs1uZUcRhlfgGbKMx9V/1VVeWWKHWLLKxqrq6saWBtuyb0JYDmzYZsEDhAxMiLJBQizzHo54GL5zbcaJ70VKpBxLlnV8urqqvp+qP395Pm6ud/PT3TeXu93t/dnp6e/LVby6ufvt6bi0q+vbm6vr3ekn5 ... cIeJtv2iFai1ICVjCqTM9ZGF+i6zwxnikkuguUZRsc14duXMV9uK1gonreVvzeh0sqPWlZqavk0bGf/BQI9M9k=")
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
ProvenDB v14 (current)>  db.fs.files.find({},{filename:1})
{ "_id" : ObjectId("5d01889c038db4dfe9037037"), "filename" : "provendbShell.js" }
```
Submit a proof - your file is now on the blockchain!

```javascript
ProvenDB v14 (current)> db.submitProof()
{
        "ok" : 1,
        "version" : NumberLong(14),
        "dateTime" : ISODate("2019-06-12T23:21:47Z"),
        "hash" : "b44868672c89c27f47adc66c8d4b4887417dd48c9f103b7082dd885288eccea8",
        "proofId" : "d9a3d9e0-8d68-11e9-a57b-0156b05d861f",
        "status" : "Pending"
}
```





