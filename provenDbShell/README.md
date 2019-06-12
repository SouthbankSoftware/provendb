# ProvenDB shell helpers 

The ProvenDB shell helpers are wrappers around the mongo shell executable which provide easier access to ProvenDB commands.

The shell helpers add methods to the default `db` connection object that correspond to ProvenDB commands that would otherwise need to be invoked via `db.runCommand()` calls. 

Without the shell helper:

```javascript
> db.runCommand({getProof:'8f606be0-8364-11e9-a57b-01ee7d1a26c0',format:'binary'})
{
	"ok" : 1,
	"proofs" : [
		{
			"proofId" : "8f606be0-8364-11e9-a57b-01ee7d1a26c0",
			"version" : NumberLong(7745),
			"submitted" : ISODate("2019-05-31T05:25:53Z"),
```
With the shell helper:

```javascript
ProvenDB v7753 (current)> db.getProof('8f606be0-8364-11e9-a57b-01ee7d1a26c0')
{
	"ok" : 1,
	"proofs" : [
		{
			"proofId" : "8f606be0-8364-11e9-a57b-01ee7d1a26c0",
			"version" : NumberLong(7745),
			"submitted" : ISODate("2019-05-31T05:25:53Z"),
```
## Requirements

There must be a mongo shell binary in the path.  The mongo binary should be version 3.6 at least. 

## Installation

1. Unpack the contents of `provendbShell.zip` and copy all the files to a directory in the path.
2. On Windows invoke `provendbShell provendbUri`, where `provendbUri` is the URI for your ProvenDB service.
3. On Linux, make sure `provendbShell.sh` has been made executable.  Then invoke `provendbShell provendbUri.sh`, where `provendbUri` is the URI for your ProvenDB service.

## Documentation

Full documentation can be found at [https://provendb.readme.io/docs/shell-helper-commands](https://provendb.readme.io/docs/shell-helper-commands)

