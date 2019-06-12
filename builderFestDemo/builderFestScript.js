// Download the shell helper

// Unpack
unzip ProvendbShell.zip
// (Optional) Copy to path

// Set an environment variable for your shell
export PROVENDB_URI=
export PROVENDB_DB=
//
//Launch the shell (Mac/Linux)
provendbShell.sh $PROVENDB_URI
//Launch the shell (Windows)
provendbShell %PROVENDB_URI%


// Look at the accounts collection
db.accounts.find({},{transactions:0});
db.accounts.findOne({name:'Guy'})
// See the current version
db.getVersion();
// Look at last few versions
db.listVersions(3);
// Set the version to an older version 
db.setVersion(4);
// See database at this point
db.accounts.findOne({name:'Guy'});
// Try to change history 
db.accounts.update({name:'Guy'},{balance:10000});
// See the blockchain proof for whole database 
db.getProof(4);
// Get a document proof 
db.getDocumentProof('accounts',{name:'Guy'},4);
// Verify the proof
db.verifyProof(4)

//Load some files into your proxy using mongofiles:
mongofiles --uri=$PROVENDB_URI --db=$PROVENDB_DB put builderFestScript.js
2019-06-12T17:07:41.318+1000	connected to: localhost
2019-06-12T17:07:41.320+1000	added file: builderFestScript.js

// See that it's all there 
ProvenDB v4816 (current)> db.hideMetaData()
{ "ok" : 1 }
ProvenDB v4816 (current)> db.fs.files.find({},{filename:1})
{ "_id" : ObjectId("5d00a4bd5781eb2f84428034"), "filename" : "builderFestScript.js" }

// submit a proof
ProvenDB v4816 (current)> db.submitProof()
{
	"ok" : 1,
	"version" : NumberLong(4816),
	"dateTime" : ISODate("2019-06-12T07:11:31Z"),
	"hash" : "58a36598c8c0904f5b8427b10e691625b6a72f15f1624579853177b094c4e6ee",
	"proofId" : "4dc001b0-8ce1-11e9-a57b-013b674fdf54",
	"status" : "Pending"
}
// Your files are proven on the blockchain!!!!