#!/bin/bash
/*
# provendbShell - wrapper around mongo shell for Provendb

# Copyright (C) 2019  Southbank Software Ltd.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
# @Author: Guy Harrison
#
*/

/* eslint no-var: 0 */
/* eslint no-unused-vars: 0 */

/* eslint prefer-arrow-callback: 0 */
/* eslint object-shorthand: 0 */
/* eslint vars-on-top: 0 */
/* eslint prefer-destructuring: 0 */
/* eslint no-loop-func: 0 */

/* eslint no-plusplus: 0 */

var provendbShell = {};


provendbShell.init = (pdb) => {
    // Get bulk load status
    pdb.bulkLoadStatus = () => {
        return (pdb.runCommand({
            bulkLoad: 'status'
        }));
    };

    // Start a bulk load
    pdb.bulkLoadStart = () => {
        return (pdb.runCommand({
            bulkLoad: 'start'
        }));
    };

    // Stop a bulk load
    pdb.bulkLoadStop = () => {
        return (pdb.runCommand({
            bulkLoad: 'stop'
        }));
    };

    // Kill a bulk load
    pdb.bulkLoadKill = () => {
        return (pdb.runCommand({
            bulkLoad: 'kill'
        }));
    };

    // Wrapper around compact
    pdb.compact = (...args) => {
        const usage = 'Usage: pdb.compact(startVersion,endVersion)';
        if (args.length !== 2) {
            return usage;
        }
        const compactArgs = {
            compact: {
                startVersion: args[0],
                endVersion: args[1]
            }
        };
        if (provendbShell.debug) {
            printjson(compactArgs);
        }
        return pdb.runCommand(compactArgs);
    };

    // Get current version
    pdb.currentVersion = () => {
        var cv = db
            .getCollection('_provendb_currentVersion')
            .findOne();
        var now = new Date();
        printjson(cv);
        if (cv.started) {
            var started = new Date(cv.started.t * 1000);
            print('started time', started, (now - started) / 1000, 'sec ago');
        }
        if (cv.valid) {
            var valid = new Date(cv.valid.t * 1000);
            print('valid time', valid, (now - valid) / 1000, 'sec ago');
        }
    };

    // Return the db object
    pdb.db = () => {
        return db;
    };

    // Wrapper around docHistory
    pdb.docHistory = (collection, filter) => {
        return (pdb.runCommand({
            docHistory: {
                collection,
                filter
            }
        }));
    };

    // Execute a forget
    pdb.executeForget = (...args) => {
        const usage = 'Usage: db.executeForget(forgetId,password)';
        if (args.length !== 2) {
            return usage;
        }
        const forgetId = args[0];
        const password = args[1];
        const forgetArgs = {
            forget: {
                execute: {
                    forgetId,
                    password
                }
            }
        };
        if (provendbShell.debug) {
            printjson(forgetArgs);
        }
        return pdb.runCommand(forgetArgs);
    };

    // Wrapper around document proof
    pdb.getDocumentProof = (...args) => {
        const usage = 'pdb.getDocumentProof(collection,filter[,version,format])';
        let format = 'binary';
        let version = 0;

        if (args.length < 2 || args.length > 4) {
            return usage;
        }
        if (args.length > 3) {
            format = args[3];
        }

        if (args.length > 2) {
            version = args[2];
        } else {
            version = pdb
                .runCommand({
                    getVersion: 1
                })
                .version + 0;
        }
        const collection = args[0];
        const filter = args[1];
        const getDocumentProofArgs = {
            getDocumentProof: {
                collection,
                filter,
                version,
                format
            }
        };
        if (provendbShell.debug) {
            printjson(getDocumentProofArgs);
        }
        return pdb.runCommand(getDocumentProofArgs);
    };

    // Wrapper arond getProof
    pdb.getProof = (...args) => {
        const usage = 'Usage: pdb.getProof(proofId|versionNo[,"binary"|"json",listCollections(true|false)])';
        let format = 'binary';
        const getProofsArgs = {};
        let listCollections = false;
        if (args.length > 2) {
            listCollections = args[2];
        }
        if (args.length > 1) {
            format = args[1];
        }
        if (args.length === 0) {
            return usage;
        }
        const proofId = args[0];
        getProofArgs = {
            getProof: proofId,
            format,
            listCollections
        };
        if (provendbShell.debug) {
            printjson(getProofArgs);
        }
        return pdb.runCommand(getProofArgs);
    };

    pdb.proofStatus = () =>{
        const output = {};
        db.getCollection('_provendb_versionProofs')
          .find({}, {})
          .forEach((p) => {
            // print(p.status);
            if (!(p.status in output)) {
              output[p.status] = 1;
            } else {
              output[p.status] += 1;
            }
          });
        return output;
    }

    // Get a proof for a particular verison
    pdb.getProofForVersion = (versionId) => {
        const gp4v = db
            .getCollection('_provendb_versionProofs')
            .find({
                versionId: {
                    $gte: versionId
                }
            })
            .sort({
                submitted: 1
            })
            .limit(1);
        return (gp4v);
    };

    // Get either the effective version or a version for a date
    pdb.getVersion = (versionDate) => {
        let returnObj = {};
        if (versionDate) { // turn input date into timestamp
            const myTimestamp = new Timestamp(Math.round(versionDate / 1000), 0);
            const versionData = pdb
                .getCollection('_provendb_versions').find({
                    ended: {
                        $lt: myTimestamp
                    }
                }, {
                    version: 1,
                    _id: 0
                }).sort({
                    ended: -1
                }).limit(1).toArray();
            if (versionData.length === 0) {
                returnObj = {
                    ok: 1,
                    response: 'No version for date ' + versionDate,
                    version: null,
                    status: 'No version'
                };
            } else {
                returnObj = {
                    ok: 1,
                    response: 'Version current at ' + versionDate,
                    version: versionData[0].version,
                    status: 'History'
                };
            }
        } else {
            returnObj = pdb.runCommand({
                getVersion: 1
            });
        }
        return returnObj;
    };

    // hide metadata
    pdb.hideMetaData = () => {
        return pdb.runCommand({
            showMetaData: false
        });
    };

    // Change the log level
    pdb.logLevel = (level) => {
        return (pdb.runCommand({
            'setLogLevel': level
        }));
    };

    // List most recent proofs
    pdb.listProofs = (limit) => {
        if (!limit) {
            limit = 1;
        }
        return pdb
            .getCollection('_provendb_versionProofs')
            .find({}, {
                _id: 0,
                hash: 0,
                proof: 0,
                details: 0
            })
            .sort({
                submitted: -1
            })
            .limit(limit)
            .pretty();
    };

    // List provendb commands
    pdb.listProvenDBCommands = () => {
        return pdb.runCommand({
            listProvenDBCommands: 1
        });
    };

    // Wrapper around listStorage
    pdb.listStorage = () => {
        return pdb.runCommand({
            listStorage: 1
        });
    };

    // Wrapper around listVersions
    pdb.listVersions = (...args) => {
        const usage = 'db.listVersions([startDate,endDate,limit,sortDirection])';
        let sortDirection = -1;
        let limit = 10;
        let endDate = new Date();
        let startDate = new Date(new Date() - (10 * 365 * 24 * 3600 * 1000));
        const output = [];
        let listVersionsDoc = {};
        if (args.length > 5) {
            return usage;
        }
        if (args.length === 1 && typeof args[0] === 'number') {
            listVersionsDoc = {
                limit: args[0]
            };
        } else {
            if (args.length > 3) {
                sortDirection = args[3];
            }
            if (args.length > 2) {
                limit = args[2];
            }
            if (args.length > 1) {
                endDate = args[1];
            }
            if (args.length > 0) {
                startDate = args[0];
            }
            listVersionsDoc = {
                startDate,
                endDate,
                limit,
                sortDirection
            };
        }
        return (db.runCommand({
            listVersions: listVersionsDoc
        }));
    };

    // wrapper around showMetadata
    pdb.metadata = (metadata) => {
        pdb.runCommand({
            'showMetadata': metadata
        });
    };

    // Prepare a forget
    pdb.prepareForget = (...args) => {
        const usage = 'Usage: pdb.prepareForget(collection,filter [,minVersion,maxVersion,inclusiveRang' +
            'e(true|false)])';
        if (args.length < 2 || args.length > 5) {
            return usage;
        }
        const collection = args[0];
        const filter = args[1];

        const forgetArgs = {
            forget: {
                prepare: {
                    collection,
                    filter
                }
            }
        };
        if (args.length > 2) {
            forgetArgs.forget.prepare.minVersion = args[2];
        }
        if (args.length > 3) {
            forgetArgs.forget.prepare.maxVersion = args[3];
        }
        if (args.length > 4) {
            forgetArgs.forget.prepare.inclusiveRange = args[4];
        }
        if (provendbShell.debug) {
            printjson(forgetArgs);
        }
        return pdb.runCommand(forgetArgs);
    };

    // Wrapper around rollback
    pdb.rollback = () => {
        return db.runCommand({
            rollback: 1
        });
    };

    // Set version to current
    pdb.setCurrent = () => {
        return db
            .runCommand({
                setVersion: 'current'
            })
            .version + 0;
    };

    // set the effective version
    pdb.setVersion = (version) => {
        if (!version) {
            version = 'current';
        }
        return db
            .runCommand({
                setVersion: version
            });
    };

    // show metadata
    pdb.showMetaData = () => {
        return pdb.runCommand({
            showMetaData: true
        });
    };

    // submit a proof
    pdb.submitProof = (...args) => {
        // submitProof([version],[argsDocument]) Examples:    submitProof()   - submit
        // current version    submitProof(23) - submit version 23
        // submitProof({collections:'foo'}) - current version collection foo
        // submitProof({23,{collections:'foo}}) - version 23, collection: foo
        //
        let submitArgs = {
            submitProof: 0
        };
        const usage = 'Usage: pdb.submitProof([version],[argumentsDocument])';
        if (args.length === 0) { // No arguments so submit Proof for current version
            submitArgs = {
                submitProof: pdb.pdbVersion()
            };
        } else if (args.length === 1) { // One argument
            if (typeof args[0] === 'object') { // Single argument is a document
                submitArgs.submitProof = pdb.pdbVersion(); // Use current version
                Object.assign(submitArgs, args[0]);
            } else if (typeof args[0] === 'number') { // Single argument is a number
                submitArgs.submitProof = args[0];
            } else {
                print(usage); // Invalid usage
                return null;
            }
        } else if (args.length === 2) { // Two arguments
            if (typeof args[1] !== 'object' || typeof args[0] !== 'number') {
                print(usage);
                return null;
            }
            submitArgs.submitProof = args[0];
            Object.assign(submitArgs, args[1]);
        } else {
            print(usage);
            return null;
        }
        if (provendbShell.debug) {
            printjson(submitArgs);
        }
        return pdb.runCommand(submitArgs);
    };

    // Wrapper around verify proof
    pdb.verifyProof = (...args) => {
        const usage = 'db.verifyProof([proofId|versionId,format])';
        let versionId;
        let proofId;
        let format = 'binary';

        if (args.length > 2) return usage;
        if (args.length > 0) {
            if (typeof args[0] === 'number') { // We have been supplied with a version, not a proofId
                proofId = pdb.bestProofForVersion(args[0]);
                if (proofId === null) return 'No proof exists';
            } else { // First argument is a proof id
                proofId = args[0];
            }
        }
        if (args.length > 1) format = args[1];
        return pdb.runCommand({
            verifyProof: proofId,
            format
        });
    };

    // Return best proof for a version
    pdb.bestProofForVersion = (versionId) => {
        const proofs = db.getCollection('_provendb_versionProofs').find({
            version: versionId,
            status: 'valid',
            scope: {
                $ne: 'collection'
            }
        }).sort({
            submitted: 1
        }).limit(1).toArray();
        if (proofs.length === 0) {
            return null;
        }
        return proofs[0].proofId;
    };

    pdb.pdbVersion = () => {
        const rc = pdb.getVersion();
        if ('version' in rc) {
            return rc.version + 0;
        }
        return rc;
    };

    pdb.closestProofForVersion = (versionId) => {
        const closestProof = db.getCollection('_provendb_versionProofs').find({
            version: {
                $gte: versionId
            },
            status: 'valid'
        }, {
            proofId: 1
        }).sort({
            version: 1
        }).limit(1).toArray();
        if (closestProof.length > 0 && 'proofId' in closestProof[0]) {
            // looks good
            return closestProof[0].proofId;
        } // Use that closest proof

        return null;
    };
};

provendbShell.debug = false;
provendbShell.init(db);

// Redefine the shell prompt
var prompt = () => {
    var myPrompt;
    var status;
    var cv = db.runCommand({
        getVersion: 1
    });
    if (cv.status === 'userDefined') {
        status = 'history';
    } else {
        status = cv.status;
    }

    myPrompt = 'ProvenDB v' + cv.version + ' (' + status + ')> ';

    return myPrompt;
};
