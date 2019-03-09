// The Adaptive Screep (No Permanent Role, limited only by body types)

// Notes:
// If a harvester becomes FULL, and build opportunities exists, it becomes a builder, freeing up a harvester assignment
// If a worker becomes an upgrader, it stays an upgrader until stored energy is depleted.


module.exports = {
    run(creep) {
        // import functions
        var _ = require('lodash');
        var utilz = require('adaptiveUtils.inc');
        if ( creep.spawning) { return; }
        let eSourceList = Game.rooms[creep.room.name].find(FIND_SOURCES);
        
        // init memory
        if (!creep.memory.bLoading) { creep.memory.bLoading = false; } //boolean for builders who are energyLoading
        if (!creep.memory.rLoading) { creep.memory.rLoading = false; } //boolean for repairers who are energyLoading
        if (!creep.memory.uLoading) { creep.memory.uLoading = false; } //boolean for upgraders who are energyLoading
        if (!creep.memory.bodyType) { creep.memory.bodyType = utilz.detectBodyType(creep); } //will be worker if not recognized type                                                
        if (!creep.memory.role) { creep.memory.role = utilz.determineRole(creep); } //returns standby if nothing to do (huddle)
        if ( creep.memory.bodyType == 'worker' ) {
            // workers can harvest, build, upgrade, repair and build new structure
            // Choose role if 'standby' is active
            if ( creep.memory.role == 'standby' ) {
                // try to find role
                if ( _.sum(creep.carry) > 0 ) {
                    // full 
                    // This probably should never happen in standby
                    // If we do, a harvest or builder was full, but had nothing to build and didnt need an upgrader or repairs
                    // In this case, assume role STORE (stow the energy in NonFull storage)
                    creep.say('STBYload');
                    if ( utilz.findStorageNotFull(creep) != 'none') {
                        creep.memory.role = 'store';
                    } else if ( utilz.findRepairOpportunity(creep) != 'none' ) {
                        creep.memory.role = 'repair';
                    } else {
                        creep.memory.role = 'upgrade';
                    }
                } else {
                    // not full
                    // check for empty source mining spot (and become miner if one exists)
                    if ( utilz.findHarvestOpportunity(creep) != 'none' && _.sum(creep.carry) < creep.carryCapacity ) {
                        creep.memory.role = 'harvest';
                    } else if ( utilz.findBuildOpportunity(creep) != 'none' && (utilz.findStorageNotEmpty(creep) != 'none' || _.sum(creep.carry) > 0 ) ) { //assume we are empty, so we need nonEmpty stores to proceed as builder
                        creep.memory.role = 'build';
                    }  else if ( utilz.findRepairOpportunity(creep) != 'none' && (utilz.findStorageNotEmpty(creep) != 'none' || _.sum(creep.carry) > 0) ) { //assume we are empty, so we need nonEmpty stores to proceed as repairer
                        creep.memory.role = 'repair';
                    } else if ( utilz.findStorageNotEmpty(creep) != 'none' || _.sum(creep.carry) > 0  ) {
                        creep.memory.role = 'upgrade';
                    }
                }
                if ( creep.memory.role == 'standby' ) {
                    //We are still in standby, go huddle
                    let flagList = creep.room.find( FIND_FLAGS );
                    if ( flagList.length > 0 ) {
                        let huddleZone = utilz.chooseClosest(flagList,creep);
                        creep.moveTo(huddleZone);
                    }
                }
            } else if ( creep.memory.role == 'harvest' ) {
                /////////////////
                //// HARVEST ROLE
                /////////////////
                if (!creep.memory.miningSpot && utilz.findHarvestOpportunity(creep) != 'none' ) { 
                    creep.memory.miningSpot = utilz.findHarvestOpportunity(creep);
                    let s = creep.room.find(FIND_MY_SPAWNS);
                    for (var z in s) { s=s[z];break;}
                    s.memory.eSourceRoster.push(creep.memory.miningSpot.id);
                } else if ( !creep.memory.miningSpot && utilz.findHarvestOpportunity(creep) == 'none'  ) {
                    creep.memory.role = 'standby';
                }
                if ( _.sum(creep.carry) == creep.carryCapacity ) {
                    // full
                    creep.say('FULLload');
                    // if no upgraders exist, become an upgrader
                    let numUps = creep.room.find(FIND_MY_CREEPS,{ filter: { memory: {role:"upgrade"}}} ).length;
                    let numBuilders = creep.room.find(FIND_MY_CREEPS,{ filter: { memory: {role:"build"}}} ).length;
                    let numReppers = creep.room.find(FIND_MY_CREEPS,{ filter: { memory: {role:"repair"}}} ).length;
                    if ( creep.pos.findInRange(FIND_MY_STRUCTURES, 3, {filter: {structureType: STRUCTURE_LINK} }).length > 0 ) {
                        let linkDump = creep.pos.findInRange(FIND_MY_STRUCTURES, 3, {filter: {structureType: STRUCTURE_LINK}});
                        let dumpResult = creep.transfer(linkDump[0], RESOURCE_ENERGY);
                        if ( dumpResult != OK ) {
                            console.log(creep.name + " dump Result was " + dumpResult);
                        }
                    }
                    console.log("# Upgraders: " + numUps + " # Builders: "+ numBuilders + " # Repairers: " + numReppers);
                    if (numUps < 1) {
                        // This comes first because its an emergency, the rest are in else branch of this condition
                        creep.memory.role = 'upgrade';
                        // resign mining spot assignment
                        let oldMiningSpotId = creep.memory.miningSpot.id;
                        creep.memory.miningSpot = null;
                        let s = creep.room.find(FIND_MY_SPAWNS);
                        for (var z in s) { s=s[z];break;}
                        for (var r in s.memory.eSourceRoster) {
                            if ( s.memory.eSourceRoster[r] == oldMiningSpotId ) {
                                s.memory.eSourceRoster[r] = null;
                                break;
                            }
                        }
                    } else if (numBuilders < 1) {
                        // This comes first because its an emergency, the rest are in else branch of this condition
                        creep.memory.role = 'build';
                        // resign mining spot assignment
                        let oldMiningSpotId = creep.memory.miningSpot.id;
                        creep.memory.miningSpot = null;
                        let s = creep.room.find(FIND_MY_SPAWNS);
                        for (var z in s) { s=s[z];break;}
                        for (var r in s.memory.eSourceRoster) {
                            if ( s.memory.eSourceRoster[r] == oldMiningSpotId ) {
                                s.memory.eSourceRoster[r] = null;
                                break;
                            }
                        }
                    } else if (numReppers < 1) {
                        // This comes first because its an emergency, the rest are in else branch of this condition
                        creep.memory.role = 'repair';
                        // resign mining spot assignment
                        let oldMiningSpotId = creep.memory.miningSpot.id;
                        creep.memory.miningSpot = null;
                        let s = creep.room.find(FIND_MY_SPAWNS);
                        for (var z in s) { s=s[z];break;}
                        for (var r in s.memory.eSourceRoster) {
                            if ( s.memory.eSourceRoster[r] == oldMiningSpotId ) {
                                s.memory.eSourceRoster[r] = null;
                                break;
                            }
                        }
                    } else {
                        // if build ops exist, become a builder
                        if ( utilz.findBuildOpportunity(creep) != 'none') {
                            creep.memory.role = 'build';
                            // resign mining spot assignment
                            let oldMiningSpotId = creep.memory.miningSpot.id;
                            creep.memory.miningSpot = null;
                            let s = creep.room.find(FIND_MY_SPAWNS);
                            for (var z in s) { s=s[z];break;}
                            for (var r in s.memory.eSourceRoster) {
                                if ( s.memory.eSourceRoster[r] == oldMiningSpotId ) {
                                    s.memory.eSourceRoster[r] = null;
                                    break;
                                }
                            }
                        } else if ( utilz.findRepairOpportunity(creep) != 'none') {
                            creep.memory.role = 'repair';
                            // resign mining spot assignment
                            let oldMiningSpotId = creep.memory.miningSpot.id;
                            creep.memory.miningSpot = null;
                            let s = creep.room.find(FIND_MY_SPAWNS);
                            for (var z in s) { s=s[z];break;}
                            for (var r in s.memory.eSourceRoster) {
                                if ( s.memory.eSourceRoster[r] == oldMiningSpotId ) {
                                    s.memory.eSourceRoster[r] = null;
                                    break;
                                }
                            }
                        } else if ( utilz.findStorageNotFull(creep) != 'none') {
                            // otherwise, store energy in ext or container (or similar)
                            creep.memory.role = 'store';
                            // resign mining spot assignment
                            let oldMiningSpotId = creep.memory.miningSpot.id;
                            creep.memory.miningSpot = null;
                            let s = creep.room.find(FIND_MY_SPAWNS);
                            for (var z in s) { s=s[z];break;}
                            for (var r in s.memory.eSourceRoster) {
                                if ( s.memory.eSourceRoster[r] == oldMiningSpotId ) {
                                    s.memory.eSourceRoster[r] = null;
                                    break;
                                }
                            }
                        } else {
                            //can always upgrade. do this if we cant store or use it
                            creep.memory.role = 'upgrade';
                            // resign mining spot assignment
                            let oldMiningSpotId = creep.memory.miningSpot.id;
                            creep.memory.miningSpot = null;
                            let s = creep.room.find(FIND_MY_SPAWNS);
                            for (var z in s) { s=s[z];break;}
                            for (var r in s.memory.eSourceRoster) {
                                if ( s.memory.eSourceRoster[r] == oldMiningSpotId ) {
                                    s.memory.eSourceRoster[r] = null;
                                    break;
                                }
                            }
                        }
                        
                    }
                } else {
                    if ( creep.memory.miningSpot ) {
                        let spot = Game.getObjectById(creep.memory.miningSpot.id);
                        let hResult = creep.harvest(spot);
                        if ( hResult == ERR_NOT_IN_RANGE ) {
                            creep.moveTo(spot);
                        } else if ( hResult == ERR_NOT_ENOUGH_RESOURCES ) {
                            creep.say("waiting");
                        }
                    }
                }
                /////////////////////
                //// END HARVEST ROLE
                /////////////////////
            } else if ( creep.memory.role == 'build' ) {
                /////////////////
                //// BUILD ROLE
                /////////////////
                if ( _.sum(creep.carry) > 0 && !creep.memory.bLoading && utilz.findBuildOpportunity(creep) != 'none' ) {
                    // Not empty yet
                    let buildThis = utilz.findBuildOpportunity(creep);
                    let bResult = creep.build(buildThis);
                    if ( bResult == ERR_NOT_IN_RANGE ) {
                        creep.moveTo(buildThis);
                    }
                } else {
                    //we are empty find a new job ONLY if no more build ops exist (or we cant find stored energy)
                    if ( utilz.findBuildOpportunity(creep) == 'none') {
                        creep.memory.role = 'standby';
                    } else {
                        //find energy storage or go standby
                        if ( utilz.findStorageNotEmpty(creep) != 'none' || _.sum(creep.carry) > 0) {
                            let loadAt = utilz.findStorageNotEmpty(creep);
                            let loadResult = creep.withdraw(loadAt, RESOURCE_ENERGY);
                            if( loadResult == ERR_NOT_IN_RANGE ) {
                                creep.moveTo(loadAt);
                            } else if ( loadResult != OK && loadResult != -7) {
                                console.log(creep.name + ": E-Withdraw Result was " + loadResult);
                            } else if ( loadResult == -7 ) {
                                creep.memory.bLoading = false;
                                console.log(creep.name + ": E-Withdraw Failed, moving on...");
                            } else if ( loadResult == OK && _.sum(creep.carry) < creep.carryCapacity ) {
                                creep.memory.bLoading = true;
                            } else {
                                creep.memory.bLoading = false;
                            }
                            if ( _.sum(creep.carry) == creep.carryCapacity ) {
                                creep.memory.bLoading = false;
                            }
                        } else {
                            creep.memory.role = 'standby';
                        }
                    }
                }
                ///////////////////
                //// END BUILD ROLE
                ///////////////////
            } else if ( creep.memory.role == 'repair' ) {
                if ( _.sum(creep.carry) > 0 && !creep.memory.rLoading && utilz.findRepairOpportunity(creep) != 'none') {
                    // Not empty yet
                    let repairThis = utilz.findRepairOpportunity(creep);
                    let rResult = creep.repair(repairThis);
                    if ( rResult == ERR_NOT_IN_RANGE ) {
                        creep.moveTo(repairThis);
                    }
                } else {
                    //we are empty find a new job ONLY if no more repair ops exist (or we cant find stored energy)
                    if ( _.sum(creep.carry) == creep.carryCapacity ) {
                        creep.memory.rLoading = false;
                    }
                    if ( utilz.findRepairOpportunity(creep) == 'none') {
                        creep.memory.role = 'standby';
                    } else {
                        //find energy storage or go standby
                        if ( utilz.findStorageNotEmpty(creep) != 'none' ) {
                            let loadAt = utilz.findStorageNotEmpty(creep);
                            let loadResult = creep.withdraw(loadAt, RESOURCE_ENERGY);
                            if( loadResult == ERR_NOT_IN_RANGE ) {
                                creep.moveTo(loadAt);
                            } else if ( loadResult != OK ) {
                                console.log(creep.name + ": E-Withdraw Result was " + loadResult);
                            }
                            if ( loadResult == OK && _.sum(creep.carry) < creep.carryCapacity ) {
                                creep.memory.rLoading = true;
                            } else if ( _.sum(creep.carry) == creep.carryCapacity ) {
                                creep.memory.rLoading = false;
                            }
                        } else {
                            creep.memory.role = 'standby';
                        }
                    }
                }
            } else if ( creep.memory.role == 'upgrade' ) {
                /////////////////
                //// UPGRADE ROLE
                /////////////////
                if ( _.sum(creep.carry) > 0 && !creep.memory.uLoading ) {
                    //console.log(creep.name + ": Upgrading - Carrying -> " + _.sum(creep.carry) );
                    let ctrl = creep.room.controller;
                    let upResult = creep.upgradeController(ctrl);
                    if ( upResult == ERR_NOT_IN_RANGE ) {
                        creep.moveTo(ctrl);
                    } else if ( upResult != OK ) {
                        console.log(creep.name + ": Upgrade Result was " + upResult);
                    }
                } else {
                    //find energy storage or go standby
                    if ( _.sum(creep.carry) == creep.carryCapacity ) {
                        creep.memory.uLoading = false;
                    }
                    //first look for a link with energy near the controller
                    let roomLinks = creep.room.controller.pos.findInRange(FIND_MY_STRUCTURES, 3, { filter: (structure) => { return ( structure.structureType == STRUCTURE_LINK && structure.energy > 0 )} } );
                    if ( roomLinks.length > 0 ) {
                        //console.log("Controller has a nearby Link with Energy.");
                        let linkSrc = roomLinks[0];
                        let loadResult = creep.withdraw(linkSrc, RESOURCE_ENERGY);
                        if( loadResult == ERR_NOT_IN_RANGE ) {
                            creep.moveTo(linkSrc);
                        } else if ( loadResult != OK ) {
                            console.log(creep.name + ": ELink-Withdraw Result was " + loadResult);
                        }
                    } else if ( utilz.findStorageNotEmpty(creep) != 'none' ) {
                        let loadAt = utilz.findStorageNotEmpty(creep);
                        let loadResult = creep.withdraw(loadAt, RESOURCE_ENERGY);
                        if( loadResult == ERR_NOT_IN_RANGE ) {
                            creep.moveTo(loadAt);
                        } else if ( loadResult != OK ) {
                            console.log(creep.name + ": E-Withdraw Result was " + loadResult);
                        }
                        if ( loadResult == OK && _.sum(creep.carry) < creep.carryCapacity ) {
                            creep.memory.uLoading = true;
                        } else if ( _.sum(creep.carry) == creep.carryCapacity ) {
                            creep.memory.uLoading = false;
                        }
                    } else {
                        creep.memory.role = 'standby';
                    }
                }
                /////////////////////
                //// END UPGRADE ROLE
                /////////////////////
            } else if ( creep.memory.role == 'store' ) {
                /////////////////
                //// STORE ROLE
                /////////////////
                if ( _.sum(creep.carry) > 0 ) {
                    //console.log(creep.name + ": Store - Carrying -> " + _.sum(creep.carry) );
                    let stor = utilz.findStorageNotFull(creep);
                    if ( stor != 'none' ) {
                        let stResult = creep.transfer(stor,RESOURCE_ENERGY);
                        if ( stResult == ERR_NOT_IN_RANGE ) {
                            creep.moveTo(stor);
                        } else if ( stResult == ERR_FULL ) {
                            console.log(creep.name + ": This Storage is full!");
                            creep.memory.role = 'standby';
                        } else if ( stResult != OK ) {
                            console.log(creep.name + ": Store Result was " + stResult);
                        }
                    }
                } else {
                    //we are empty find a new job
                    creep.memory.role = 'standby';
                }
                ///////////////////
                //// END STORE ROLE
                ///////////////////
            }
            //creep.say(creep.memory.role);
            /////////////////////////
            // END OF WORKER BODYTYPE
            /////////////////////////
        } if ( creep.memory.bodyType == 'soldier' ) {
            // soldiers can fight, but cannot carry
            // soldiers are primarily defensive
        } if ( creep.memory.bodyType == 'scout' ) {
            // scouts claim new sectors
        } if ( creep.memory.bodyType == 'invader' ) {
            // armed scouts for claiming inhabited sectors
        }
    }
};