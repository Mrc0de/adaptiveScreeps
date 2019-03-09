module.exports.loop = function () {
    // Bring out yer dead...
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            if ( Memory.creeps[name].miningSpot != null ) {
                // Release their old miningSpot assignment 
                let oldMiningSpotId = Memory.creeps[name].miningSpot.id;
                for(var s in Game.spawns) {
                    for (var r in Game.spawns[s].memory.eSourceRoster) {
                        if ( Game.spawns[s].memory.eSourceRoster[r] == oldMiningSpotId ) {
                            Game.spawns[s].memory.eSourceRoster[r] = null;
                            console.log('Fired Harvester ' + name + '. They were dead.');
                            break;
                        }
                    }
                }
            }
            delete Memory.creeps[name];
            console.log('Buried ' + name + '. They were dead.');
        }
    }
    
    //load requires
    var _ = require('lodash');
    var spAdaptive = require('spawnAdaptive.sp');
    var roleAdaptive = require('role.adaptiveScreep');
    var utilz = require('adaptiveUtils.inc');
    
    //Towers
    for(var r in Game.rooms ) {
        var roomTowers = Game.rooms[r].find(FIND_MY_STRUCTURES, { filter: (structure) => { return ( structure.structureType == STRUCTURE_TOWER )} } );
        var roomLinks = Game.rooms[r].find(FIND_MY_STRUCTURES, { filter: (structure) => { return ( structure.structureType == STRUCTURE_LINK )} } );
        var roomCreeps = Game.rooms[r].find(FIND_MY_CREEPS);
        let roomCreep;
        for ( c in roomCreeps) {
            roomCreep = roomCreeps[c];
            break;
        }
        for (var t in roomTowers) {
            //Repairs
            if ( utilz.findRepairOpportunity(roomCreep) != 'none' ) {
                var repTarget = utilz.findRepairOpportunity(roomCreep);
                var repResult = roomTowers[t].repair(repTarget);
                if (repResult == ERR_NOT_ENOUGH_RESOURCES ) {
                    console.log("TOWER NEEDS ENERGY");
                } else if ( repResult == OK ) {
                    console.log("TOWER REPAIR");
                } else {
                    console.log("TOWER REPAIR ERROR => " + repResult);
                }
            }
            //Hostiles
            var closestHostile = roomTowers[t].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                roomTowers[t].attack(closestHostile);
                console.log("Tower Attacking Hostiles!");
            }
        }
        let destLink;
        let fromLink;
        for ( var l in roomLinks ) {
            if ( roomLinks[l].pos.findInRange(FIND_MY_STRUCTURES, 2,{filter: {structureType: STRUCTURE_CONTROLLER}}).length > 0 ) {
                //console.log( roomLinks[l].id + " is a Controller Link Target");
                destLink = roomLinks[l];
                if ( fromLink != null && fromLink.energy > 100 && destLink.energy <  (destLink.energyCapacity - fromLink.energy) ) {
                    var tpResult = fromLink.transferEnergy(destLink);
                    if ( tpResult != OK ) {
                        console.log("Link: " + fromLink.id + " Xfer to Link: " + destLink.id + " Result was " + tpResult );
                    }
                }
            } else {
                if ( roomLinks[l].energy > 100 && destLink != null && destLink.energy < (destLink.energyCapacity - roomLinks[l].energy) ) {
                    console.log(roomLinks[l].id + " can send to "+ destLink.id );
                    fromLink = roomLinks[l];
                    var tpResult = fromLink.transferEnergy(destLink);
                    if ( tpResult != OK ) {
                        console.log("Link: " + fromLink.id + " Xfer to Link: " + destLink.id + " Result was " + tpResult );
                    }
                } else if(roomLinks[l].energy > 100 ) { 
                     //console.log(roomLinks[l].id + " can send except -> DEST_UNKNOWN");
                     fromLink = roomLinks[l];
                }
            }
        }
    }
    
    //creepLoop 
    for(var c in Game.creeps) {
        var cr = Game.creeps[c];
        roleAdaptive.run(cr);
    }
    
    // spawn loop
    // Every Spawn In the Game(mine)
    for(var s in Game.spawns) {
        spAdaptive.run(Game.spawns[s]);
    }
    
}